'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LANGUAGES,
  RECENT_CONTRIBUTIONS,
  VITALITY_STATUS_COLORS,
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
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const PROFILE = {
  name: 'Dr. Kwame Osei-Bonsu',
  role: 'Cultural Guardian',
  joinDate: 'Joined March 2024',
  languages: ['Twi', 'Ga', 'Ewe', 'Fante'],
  totalContributions: 47,
  audioHours: 12.5,
  storiesArchived: 8,
  continents: ['Africa', 'Americas', 'Europe', 'Asia'],
  validationScore: 94,
}

const CONTRIBUTED_LANGUAGES = LANGUAGES.slice(0, 5)

const BADGES = [
  { name: 'First Voice',        desc: 'Made your first audio contribution',   earned: true, icon: '◉' },
  { name: 'Story Keeper',       desc: 'Archived 5+ oral traditions',         earned: true, icon: '◇' },
  { name: 'Cross-Continental',  desc: 'Contributed across 3+ continents',    earned: true, icon: '◈' },
  { name: 'Guardian Circle',    desc: 'Invited 10+ new guardians',           earned: false, icon: '◎' },
  { name: 'Elder Recognition',  desc: 'Verified by a community elder',      earned: false, icon: '◆' },
]

function toXY(lat: number, lon: number) {
  return { x: ((lon + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 }
}

export default function UserProfile() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* ─── Left: identity + footprint map ────── */}
        <div className="lg:col-span-5">
          {/* Profile card */}
          <NarrativeBlock>
            <div className="glass-heavy rounded-xl p-8 mb-6">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-navy/5 border-2 border-gold/20 flex items-center justify-center shrink-0">
                  <span className="font-display text-2xl font-bold text-navy/30">KO</span>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-navy">{PROFILE.name}</h2>
                  <p className="font-ui text-xs text-gold tracking-wide">{PROFILE.role}</p>
                  <p className="font-ui text-xs text-stone/40 mt-1">{PROFILE.joinDate}</p>
                </div>
              </div>

              {/* Journey narrative */}
              <p className="font-body text-stone/60 leading-relaxed text-sm mb-6">
                {PROFILE.name.split(' ')[1]} has touched {CONTRIBUTED_LANGUAGES.length} languages across{' '}
                {PROFILE.continents.length} continents, weaving {PROFILE.totalContributions} threads into
                the atlas — {PROFILE.audioHours} hours of sound, {PROFILE.storiesArchived} oral traditions,
                and countless words preserved for future generations.
              </p>

              {/* Languages */}
              <div className="flex flex-wrap gap-2 mb-6">
                {PROFILE.languages.map((l) => (
                  <span key={l} className="font-ui text-[11px] px-3 py-1.5 glass-gold rounded-lg text-navy/60">
                    {l}
                  </span>
                ))}
              </div>

              {/* Action */}
              <div className="flex gap-3">
                <button className="font-ui text-xs px-4 py-2.5 glass-navy-heavy text-ivory rounded-lg hover:bg-navy transition-colors">
                  Edit Profile
                </button>
                <button className="font-ui text-xs px-4 py-2.5 glass rounded-lg text-stone hover:text-navy transition-colors">
                  Export Archive
                </button>
              </div>
            </div>
          </NarrativeBlock>

          {/* Cultural footprint map */}
          <NarrativeBlock delay={100}>
            <div className="glass-heavy rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-px bg-gold/40" />
                <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Cultural Footprint</h3>
              </div>

              <div className="relative bg-navy-abyss rounded-lg overflow-hidden" style={{ height: '180px' }}>
                <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  {[-60,-30,0,30,60].map(lat => {
                    const y = ((90 - lat) / 180) * 500
                    return <line key={lat} x1="0" y1={y} x2="1000" y2={y} stroke="#C8A96B" strokeWidth="0.3" strokeDasharray="2,12" opacity="0.08" />
                  })}
                  {[-120,-60,0,60,120].map(lon => {
                    const x = ((lon + 180) / 360) * 1000
                    return <line key={lon} x1={x} y1="0" x2={x} y2="500" stroke="#C8A96B" strokeWidth="0.3" strokeDasharray="2,12" opacity="0.08" />
                  })}
                </svg>

                {/* Your language dots */}
                {CONTRIBUTED_LANGUAGES.map((lang) => {
                  const { x, y } = toXY(lang.lat, lang.lon)
                  return (
                    <div
                      key={lang.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <span className="block w-3 h-3 rounded-full bg-gold animate-glow-breathe"
                        style={{ boxShadow: '0 0 12px rgba(200,169,107,0.4)', '--vitality-glow-intensity': '0.3' } as React.CSSProperties} />
                    </div>
                  )
                })}
              </div>

              <p className="font-ui text-[10px] text-stone/30 mt-3 text-center">
                {CONTRIBUTED_LANGUAGES.length} languages touched across {PROFILE.continents.length} continents
              </p>
            </div>
          </NarrativeBlock>

          {/* Cultural marks (badges) */}
          <NarrativeBlock delay={200}>
            <div className="glass-heavy rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-5 h-px bg-gold/40" />
                <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Cultural Marks</h3>
              </div>
              <div className="space-y-3">
                {BADGES.map((badge) => (
                  <div
                    key={badge.name}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      badge.earned ? 'glass-gold' : 'opacity-40'
                    }`}
                  >
                    <span className={`text-xl ${badge.earned ? 'text-gold' : 'text-stone/30'}`}>{badge.icon}</span>
                    <div>
                      <p className={`font-ui text-sm font-medium ${badge.earned ? 'text-navy' : 'text-stone/50'}`}>{badge.name}</p>
                      <p className="font-body text-[11px] text-stone/40">{badge.desc}</p>
                    </div>
                    {badge.earned && (
                      <svg className="ml-auto shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 7l3 3 5-5" stroke="#C8A96B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </NarrativeBlock>
        </div>

        {/* ─── Right: contribution timeline + impact ── */}
        <div className="lg:col-span-7">
          {/* Impact story */}
          <NarrativeBlock>
            <div className="glass-heavy rounded-xl p-8 lg:p-10 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-px bg-gold/40" />
                <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Your Impact</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { value: PROFILE.totalContributions.toString(), label: 'Contributions' },
                  { value: `${PROFILE.audioHours}h`, label: 'Audio preserved' },
                  { value: PROFILE.storiesArchived.toString(), label: 'Stories archived' },
                  { value: `${PROFILE.validationScore}%`, label: 'Validation rate' },
                ].map(({ value, label }) => (
                  <div key={label} className="glass rounded-lg p-4 text-center">
                    <p className="font-display text-2xl font-bold text-navy mb-1">{value}</p>
                    <p className="font-ui text-[10px] text-stone/50 tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
              <p className="font-body text-sm text-stone/60 leading-relaxed">
                Your contributions have been accessed by 1,200+ researchers, educators, and community
                members across 38 countries. The oral traditions you archived are now being used in two
                community-led revitalization programs.
              </p>
            </div>
          </NarrativeBlock>

          {/* Contribution timeline */}
          <NarrativeBlock delay={100}>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-px bg-gold/40" />
                <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Contribution Journey</h3>
              </div>
              <div className="relative pl-8 space-y-0">
                {/* Timeline line */}
                <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-gold/30 via-gold/15 to-transparent" />

                {RECENT_CONTRIBUTIONS.map((c, i) => (
                  <NarrativeBlock key={c.id} delay={i * 60}>
                    <div className="relative pb-8 last:pb-0">
                      {/* Timeline dot */}
                      <span className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-ivory bg-gold shadow-sm" />

                      <div className="glass-heavy rounded-xl p-5 hover:shadow-md transition-all group ml-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h4 className="font-display text-base font-bold text-navy group-hover:text-gold transition-colors">{c.title}</h4>
                            <p className="font-body text-xs text-stone/50 italic mt-0.5">{c.languageName}</p>
                          </div>
                          <span className="font-ui text-[10px] text-stone/30 shrink-0">{c.date}</span>
                        </div>
                        <div className="flex items-center gap-3 font-ui text-[11px] text-stone/40">
                          <span className="px-2 py-0.5 glass-gold rounded text-gold/80 text-[10px]">{c.type}</span>
                          {c.verified && (
                            <span className="flex items-center gap-1 text-green-700">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                                <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </NarrativeBlock>
                ))}
              </div>
            </div>
          </NarrativeBlock>

          {/* Languages contributed to */}
          <NarrativeBlock delay={200}>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-gold/40" />
                <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Languages You&apos;ve Touched</h3>
              </div>
              <div className="space-y-3">
                {CONTRIBUTED_LANGUAGES.map((lang) => {
                  const color = VITALITY_STATUS_COLORS[lang.status]
                  return (
                    <Link
                      key={lang.id}
                      href={`/language/${lang.id}`}
                      className="glass-heavy rounded-xl p-5 flex items-center gap-4 group hover:shadow-lg transition-all"
                    >
                      <span className="w-3 h-3 rounded-full shrink-0 animate-glow-breathe"
                        style={{ backgroundColor: color, '--vitality-glow-intensity': '0.2' } as React.CSSProperties} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-display text-base font-bold text-navy group-hover:text-gold transition-colors">{lang.name}</span>
                          <span className="font-body text-sm text-stone/50 italic">{lang.nativeName}</span>
                        </div>
                        <span className="font-ui text-xs text-stone/40">{lang.country} · {lang.vitalityScore}/100</span>
                      </div>
                      <svg className="shrink-0 text-stone/20 group-hover:text-gold transition-colors" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  )
                })}
              </div>
            </div>
          </NarrativeBlock>
        </div>
      </div>
    </div>
  )
}
