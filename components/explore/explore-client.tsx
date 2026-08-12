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
import {
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  formatSpeakers,
  type Language,
  type VitalityStatus,
} from '@/lib/data'

const CONTINENTS = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania']
const STATUSES: { value: string; label: string }[] = [
  { value: 'all',                    label: 'All statuses'          },
  { value: 'safe',                   label: 'Safe'                  },
  { value: 'vulnerable',             label: 'Vulnerable'            },
  { value: 'endangered',             label: 'Endangered'            },
  { value: 'critically-endangered',  label: 'Critically endangered' },
  { value: 'dormant',                label: 'Dormant'               },
]

const CONTINENT_NARRATIVES: Record<string, string> = {
  'Africa':   'Africa holds 712 documented languages — a continent of extraordinary linguistic diversity where 89 face critical threat.',
  'Americas': 'The Americas contain 847 languages, many belonging to isolated families found nowhere else on Earth. 234 are critically endangered.',
  'Asia':     'Asia\'s 934 documented languages span from the Siberian tundra to tropical archipelagos. 312 are at critical risk.',
  'Europe':   'Europe\'s 198 documented languages include ancient Celtic, Uralic, and Basque tongues. 54 face extinction.',
  'Oceania':  'Oceania\'s 156 languages represent the world\'s highest density per capita. Half face critical threat.',
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
  const color  = VITALITY_STATUS_COLORS[lang.status]

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
          <p className="font-body text-sm text-stone/80 italic mt-0.5">{lang.nativeName}</p>
        </div>
        <span
          className="shrink-0 w-3 h-3 rounded-full mt-1.5 animate-glow-breathe"
          style={{
            backgroundColor: color,
            '--vitality-glow-intensity': lang.vitalityScore < 20 ? '0.4' : '0.15',
            '--vitality-pulse-speed':    lang.vitalityScore < 20 ? '1.5s' : '3s',
          } as React.CSSProperties}
          aria-label={VITALITY_STATUS_LABELS[lang.status]}
        />
      </div>

      <div className="flex items-center gap-3 mb-4 font-ui text-xs text-stone/60">
        <span>{lang.country}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{formatSpeakers(lang.speakers)}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{lang.continent}</span>
      </div>

      <div className="h-1.5 bg-border/40 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${lang.vitalityScore}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-ui text-xs font-semibold tracking-wide uppercase" style={{ color }}>
          {VITALITY_STATUS_LABELS[lang.status]}
        </span>
        <span className="font-mono text-xs text-stone/50 font-medium">{lang.vitalityScore}/100</span>
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

  const filtered = useMemo(() => {
    return languages.filter((l) => {
      const q = search.toLowerCase().trim()
      return (
        (!q || 
          l.name.toLowerCase().includes(q) || 
          l.country.toLowerCase().includes(q) || 
          l.nativeName.toLowerCase().includes(q) ||
          l.region.toLowerCase().includes(q)
        ) &&
        (continent === 'All' || l.continent === continent) &&
        (status === 'all' || l.status === status)
      )
    }).sort((a, b) => {
      if (sortBy === 'name')     return a.name.localeCompare(b.name)
      if (sortBy === 'vitality') return a.vitalityScore - b.vitalityScore
      if (sortBy === 'speakers') return b.speakers - a.speakers
      return 0
    })
  }, [languages, search, continent, status, sortBy])

  const grouped = useMemo(() => {
    if (continent !== 'All' || search.trim() !== '') return null
    const groups: Record<string, Language[]> = {}
    filtered.forEach((l) => {
      if (!groups[l.continent]) groups[l.continent] = []
      groups[l.continent].push(l)
    })
    return groups
  }, [filtered, continent, search])

  return (
    <div className="relative">
      {/* Page header */}
      <div className="bg-navy-abyss text-ivory relative overflow-hidden">
        {/* Layered background typography */}
        <span
          className="editorial-bg-text top-6 right-8 text-[18vw] opacity-25 select-none"
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
            {languages.length.toLocaleString()} documented languages across 147 countries. Explore by
            geography, vitality, and cultural density.
          </p>
        </div>
      </div>

      {/* Atlas map view */}
      <div className="bg-navy-abyss border-b border-navy/50 relative overflow-hidden" style={{ height: 'clamp(280px, 42vh, 400px)' }}>
        <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          {[-60,-30,0,30,60].map(lat => {
            const y = ((90 - lat) / 180) * 500
            return <line key={lat} x1="0" y1={y} x2="1000" y2={y} stroke="#C8A96B" strokeWidth="0.3" strokeDasharray="2,12" opacity="0.12" />
          })}
          {[-120,-60,0,60,120].map(lon => {
            const x = ((lon + 180) / 360) * 1000
            return <line key={lon} x1={x} y1="0" x2={x} y2="500" stroke="#C8A96B" strokeWidth="0.3" strokeDasharray="2,12" opacity="0.12" />
          })}
          <path d="M130,100 L170,70 L230,75 L265,105 L275,145 L255,190 L225,215 L195,200 L165,165 L140,130 Z"
            fill="rgba(200,169,107,0.03)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.3" />
          <path d="M240,240 L275,230 L300,260 L295,330 L270,375 L245,380 L220,360 L215,310 L225,265 Z"
            fill="rgba(200,169,107,0.03)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.3" />
          <path d="M455,85 L510,75 L535,95 L525,120 L500,135 L470,128 L450,108 Z"
            fill="rgba(200,169,107,0.03)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.3" />
          <path d="M465,140 L525,128 L555,160 L555,235 L535,285 L505,305 L475,285 L460,232 L455,180 Z"
            fill="rgba(200,169,107,0.03)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.3" />
          <path d="M535,80 L710,65 L750,95 L740,155 L700,172 L648,160 L600,170 L565,148 L538,115 Z"
            fill="rgba(200,169,107,0.03)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.3" />
          <path d="M705,280 L770,268 L800,298 L788,345 L750,358 L712,342 L698,308 Z"
            fill="rgba(200,169,107,0.03)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.3" />
        </svg>

        {filtered.map((lang) => {
          const { x, y } = toXY(lang.lat, lang.lon)
          const color    = VITALITY_STATUS_COLORS[lang.status]
          const isHov    = hovered === lang.id
          return (
            <Link
              key={lang.id}
              href={`/language/${lang.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 p-2 focus-ring rounded-full"
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setHovered(lang.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`${lang.name} — ${lang.country}`}
            >
              <span
                className="block rounded-full transition-all duration-200"
                style={{
                  width:     isHov ? 16 : 9,
                  height:    isHov ? 16 : 9,
                  backgroundColor: color,
                  boxShadow: isHov ? `0 0 14px 4px ${color}60, 0 0 0 3px rgba(247,244,238,0.3)` : `0 0 6px ${color}40`,
                }}
              />
              {isHov && (
                <div className="absolute z-20 pointer-events-none" style={{ bottom: '160%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  <div className="glass-navy rounded-lg px-4 py-2.5 shadow-xl animate-layer-emerge border border-gold/30">
                    <p className="font-display text-xs font-bold text-ivory">{lang.name}</p>
                    <p className="font-ui text-[10px] text-ivory/60">{lang.country} · {lang.vitalityScore}/100</p>
                  </div>
                </div>
              )}
            </Link>
          )
        })}

        <div className="absolute bottom-4 left-6 glass-dark rounded-xl px-4 py-2.5 flex items-center gap-4 border border-ivory/10">
          {(['critically-endangered', 'endangered', 'vulnerable', 'safe'] as VitalityStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VITALITY_STATUS_COLORS[s] }} />
              <span className="font-ui text-[10px] text-ivory/60 hidden sm:inline">{VITALITY_STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-6">
          <span className="font-ui text-xs text-ivory/50 glass-dark rounded-xl px-3.5 py-1.5 border border-ivory/10">
            {filtered.length} languages mapped
          </span>
        </div>
      </div>

      {/* Sticky Filter bar with tactile iOS-inspired controls */}
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
                placeholder="Search languages or countries…"
                aria-label="Search languages by name, native script or country"
                className="w-full pl-10 pr-8 py-2.5 font-ui text-sm glass rounded-xl focus:outline-none focus:ring-2 focus:ring-gold text-navy placeholder:text-stone/40 min-h-[44px]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone/50 hover:text-navy p-1 text-sm font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Continent Segment Buttons */}
            <div className="hidden lg:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40">
              {CONTINENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setContinent(c)}
                  className={`font-ui text-xs px-3 py-2 rounded-lg transition-all min-h-[36px] ${
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
                className="font-ui text-xs text-gold hover:text-navy font-bold underline px-2 py-2 min-h-[44px] flex items-center"
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
