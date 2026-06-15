'use client'

import { useState, useMemo } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import Link from 'next/link'
import {
  LANGUAGES,
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  formatSpeakers,
  type VitalityStatus,
} from '@/lib/data'

const CONTINENTS = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania']
const STATUSES: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'safe', label: 'Safe' },
  { value: 'vulnerable', label: 'Vulnerable' },
  { value: 'endangered', label: 'Endangered' },
  { value: 'critically-endangered', label: 'Critically Endangered' },
  { value: 'dormant', label: 'Dormant' },
]

function VitalityDot({ status }: { status: VitalityStatus }) {
  const color = VITALITY_STATUS_COLORS[status]
  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

function LanguageCard({ lang }: { lang: (typeof LANGUAGES)[0] }) {
  const color = VITALITY_STATUS_COLORS[lang.status]
  return (
    <Link
      href={`/language/${lang.id}`}
      className="group block border border-border hover:border-gold/50 bg-surface hover:bg-muted/30 transition-all p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground leading-tight group-hover:text-earth transition-colors">
            {lang.name}
          </h3>
          <p className="font-body text-sm text-muted-foreground">{lang.nativeName}</p>
        </div>
        <span
          className="font-mono text-xs font-medium px-2 py-0.5 rounded-sm shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {lang.iso.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <VitalityDot status={lang.status} />
        <span className="font-ui text-xs font-medium" style={{ color }}>
          {VITALITY_STATUS_LABELS[lang.status]}
        </span>
        <span className="font-ui text-xs text-muted-foreground/40">·</span>
        <span className="font-ui text-xs text-muted-foreground">{lang.country}</span>
      </div>

      <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
        {lang.description}
      </p>

      {/* Vitality bar */}
      <div className="mb-4">
        <div className="flex justify-between font-ui text-xs text-muted-foreground mb-1.5">
          <span>Vitality Score</span>
          <span>{lang.vitalityScore}/100</span>
        </div>
        <div className="h-0.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${lang.vitalityScore}%`, backgroundColor: color }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-ui text-muted-foreground/70">
        <span>{formatSpeakers(lang.speakers)}</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>{lang.audioCount.toLocaleString()} recordings</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>{lang.storiesArchived} stories</span>
      </div>

      <div className="mt-4 flex items-center gap-1.5 font-ui text-xs text-muted-foreground/40 group-hover:text-clay transition-colors">
        <span>Explore archive</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  )
}

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const [continent, setContinent] = useState('All')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'vitality' | 'speakers' | 'contributions'>('vitality')

  const filtered = useMemo(() => {
    return LANGUAGES.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.country.toLowerCase().includes(search.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(search.toLowerCase())
      const matchContinent = continent === 'All' || l.continent === continent
      const matchStatus = status === 'all' || l.status === status
      return matchSearch && matchContinent && matchStatus
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'vitality') return a.vitalityScore - b.vitalityScore
      if (sortBy === 'speakers') return b.speakers - a.speakers
      if (sortBy === 'contributions') return b.audioCount - a.audioCount
      return 0
    })
  }, [search, continent, status, sortBy])

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        {/* Page header */}
        <div className="bg-earth text-primary-foreground py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-gold/60" />
              <span className="font-ui text-xs text-primary-foreground/40 tracking-widest uppercase">
                Language Explorer
              </span>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-4 text-balance">
              Explore the world&apos;s<br />linguistic heritage.
            </h1>
            <p className="font-body text-primary-foreground/60 text-lg max-w-2xl">
              Browse 2,847 documented languages across 147 countries. Filter by
              region, vitality status, and contribution activity.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-surface sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-9 pr-4 py-2 font-ui text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-earth text-foreground placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Continent filter */}
            <div className="flex items-center gap-1 flex-wrap">
              {CONTINENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setContinent(c)}
                  className={`font-ui text-xs px-3 py-1.5 rounded-sm transition-colors ${
                    continent === c
                      ? 'bg-earth text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="font-ui text-xs px-3 py-1.5 bg-background border border-border rounded-sm focus:outline-none focus:border-earth text-foreground"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="font-ui text-xs px-3 py-1.5 bg-background border border-border rounded-sm focus:outline-none focus:border-earth text-foreground"
            >
              <option value="vitality">Sort: Most at risk</option>
              <option value="name">Sort: Name A–Z</option>
              <option value="speakers">Sort: Most speakers</option>
              <option value="contributions">Sort: Most recordings</option>
            </select>

            <span className="font-ui text-xs text-muted-foreground ml-auto">
              {filtered.length} language{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-earth/5 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
            <div className="relative h-48 lg:h-64 bg-earth/8 rounded-sm overflow-hidden flex items-center justify-center border border-border/50">
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(74,52,40,0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 30%, rgba(140,90,60,0.2) 0%, transparent 40%)`,
                }}
              />
              {/* Simulated map dots */}
              {LANGUAGES.map((lang) => {
                const x = ((lang.lon + 180) / 360) * 100
                const y = ((90 - lang.lat) / 180) * 100
                const color = VITALITY_STATUS_COLORS[lang.status]
                return (
                  <Link
                    key={lang.id}
                    href={`/language/${lang.id}`}
                    className="absolute group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={lang.name}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-surface/60 transition-transform group-hover:scale-150 cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-earth text-primary-foreground px-2 py-1 rounded-sm text-xs font-ui whitespace-nowrap">
                        {lang.name}
                      </div>
                    </div>
                  </Link>
                )
              })}
              <div className="absolute bottom-3 left-3 font-ui text-xs text-muted-foreground/50">
                Geographic view — {LANGUAGES.length} languages mapped
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-2xl text-muted-foreground mb-2">No languages found</p>
              <p className="font-body text-sm text-muted-foreground/60">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border">
              {filtered.map((lang) => (
                <div key={lang.id} className="bg-background">
                  <LanguageCard lang={lang} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
