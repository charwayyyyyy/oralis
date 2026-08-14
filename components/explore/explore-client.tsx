'use client'

/**
 * components/explore/explore-client.tsx
 *
 * Client component containing all interactive explore logic:
 * atlas map, filters, search, and language cards.
 *
 * Receives `languages` as a prop from the Server Component (app/explore/page.tsx)
 * which fetches from DynamoDB.
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import ExploreWorldMap from './explore-world-map'
import {
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  formatSpeakers,
  type Language,
  type VitalityStatus,
} from '@/lib/data'

const CONTINENTS = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania']
const STATUSES: { value: string; label: string }[] = [
  { value: 'all',                   label: 'All statuses'          },
  { value: 'safe',                   label: 'Safe'                  },
  { value: 'vulnerable',             label: 'Vulnerable'            },
  { value: 'endangered',             label: 'Endangered'            },
  { value: 'critically-endangered',  label: 'Critically endangered' },
  { value: 'dormant',                label: 'Dormant'               },
]

const CONTINENT_NARRATIVES: Record<string, string> = {
  'Africa':   'Africa holds documented languages across a continent of extraordinary linguistic diversity with profound oral traditions.',
  'Americas': 'The Americas contain rich language systems, many belonging to isolated families found nowhere else on Earth.',
  'Asia':     'Asia\'s documented languages span from high plateaus to tropical archipelagos with deep historical literatures.',
  'Europe':   'Europe\'s indigenous languages include ancient Celtic, Uralic, and isolate Basque tongues.',
  'Oceania':  'Oceania represents extraordinary linguistic density per capita across islands and archipelagoes.',
}

function toXY(lat: number, lon: number) {
  return { x: ((lon + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 }
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  const [isInView, setIsInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true) },
      { threshold }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, threshold])
  return isInView
}

function LanguageCard({ lang, isActive, onHover, delay }: {
  lang: Language
  isActive: boolean
  onHover: (id: string | null) => void
  delay: number
}) {
  const ref    = useRef<HTMLAnchorElement>(null)
  const inView = useInView(ref as React.RefObject<HTMLElement>)
  const color  = VITALITY_STATUS_COLORS[lang.status] || '#C8A96B'

  return (
    <Link
      ref={ref}
      href={`/language/${lang.id}`}
      className={`group block glass-heavy rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-border/30 hover:border-gold/30 ${
        isActive ? 'ring-2 ring-gold shadow-lg -translate-y-1' : ''
      }`}
      onMouseEnter={() => onHover(lang.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        opacity:   inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${Math.min(delay, 300)}ms, transform 0.5s ease ${Math.min(delay, 300)}ms, box-shadow 0.3s ease`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-navy leading-tight group-hover:text-gold transition-colors">
            {lang.name}
          </h3>
          {lang.nativeName && (
            <p className="font-body text-sm text-stone/80 italic mt-0.5">{lang.nativeName}</p>
          )}
        </div>
        <span
          className="shrink-0 w-3 h-3 rounded-full mt-1.5 animate-glow-breathe"
          style={{
            backgroundColor: color,
            '--vitality-glow-intensity': (lang.vitalityScore ?? 0) < 20 ? '0.4' : '0.15',
            '--vitality-pulse-speed':    (lang.vitalityScore ?? 0) < 20 ? '1.5s' : '3s',
          } as React.CSSProperties}
          aria-label={VITALITY_STATUS_LABELS[lang.status] || lang.status}
        />
      </div>

      <div className="flex items-center gap-3 mb-4 font-ui text-xs text-stone/60">
        <span>{lang.country || 'Global'}</span>
        <span aria-hidden="true">·</span>
        <span>{formatSpeakers(lang.speakers ?? 0)}</span>
        <span aria-hidden="true">·</span>
        <span>{lang.continent || 'Global'}</span>
      </div>

      <div className="h-1.5 bg-border/40 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, lang.vitalityScore ?? 0))}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-ui text-xs font-semibold tracking-wide uppercase" style={{ color }}>
          {VITALITY_STATUS_LABELS[lang.status] || lang.status}
        </span>
        <span className="font-mono text-xs text-stone/50 font-medium">{lang.vitalityScore ?? 0}/100</span>
      </div>

      {lang.featuredPhrase && (
        <div className="mt-4 pt-4 border-t border-border/20">
          <p className="font-display text-sm italic text-navy/70 leading-snug">
            &ldquo;{lang.featuredPhrase.text}&rdquo;
          </p>
          <p className="font-ui text-xs text-stone/50 mt-1">{lang.featuredPhrase.translation}</p>
        </div>
      )}
    </Link>
  )
}

interface Props {
  languages: Language[]
}

export default function ExploreClient({ languages }: Props) {
  const [search,    setSearch]    = useState('')
  const [continent, setContinent] = useState('All')
  const [status,    setStatus]    = useState('all')
  const [sortBy,    setSortBy]    = useState<'vitality' | 'name' | 'speakers'>('vitality')
  const [hovered,   setHovered]   = useState<string | null>(null)

  const hasFiltersActive = search.trim() !== '' || continent !== 'All' || status !== 'all' || sortBy !== 'vitality'

  const clearAllFilters = () => {
    setSearch('')
    setContinent('All')
    setStatus('all')
    setSortBy('vitality')
  }

  // Calculate actual unique countries from data
  const uniqueCountriesCount = useMemo(() => {
    const set = new Set<string>()
    languages.forEach((l) => {
      if (l.country && typeof l.country === 'string') {
        l.country.split('&').forEach((c) => {
          const trimmed = c.trim()
          if (trimmed) set.add(trimmed.toLowerCase())
        })
      }
    })
    return set.size || 1
  }, [languages])

  const filtered = useMemo(() => {
    return languages.filter((l) => {
      const q = search.toLowerCase().trim()
      return (
        (!q || 
          l.name.toLowerCase().includes(q) || 
          (l.country && l.country.toLowerCase().includes(q)) || 
          (l.nativeName && l.nativeName.toLowerCase().includes(q)) ||
          (l.region && l.region.toLowerCase().includes(q))
        ) &&
        (continent === 'All' || l.continent === continent) &&
        (status === 'all' || l.status === status)
      )
    }).sort((a, b) => {
      if (sortBy === 'name')     return a.name.localeCompare(b.name)
      if (sortBy === 'vitality') return (a.vitalityScore ?? 0) - (b.vitalityScore ?? 0)
      if (sortBy === 'speakers') return (b.speakers ?? 0) - (a.speakers ?? 0)
      return 0
    })
  }, [languages, search, continent, status, sortBy])

  // Filter languages with valid finite coordinates for map rendering
  const mappedLanguages = useMemo(() => {
    return filtered.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lon))
  }, [filtered])

  const grouped = useMemo(() => {
    if (continent !== 'All' || search.trim() !== '') return null
    const groups: Record<string, Language[]> = {}
    filtered.forEach((l) => {
      const c = l.continent || 'Global'
      if (!groups[c]) groups[c] = []
      groups[c].push(l)
    })
    return groups
  }, [filtered, continent, search])

  return (
    <div className="relative">
      {/* Page header */}
      <div className="bg-navy-abyss text-ivory relative overflow-hidden">
        {/* Layered background typography */}
        <span
          className="editorial-bg-text top-6 right-8 text-[18vw] opacity-10 select-none pointer-events-none"
          aria-hidden="true"
        >
          ATLAS
        </span>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 60% 50%, rgba(200,169,107,0.05) 0%, transparent 60%)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-10 h-px bg-gold/50" />
            <span className="font-ui text-[11px] text-gold/80 tracking-[0.25em] uppercase font-bold">
              Regional Discovery
            </span>
          </div>
          <h1
            className="font-display font-bold text-ivory leading-tight text-balance mb-5 text-4xl sm:text-5xl lg:text-6xl"
          >
            Navigate the world&apos;s<br />linguistic heritage.
          </h1>
          <p className="font-body text-ivory/80 text-lg max-w-xl leading-relaxed">
            {languages.length.toLocaleString()} documented languages across {uniqueCountriesCount} {uniqueCountriesCount === 1 ? 'country' : 'countries'}. Explore by geography, vitality, and cultural density.
          </p>
        </div>
      </div>

      {/* Atlas map view */}
      <div className="bg-navy-abyss border-b border-navy/50 relative overflow-hidden" style={{ height: 'clamp(280px, 42vh, 400px)' }}>
        {/* Accurate Equirectangular World Map Silhouette */}
        <ExploreWorldMap />

        {/* Interactive Language Coordinate Markers */}
        {mappedLanguages.map((lang) => {
          const { x, y } = toXY(lang.lat!, lang.lon!)
          const isHov = hovered === lang.id
          const color = VITALITY_STATUS_COLORS[lang.status] || '#C8A96B'

          return (
            <Link
              key={lang.id}
              href={`/language/${lang.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none focus:ring-2 focus:ring-gold rounded-full z-10"
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setHovered(lang.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(lang.id)}
              onBlur={() => setHovered(null)}
              aria-label={`${lang.name} (${lang.country || 'Global'}) — ${VITALITY_STATUS_LABELS[lang.status] || lang.status}`}
            >
              {/* Invisible touch target (minimum 44x44px for accessibility) */}
              <span className="absolute -inset-3.5 block" aria-hidden="true" />

              {/* Visible dot indicator */}
              <span
                className="relative block rounded-full transition-transform duration-200"
                style={{
                  width: isHov ? '12px' : '8px',
                  height: isHov ? '12px' : '8px',
                  backgroundColor: color,
                  boxShadow: isHov
                    ? `0 0 16px ${color}, 0 0 0 2px #FAF8F5`
                    : `0 0 8px ${color}60`,
                }}
              />

              {/* Floating tooltip */}
              {isHov && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-30 whitespace-nowrap animate-fadeIn">
                  <div className="glass-heavy rounded-xl px-3 py-2 shadow-2xl border border-gold/30 text-center">
                    <p className="font-display font-bold text-xs text-navy leading-none mb-1">{lang.name}</p>
                    <p className="font-ui text-[10px] text-stone/80">
                      {lang.country || 'Global'} · {lang.vitalityScore ?? 0}/100
                    </p>
                  </div>
                </div>
              )}
            </Link>
          )
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-6 glass-dark rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-4 border border-ivory/10 max-w-[calc(100%-160px)]">
          {(['critically-endangered', 'endangered', 'vulnerable', 'safe'] as VitalityStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: VITALITY_STATUS_COLORS[s] }} />
              <span className="font-ui text-[10px] text-ivory/80">{VITALITY_STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>

        {/* Result counter */}
        <div className="absolute bottom-4 right-6">
          <span className="font-ui text-xs text-ivory/70 glass-dark rounded-xl px-3.5 py-1.5 border border-ivory/10">
            {mappedLanguages.length} languages mapped
          </span>
        </div>
      </div>

      {/* Sticky Filter bar */}
      <div className="sticky top-[72px] z-30 glass-heavy border-b border-border/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-3.5 flex flex-wrap gap-3 items-center justify-between">
          
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1 max-w-xs min-w-[200px]">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone/50 pointer-events-none" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages or countries..."
                aria-label="Search languages by name, native script or country"
                className="w-full pl-10 pr-8 py-2.5 font-ui text-sm glass rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-navy placeholder:text-stone/40 min-h-[44px]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone/50 hover:text-navy p-1 text-sm font-bold focus-ring rounded"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Continent Segment Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-muted/60 border border-border/40 max-w-full">
              {CONTINENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setContinent(c)}
                  className={`font-ui text-xs px-3.5 py-2 rounded-lg transition-all min-h-[36px] whitespace-nowrap shrink-0 ${
                    continent === c 
                      ? 'bg-navy text-ivory font-bold shadow-sm' 
                      : 'text-stone hover:text-navy font-medium'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Status Select */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by vitality status"
              className="font-ui text-xs px-3.5 py-2.5 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-navy min-h-[44px]"
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort languages"
              className="font-ui text-xs px-3.5 py-2.5 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-navy min-h-[44px]"
            >
              <option value="vitality">Most at risk</option>
              <option value="name">Name A–Z</option>
              <option value="speakers">Most speakers</option>
            </select>

            {hasFiltersActive && (
              <button
                onClick={clearAllFilters}
                className="font-ui text-xs text-gold hover:text-navy font-bold underline px-2 py-2 min-h-[44px] flex items-center focus-ring rounded"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="font-ui text-xs text-stone/60 ml-auto font-medium" role="status" aria-live="polite">
            Showing <strong className="text-navy">{filtered.length}</strong> of {languages.length} languages
          </div>
        </div>
      </div>

      {/* Language cards layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-20">
        {filtered.length === 0 ? (
          <div className="py-24 text-center glass-heavy rounded-2xl p-12 max-w-lg mx-auto border border-border/40">
            <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-4 text-gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-navy mb-2">No languages match your search</h3>
            <p className="font-body text-sm text-stone/70 mb-6 leading-relaxed">
              We couldn&apos;t find any languages matching &ldquo;{search}&rdquo; with your current filter selections.
            </p>
            <button
              onClick={clearAllFilters}
              className="font-ui text-sm px-6 py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-warm transition-colors shadow-md min-h-[44px] focus-ring"
            >
              Reset All Filters
            </button>
          </div>
        ) : grouped ? (
          Object.entries(grouped).map(([cont, langs]) => (
            <div key={cont} className="mb-16 last:mb-0">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-px bg-gold/60" />
                  <h2 className="font-display text-3xl font-bold text-navy">{cont}</h2>
                  <span className="font-mono text-xs text-stone/50 font-medium">({langs.length} indexed)</span>
                </div>
                {CONTINENT_NARRATIVES[cont] && (
                  <p className="font-body text-sm text-stone/70 leading-relaxed max-w-2xl ml-12">
                    {CONTINENT_NARRATIVES[cont]}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-0 lg:ml-12">
                {langs.map((lang, i) => (
                  <LanguageCard key={lang.id} lang={lang} isActive={hovered === lang.id} onHover={setHovered} delay={i * 40} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lang, i) => (
              <LanguageCard key={lang.id} lang={lang} isActive={hovered === lang.id} onHover={setHovered} delay={i * 40} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
