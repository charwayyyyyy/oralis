'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  LANGUAGES,
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  type VitalityStatus,
} from '@/lib/data'

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

function NarrativeBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const statusCounts = LANGUAGES.reduce<Record<string, number>>((acc, l) => {
  acc[l.status] = (acc[l.status] ?? 0) + 1
  return acc
}, {})

const CONTINENT_NARRATIVES = [
  {
    name: 'Americas',
    languages: 847,
    critical: 234,
    narrative: 'From the Mapudungun poetry of Chile to the last Yuchi speakers in Oklahoma, the Americas hold extraordinary linguistic diversity — much of it at the precipice of silence.',
  },
  {
    name: 'Africa',
    languages: 712,
    critical: 89,
    narrative: 'Africa\'s linguistic heritage is humanity\'s deepest. While many languages thrive, 89 face critical threat from urbanization and educational policy.',
  },
  {
    name: 'Asia',
    languages: 934,
    critical: 312,
    narrative: 'Asia holds the largest number of endangered languages. From Ainu in Hokkaido to the hill languages of Southeast Asia, 312 require urgent documentation.',
  },
  {
    name: 'Europe',
    languages: 198,
    critical: 54,
    narrative: 'Europe\'s linguistic margins hold treasures — Livonian on Latvia\'s coast, Cornish in Cornwall\'s cliffs, and dozens of others clinging to survival.',
  },
  {
    name: 'Oceania',
    languages: 156,
    critical: 78,
    narrative: 'The Pacific holds the world\'s highest density of languages per capita. Half of Oceania\'s 156 documented languages face critical threat.',
  },
]

const HEARTBEAT_DATA = [32, 45, 38, 62, 55, 78, 72, 88, 65, 90, 75, 95]

export default function InsightsDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">

      {/* ─── Vitality Narrative ─────────────────────── */}
      <NarrativeBlock>
        <div className="max-w-3xl mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold/40" />
            <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Global Vitality</h2>
          </div>
          <p className="font-display text-3xl lg:text-4xl font-bold text-navy leading-snug mb-6 text-balance">
            Of the world&apos;s ~7,000 living languages, 3,500 face extinction before the end of this century.
            One falls silent every 40 days.
          </p>
          <p className="font-body text-stone/60 leading-relaxed text-base lg:text-lg">
            The Oralis atlas documents the vitality of 2,847 languages — tracking speaker populations,
            intergenerational transmission, community engagement, and preservation momentum.
            Every data point here represents a living culture.
          </p>
        </div>
      </NarrativeBlock>

      {/* ─── Vitality Distribution ──────────────────── */}
      <NarrativeBlock delay={100}>
        <div className="glass-heavy rounded-xl p-8 lg:p-10 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-gold/40" />
            <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Vitality Spectrum</h3>
          </div>
          <div className="space-y-6">
            {(Object.entries(VITALITY_STATUS_LABELS) as [VitalityStatus, string][]).map(([status, label]) => {
              const count = statusCounts[status] ?? 0
              const total = LANGUAGES.length
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const globalEstimate = Math.round((count / total) * 7000)
              const color = VITALITY_STATUS_COLORS[status]
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-glow-breathe"
                        style={{ backgroundColor: color, '--vitality-glow-intensity': '0.15' } as React.CSSProperties} />
                      <span className="font-ui text-sm text-navy font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-body text-xs text-stone/60 italic">~{globalEstimate.toLocaleString()} languages</span>
                      <span className="font-mono text-xs text-stone/30 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-border/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-8 font-ui text-[10px] text-stone/30 leading-relaxed">
            Global figures extrapolated from Oralis sample (n={LANGUAGES.length}) across ~7,000 documented languages.
          </p>
        </div>
      </NarrativeBlock>

      {/* ─── Heartbeat of Preservation ─────────────── */}
      <NarrativeBlock delay={150}>
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold/40" />
            <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">The Heartbeat of Preservation</h3>
          </div>
          <p className="font-body text-stone/60 leading-relaxed mb-8 max-w-2xl">
            Preservation momentum across the atlas. Each pulse represents thousands of contributions
            flowing in from communities worldwide — a living signal that cultural guardians are at work.
          </p>

          {/* Heartbeat visualization */}
          <div className="glass-heavy rounded-xl p-8 relative overflow-hidden">
            <div className="flex items-end gap-3 h-28" aria-hidden="true">
              {HEARTBEAT_DATA.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg transition-all duration-700"
                    style={{
                      height: `${val}%`,
                      background: `linear-gradient(to top, rgba(200,169,107,0.15), rgba(200,169,107,${0.2 + val / 200}))`,
                      boxShadow: `0 0 ${val / 5}px rgba(200,169,107,0.1)`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m) => (
                <span key={m} className="font-ui text-[9px] text-stone/25 flex-1 text-center">{m}</span>
              ))}
            </div>

            {/* Ambient shimmer */}
            <div className="absolute inset-0 shimmer pointer-events-none rounded-xl" aria-hidden="true" />
          </div>
        </div>
      </NarrativeBlock>

      {/* ─── Continental Observatory ───────────────── */}
      <div className="mb-12">
        <NarrativeBlock>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-8 h-px bg-gold/40" />
            <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Continental Observatory</h3>
          </div>
        </NarrativeBlock>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTINENT_NARRATIVES.map((c, i) => {
            const critPct = Math.round((c.critical / c.languages) * 100)
            return (
              <NarrativeBlock key={c.name} delay={i * 80}>
                <div className="glass-heavy rounded-xl p-7 lg:p-8 hover:shadow-lg transition-all duration-500 h-full">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h4 className="font-display text-xl font-bold text-navy">{c.name}</h4>
                    <span className="font-mono text-xs text-stone/30 shrink-0">{c.languages} languages</span>
                  </div>
                  <p className="font-body text-sm text-stone/60 leading-relaxed mb-6">
                    {c.narrative}
                  </p>
                  <div className="h-2 bg-border/20 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${critPct}%`,
                        background: `linear-gradient(90deg, ${VITALITY_STATUS_COLORS['critically-endangered']}80, ${VITALITY_STATUS_COLORS['critically-endangered']})`,
                      }}
                    />
                  </div>
                  <span className="font-ui text-[10px]" style={{ color: VITALITY_STATUS_COLORS['critically-endangered'] }}>
                    {critPct}% at critical risk
                  </span>
                </div>
              </NarrativeBlock>
            )
          })}
        </div>
      </div>

      {/* ─── Most Active in Atlas ──────────────────── */}
      <NarrativeBlock delay={100}>
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold/40" />
            <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Most Active in the Atlas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LANGUAGES
              .slice()
              .sort((a, b) => b.audioCount - a.audioCount)
              .map((lang, i) => {
                const color = VITALITY_STATUS_COLORS[lang.status]
                const maxCount = Math.max(...LANGUAGES.map(l => l.audioCount))
                return (
                  <Link
                    key={lang.id}
                    href={`/language/${lang.id}`}
                    className="glass-heavy rounded-xl p-5 flex items-center gap-5 group hover:shadow-lg transition-all"
                  >
                    <span className="font-mono text-lg text-stone/20 w-6 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-sm font-bold text-navy group-hover:text-gold transition-colors">{lang.name}</span>
                        <span className="font-ui text-xs text-stone/40">{lang.audioCount.toLocaleString()} recordings</span>
                      </div>
                      <div className="h-1.5 bg-border/20 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(lang.audioCount / maxCount) * 100}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>
        </div>
      </NarrativeBlock>

      {/* ─── Infrastructure whisper ─────────────────── */}
      <NarrativeBlock delay={200}>
        <div className="glass-navy rounded-xl p-8 lg:p-10 text-ivory">
          <p className="font-body text-ivory/30 text-sm leading-relaxed max-w-2xl">
            The Oralis atlas is powered by a distributed infrastructure spanning 12 global regions
            with sub-10ms read latency. Every contribution is replicated three times for permanence.
            Built to support 100M+ cultural memories from communities worldwide.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <span className="font-mono text-[10px] text-gold/30">AWS</span>
            <span className="font-ui text-[10px] text-ivory/8">&middot;</span>
            <span className="font-mono text-[10px] text-gold/30">Vercel</span>
            <span className="font-ui text-[10px] text-ivory/8">&middot;</span>
            <span className="font-mono text-[10px] text-gold/30">12 Regions</span>
          </div>
        </div>
      </NarrativeBlock>
    </div>
  )
}
