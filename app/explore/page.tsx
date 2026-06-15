'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import {
  LANGUAGES,
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  formatSpeakers,
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

// Equirectangular map — converts lat/lon to % coords
function toXY(lat: number, lon: number) {
  return { x: ((lon + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 }
}

function LanguageRow({ lang, isActive, onHover }: {
  lang: (typeof LANGUAGES)[0]
  isActive: boolean
  onHover: (id: string | null) => void
}) {
  const color = VITALITY_STATUS_COLORS[lang.status]
  return (
    <Link
      href={`/language/${lang.id}`}
      className={`group flex items-center gap-5 py-5 px-6 lg:px-8 border-b border-border transition-colors ${isActive ? 'bg-navy/5' : 'hover:bg-surface'}`}
      onMouseEnter={() => onHover(lang.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Status dot */}
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />

      {/* Language name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-base font-bold text-navy leading-tight group-hover:text-gold transition-colors">
            {lang.name}
          </span>
          <span className="font-body text-sm text-stone hidden sm:inline">{lang.nativeName}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 font-ui text-xs text-stone/60">
          <span>{lang.country}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{lang.family}</span>
        </div>
      </div>

      {/* Status label */}
      <span
        className="hidden md:inline font-ui text-[10px] tracking-[0.15em] uppercase shrink-0"
        style={{ color }}
      >
        {VITALITY_STATUS_LABELS[lang.status]}
      </span>

      {/* Speakers */}
      <span className="hidden lg:inline font-ui text-xs text-stone/60 shrink-0 w-24 text-right">
        {formatSpeakers(lang.speakers)}
      </span>

      {/* Vitality score bar */}
      <div className="hidden sm:flex items-center gap-2 w-24 shrink-0">
        <div className="flex-1 h-px bg-border relative overflow-hidden">
          <div className="absolute inset-y-0 left-0" style={{ width: `${lang.vitalityScore}%`, backgroundColor: color }} />
        </div>
        <span className="font-mono text-[10px] text-stone/50 w-6 text-right">{lang.vitalityScore}</span>
      </div>

      {/* Arrow */}
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"
        className="shrink-0 text-stone/25 group-hover:text-gold group-hover:translate-x-0.5 transition-all">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}

export default function ExplorePage() {
  const [search,    setSearch]    = useState('')
  const [continent, setContinent] = useState('All')
  const [status,    setStatus]    = useState('all')
  const [sortBy,    setSortBy]    = useState<'vitality' | 'name' | 'speakers'>('vitality')
  const [hovered,   setHovered]   = useState<string | null>(null)

  const filtered = useMemo(() => {
    return LANGUAGES.filter((l) => {
      const q = search.toLowerCase()
      return (
        (!search || l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q)) &&
        (continent === 'All' || l.continent === continent) &&
        (status === 'all' || l.status === status)
      )
    }).sort((a, b) => {
      if (sortBy === 'name')      return a.name.localeCompare(b.name)
      if (sortBy === 'vitality')  return a.vitalityScore - b.vitalityScore
      if (sortBy === 'speakers')  return b.speakers - a.speakers
      return 0
    })
  }, [search, continent, status, sortBy])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-[72px]">

        {/* Page header — editorial */}
        <div className="bg-navy text-ivory">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-8 h-px bg-gold/50" />
              <span className="font-ui text-xs text-ivory/30 tracking-[0.2em] uppercase">Language Explorer</span>
            </div>
            <h1 className="font-display font-bold text-ivory leading-tight text-balance mb-5"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
              Explore the world&apos;s<br />linguistic heritage.
            </h1>
            <p className="font-body text-ivory/45 text-lg max-w-xl">
              2,847 documented languages across 147 countries. Navigate by
              geography, vitality status, and community activity.
            </p>
          </div>
        </div>

        {/* Map — spatial navigation */}
        <div className="bg-navy border-b border-navy/80 relative" style={{ height: 'clamp(240px, 40vh, 380px)' }}>
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 w-full h-full opacity-100"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Graticules */}
            {[-60,-30,0,30,60].map(lat => {
              const y = ((90 - lat) / 180) * 500
              return <line key={lat} x1="0" y1={y} x2="1000" y2={y} stroke="#C8A96B" strokeWidth="0.3" strokeDasharray="3,10" opacity="0.2" />
            })}
            {[-120,-60,0,60,120].map(lon => {
              const x = ((lon + 180) / 360) * 1000
              return <line key={lon} x1={x} y1="0" x2={x} y2="500" stroke="#C8A96B" strokeWidth="0.3" strokeDasharray="3,10" opacity="0.2" />
            })}
            {/* Continental outlines */}
            <path d="M130,100 L170,70 L230,75 L265,105 L275,145 L255,190 L225,215 L195,200 L165,165 L140,130 Z"
              fill="rgba(200,169,107,0.05)" stroke="#C8A96B" strokeWidth="0.6" opacity="0.4" />
            <path d="M240,240 L275,230 L300,260 L295,330 L270,375 L245,380 L220,360 L215,310 L225,265 Z"
              fill="rgba(200,169,107,0.05)" stroke="#C8A96B" strokeWidth="0.6" opacity="0.4" />
            <path d="M455,85 L510,75 L535,95 L525,120 L500,135 L470,128 L450,108 Z"
              fill="rgba(200,169,107,0.05)" stroke="#C8A96B" strokeWidth="0.6" opacity="0.4" />
            <path d="M465,140 L525,128 L555,160 L555,235 L535,285 L505,305 L475,285 L460,232 L455,180 Z"
              fill="rgba(200,169,107,0.05)" stroke="#C8A96B" strokeWidth="0.6" opacity="0.4" />
            <path d="M535,80 L710,65 L750,95 L740,155 L700,172 L648,160 L600,170 L565,148 L538,115 Z"
              fill="rgba(200,169,107,0.05)" stroke="#C8A96B" strokeWidth="0.6" opacity="0.4" />
            <path d="M705,280 L770,268 L800,298 L788,345 L750,358 L712,342 L698,308 Z"
              fill="rgba(200,169,107,0.05)" stroke="#C8A96B" strokeWidth="0.6" opacity="0.4" />
          </svg>

          {/* Language dots */}
          {filtered.map((lang) => {
            const { x, y } = toXY(lang.lat, lang.lon)
            const color = VITALITY_STATUS_COLORS[lang.status]
            const isHov = hovered === lang.id
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
                    width: isHov ? 14 : 9,
                    height: isHov ? 14 : 9,
                    backgroundColor: color,
                    boxShadow: isHov ? `0 0 0 3px rgba(247,244,238,0.3)` : 'none',
                  }}
                />
                {isHov && (
                  <div className="absolute z-20 pointer-events-none" style={{ bottom: '130%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                    <div className="bg-ivory border border-border px-3 py-1.5 shadow-lg">
                      <p className="font-display text-xs font-bold text-navy">{lang.name}</p>
                      <p className="font-ui text-[10px] text-stone">{lang.country}</p>
                    </div>
                  </div>
                )}
              </Link>
            )
          })}

          {/* Map legend */}
          <div className="absolute bottom-4 left-6 flex items-center gap-4">
            {(['critically-endangered', 'endangered', 'vulnerable', 'safe'] as VitalityStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VITALITY_STATUS_COLORS[s] }} />
                <span className="font-ui text-[10px] text-ivory/35 hidden sm:inline">{VITALITY_STATUS_LABELS[s]}</span>
              </div>
            ))}
          </div>

          {/* Count */}
          <div className="absolute bottom-4 right-6">
            <span className="font-ui text-[10px] text-ivory/25">{filtered.length} languages mapped</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="sticky top-[72px] z-30 bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-4 flex flex-wrap gap-3 items-center">
            {/* Search */}
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
                className="pl-9 pr-4 py-2 font-ui text-sm bg-background border border-border focus:outline-none focus:border-navy text-navy placeholder:text-stone/40 w-52"
              />
            </div>

            {/* Continent pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {CONTINENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setContinent(c)}
                  className={`font-ui text-xs px-3 py-1.5 transition-colors ${
                    continent === c
                      ? 'bg-navy text-ivory'
                      : 'text-stone hover:text-navy hover:bg-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="font-ui text-xs px-3 py-1.5 bg-background border border-border focus:outline-none focus:border-navy text-navy"
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="font-ui text-xs px-3 py-1.5 bg-background border border-border focus:outline-none focus:border-navy text-navy"
            >
              <option value="vitality">Most at risk</option>
              <option value="name">Name A–Z</option>
              <option value="speakers">Most speakers</option>
            </select>

            <span className="font-ui text-xs text-stone/50 ml-auto">
              {filtered.length} language{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Column header */}
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-2 flex items-center gap-5 border-t border-border">
            <span className="w-2 shrink-0" aria-hidden="true" />
            <span className="flex-1 font-ui text-[10px] text-stone/40 tracking-[0.15em] uppercase">Language</span>
            <span className="hidden md:inline font-ui text-[10px] text-stone/40 tracking-[0.15em] uppercase w-36">Status</span>
            <span className="hidden lg:inline font-ui text-[10px] text-stone/40 tracking-[0.15em] uppercase w-24 text-right">Speakers</span>
            <span className="hidden sm:inline font-ui text-[10px] text-stone/40 tracking-[0.15em] uppercase w-24">Vitality</span>
            <span className="w-4 shrink-0" aria-hidden="true" />
          </div>
        </div>

        {/* Language list */}
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="font-display text-2xl text-stone mb-2">No languages found</p>
              <p className="font-body text-sm text-stone/50">Try adjusting your filters</p>
            </div>
          ) : (
            <div>
              {filtered.map((lang) => (
                <LanguageRow
                  key={lang.id}
                  lang={lang}
                  isActive={hovered === lang.id}
                  onHover={setHovered}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
