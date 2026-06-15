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
      className={`group block glass-heavy rounded-xl p-6 hover:shadow-lg transition-all duration-500 ${isActive ? 'ring-1 ring-gold/30 shadow-md' : ''}`}
      onMouseEnter={() => onHover(lang.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        opacity:   inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-navy leading-tight group-hover:text-gold transition-colors">
            {lang.name}
          </h3>
          <p className="font-body text-sm text-stone/70 italic">{lang.nativeName}</p>
        </div>
        <span
          className="shrink-0 w-3 h-3 rounded-full mt-1 animate-glow-breathe"
          style={{
            backgroundColor: color,
            '--vitality-glow-intensity': lang.vitalityScore < 20 ? '0.4' : '0.15',
            '--vitality-pulse-speed':    lang.vitalityScore < 20 ? '1.5s' : '3s',
          } as React.CSSProperties}
          aria-label={VITALITY_STATUS_LABELS[lang.status]}
        />
      </div>

      <div className="flex items-center gap-3 mb-4 font-ui text-xs text-stone/50">
        <span>{lang.country}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{formatSpeakers(lang.speakers)}</span>
      </div>

      <div className="h-1 bg-border/50 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${lang.vitalityScore}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-ui text-[10px] tracking-wide uppercase" style={{ color }}>
          {VITALITY_STATUS_LABELS[lang.status]}
        </span>
        <span className="font-mono text-[10px] text-stone/40">{lang.vitalityScore}/100</span>
      </div>

      {lang.featuredPhrase && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <p className="font-display text-sm italic text-navy/50">
            &ldquo;{lang.featuredPhrase.text}&rdquo;
          </p>
          <p className="font-ui text-[10px] text-stone/40 mt-1">{lang.featuredPhrase.translation}</p>
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

  const filtered = useMemo(() => {
    return languages.filter((l) => {
      const q = search.toLowerCase()
      return (
        (!search || l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q)) &&
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
    if (continent !== 'All') return null
    const groups: Record<string, Language[]> = {}
    filtered.forEach((l) => {
      if (!groups[l.continent]) groups[l.continent] = []
      groups[l.continent].push(l)
    })
    return groups
  }, [filtered, continent])

  return (
    <>
      {/* Page header */}
      <div className="bg-navy-abyss text-ivory relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 60% 50%, rgba(200,169,107,0.04) 0%, transparent 60%)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-10 h-px bg-gold/30" />
            <span className="font-ui text-[11px] text-ivory/25 tracking-[0.25em] uppercase">Regional Discovery</span>
          </div>
          <h1
            className="font-display font-bold text-ivory leading-tight text-balance mb-5"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
          >
            Navigate the world&apos;s<br />linguistic heritage.
          </h1>
          <p className="font-body text-ivory/35 text-lg max-w-xl">
            {languages.length.toLocaleString()} documented languages across 147 countries. Explore by
            geography, vitality, and cultural density.
          </p>
        </div>
      </div>

      {/* Atlas map */}
      <div className="bg-navy-abyss border-b border-navy/50 relative" style={{ height: 'clamp(280px, 45vh, 420px)' }}>
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
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
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
                  boxShadow: isHov ? `0 0 12px 3px ${color}40, 0 0 0 3px rgba(247,244,238,0.2)` : `0 0 6px ${color}30`,
                }}
              />
              {isHov && (
                <div className="absolute z-20 pointer-events-none" style={{ bottom: '160%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  <div className="glass-navy rounded-lg px-4 py-2.5 shadow-xl animate-layer-emerge">
                    <p className="font-display text-xs font-bold text-ivory">{lang.name}</p>
                    <p className="font-ui text-[10px] text-ivory/40">{lang.country} · {lang.vitalityScore}/100</p>
                  </div>
                </div>
              )}
            </Link>
          )
        })}

        <div className="absolute bottom-4 left-6 glass-dark rounded-lg px-4 py-2.5 flex items-center gap-4">
          {(['critically-endangered', 'endangered', 'vulnerable', 'safe'] as VitalityStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VITALITY_STATUS_COLORS[s] }} />
              <span className="font-ui text-[10px] text-ivory/40 hidden sm:inline">{VITALITY_STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-6">
          <span className="font-ui text-[10px] text-ivory/20 glass-dark rounded-lg px-3 py-1.5">{filtered.length} languages mapped</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-[72px] z-30 glass-heavy border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-4 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages…"
              className="pl-9 pr-4 py-2.5 font-ui text-sm glass rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/30 text-navy placeholder:text-stone/40 w-56"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {CONTINENTS.map((c) => (
              <button
                key={c}
                onClick={() => setContinent(c)}
                className={`font-ui text-xs px-3.5 py-2 rounded-lg transition-all duration-300 ${
                  continent === c ? 'glass-navy-heavy text-ivory shadow-sm' : 'text-stone hover:text-navy glass hover:shadow-sm'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="font-ui text-xs px-3 py-2 glass rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/30 text-navy"
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="font-ui text-xs px-3 py-2 glass rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/30 text-navy"
          >
            <option value="vitality">Most at risk</option>
            <option value="name">Name A–Z</option>
            <option value="speakers">Most speakers</option>
          </select>

          <span className="font-ui text-xs text-stone/40 ml-auto">
            {filtered.length} language{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Language cards */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-20">
        {filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display text-2xl text-stone mb-2">No languages found</p>
            <p className="font-body text-sm text-stone/50">Try adjusting your filters</p>
          </div>
        ) : grouped ? (
          Object.entries(grouped).map(([cont, langs]) => (
            <div key={cont} className="mb-16 last:mb-0">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-px bg-gold/40" />
                  <h2 className="font-display text-2xl font-bold text-navy">{cont}</h2>
                  <span className="font-mono text-xs text-stone/40">{langs.length} languages</span>
                </div>
                {CONTINENT_NARRATIVES[cont] && (
                  <p className="font-body text-sm text-stone/60 leading-relaxed max-w-2xl ml-12">
                    {CONTINENT_NARRATIVES[cont]}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-0 lg:ml-12">
                {langs.map((lang, i) => (
                  <LanguageCard key={lang.id} lang={lang} isActive={hovered === lang.id} onHover={setHovered} delay={i * 60} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((lang, i) => (
              <LanguageCard key={lang.id} lang={lang} isActive={hovered === lang.id} onHover={setHovered} delay={i * 60} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
