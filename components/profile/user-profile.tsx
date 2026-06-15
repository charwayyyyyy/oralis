'use client'

import { useState } from 'react'
import { SAMPLE_CONTRIBUTOR, RECENT_CONTRIBUTIONS, LANGUAGES, formatNumber } from '@/lib/data'
import Link from 'next/link'
import { VITALITY_STATUS_COLORS } from '@/lib/data'

const TABS = ['Overview', 'Contributions', 'Languages', 'Impact'] as const
type Tab = typeof TABS[number]

const TIMELINE_CONTRIBUTIONS = [
  ...RECENT_CONTRIBUTIONS,
  {
    id: '7',
    languageId: 'mapudungun',
    languageName: 'Mapudungun',
    type: 'vocabulary' as const,
    title: 'Agricultural calendar — 180 seasonal terms',
    contributor: 'Dr. Amara Osei-Bonsu',
    location: 'Temuco, Chile (remote)',
    date: '2 weeks ago',
    verified: true,
    excerpt: 'Complete vocabulary for the Mapuche agricultural calendar, recorded with elder community members.',
  },
  {
    id: '8',
    languageId: 'livonian',
    languageName: 'Livonian',
    type: 'story' as const,
    title: 'Coastal fishing songs — 3 traditional recordings',
    contributor: 'Dr. Amara Osei-Bonsu',
    location: 'Oxford, UK',
    date: '3 weeks ago',
    verified: true,
    excerpt: 'Audio documentation of traditional Livonian fishing songs, annotated with ethnographic context.',
  },
]

const IMPACT_STATS = [
  { label: 'Languages Contributed To',   value: 14  },
  { label: 'Communities Reached',         value: 28  },
  { label: 'Researchers Assisted',        value: 63  },
  { label: 'Hours of Audio Preserved',    value: 142 },
]

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const user = SAMPLE_CONTRIBUTOR

  return (
    <div className="min-h-screen bg-background">

      {/* ─── Profile header ──────────────────────────────── */}
      <div className="bg-navy text-ivory py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

            {/* Identity */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-px bg-gold/50" />
                <span className="font-ui text-xs text-ivory/25 tracking-[0.2em] uppercase">Contributor Profile</span>
              </div>
              <div className="flex items-center gap-5 mb-5">
                <div className="w-14 h-14 border border-gold/30 flex items-center justify-center shrink-0 bg-gold/10">
                  <span className="font-display text-2xl font-bold text-gold">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="font-display text-3xl lg:text-4xl font-bold text-ivory leading-tight">{user.name}</h1>
                  <p className="font-body text-ivory/40">{user.location}</p>
                </div>
              </div>
              <p className="font-body text-ivory/50 leading-relaxed max-w-xl">{user.bio}</p>
            </div>

            {/* Stats */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 gap-px bg-ivory/10">
                {[
                  { label: 'Contributions', value: formatNumber(user.contributions) },
                  { label: 'Verified',       value: formatNumber(user.verifiedCount) },
                  { label: 'Reputation',     value: `${user.reputationScore}/100`    },
                  { label: 'Member since',   value: user.joinDate                    },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-navy p-5">
                    <p className="font-display text-2xl font-bold text-gold mb-0.5">{value}</p>
                    <p className="font-ui text-[11px] text-ivory/30">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab bar ─────────────────────────────────────── */}
      <div className="border-b border-border bg-surface sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <nav className="flex" aria-label="Profile sections">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-ui text-sm px-5 py-4 border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-gold text-navy font-medium'
                    : 'border-transparent text-stone hover:text-navy'
                }`}
                aria-current={activeTab === tab ? 'page' : undefined}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── Tab content ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-20">

        {/* Overview */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-8 space-y-12">

              {/* Reputation */}
              <div className="border border-border bg-surface p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-5 h-px bg-gold" aria-hidden="true" />
                  <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Reputation Score</h3>
                </div>
                <div className="flex items-end justify-between mb-3">
                  <span className="font-ui text-xs text-stone">Community rating</span>
                  <span className="font-display text-4xl font-bold text-navy">{user.reputationScore}<span className="font-ui text-lg text-stone/40">/100</span></span>
                </div>
                <div className="h-px bg-border relative overflow-hidden mb-6">
                  <div className="absolute inset-y-0 left-0 h-full bg-gold" style={{ width: `${user.reputationScore}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-6 pt-5 border-t border-border">
                  {[
                    { label: 'Accuracy',         value: '98%'   },
                    { label: 'Completeness',      value: '94%'   },
                    { label: 'Community rating',  value: '4.9/5' },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="font-display text-xl font-bold text-navy mb-0.5">{value}</p>
                      <p className="font-ui text-[11px] text-stone">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-5 h-px bg-gold" aria-hidden="true" />
                  <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Recent Activity</h3>
                </div>
                <div className="divide-y divide-border">
                  {TIMELINE_CONTRIBUTIONS.slice(0, 5).map((c) => (
                    <div key={c.id} className="py-5 flex items-start gap-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" aria-hidden="true" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-sm font-bold text-navy leading-snug">{c.title}</p>
                            <div className="flex items-center gap-2 mt-1 font-ui text-xs text-stone">
                              <Link href={`/language/${c.languageId}`} className="text-gold hover:text-navy transition-colors">
                                {c.languageName}
                              </Link>
                              <span aria-hidden="true">&middot;</span>
                              <span className="capitalize">{c.type.replace('-', ' ')}</span>
                              {c.verified && (
                                <><span aria-hidden="true">&middot;</span>
                                <span className="text-green-700">Verified</span></>
                              )}
                            </div>
                          </div>
                          <span className="font-ui text-xs text-stone/40 shrink-0">{c.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">

              {/* Languages */}
              <div className="border border-border bg-surface p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-4 h-px bg-gold" aria-hidden="true" />
                  <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Languages</h3>
                </div>
                <div className="divide-y divide-border">
                  {user.languages.map((lang) => (
                    <div key={lang} className="flex items-center justify-between py-2.5">
                      <span className="font-display text-sm font-bold text-navy">{lang}</span>
                      <span className="font-ui text-[11px] text-stone/50">Active</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-ui text-[11px] text-stone/40">+10 more documented</p>
              </div>

              {/* Recognition */}
              <div className="border border-border bg-surface p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-4 h-px bg-gold" aria-hidden="true" />
                  <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Recognition</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Master Linguist',   desc: '500+ verified contributions' },
                    { label: 'Cultural Steward',   desc: '10+ languages documented'    },
                    { label: 'Elder Recorder',     desc: '50+ native speaker recordings' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-6 h-6 border border-gold/30 flex items-center justify-center shrink-0">
                        <span className="text-gold text-[10px]">&#9670;</span>
                      </div>
                      <div>
                        <p className="font-ui text-xs font-medium text-navy">{label}</p>
                        <p className="font-ui text-[11px] text-stone/50">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Contributions */}
        {activeTab === 'Contributions' && (
          <div className="divide-y divide-border border border-border">
            {TIMELINE_CONTRIBUTIONS.map((c) => (
              <div key={c.id} className="p-6 hover:bg-surface transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 font-ui text-xs text-stone">
                      <Link href={`/language/${c.languageId}`} className="text-gold hover:text-navy transition-colors font-medium">
                        {c.languageName}
                      </Link>
                      <span aria-hidden="true">&middot;</span>
                      <span className="capitalize">{c.type.replace('-', ' ')}</span>
                      {c.verified && (
                        <><span aria-hidden="true">&middot;</span>
                        <span className="text-green-700 tracking-wide">Verified</span></>
                      )}
                    </div>
                    <h3 className="font-display text-base font-bold text-navy mb-1">{c.title}</h3>
                    {c.excerpt && (
                      <p className="font-body text-sm text-stone line-clamp-2">{c.excerpt}</p>
                    )}
                  </div>
                  <span className="font-ui text-xs text-stone/40 shrink-0 pt-0.5">{c.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {activeTab === 'Languages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {LANGUAGES.slice(0, 6).map((lang) => (
              <Link
                key={lang.id}
                href={`/language/${lang.id}`}
                className="bg-surface p-7 hover:bg-ivory transition-colors group"
              >
                <h3 className="font-display text-xl font-bold text-navy group-hover:text-gold transition-colors mb-0.5">
                  {lang.name}
                </h3>
                <p className="font-body text-sm text-stone mb-5">{lang.country}</p>
                <div className="h-px bg-border relative overflow-hidden mb-3">
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${lang.vitalityScore}%`,
                      backgroundColor: VITALITY_STATUS_COLORS[lang.status],
                    }}
                  />
                </div>
                <p className="font-ui text-xs text-stone/50">{lang.audioCount.toLocaleString()} recordings</p>
              </Link>
            ))}
          </div>
        )}

        {/* Impact */}
        {activeTab === 'Impact' && (
          <div className="space-y-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
              {IMPACT_STATS.map(({ label, value }) => (
                <div key={label} className="bg-surface p-8 text-center">
                  <p className="font-display text-5xl font-bold text-navy mb-2">{value.toLocaleString()}</p>
                  <p className="font-ui text-xs text-stone">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-navy text-ivory p-10 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <p className="font-display text-xl lg:text-2xl font-bold text-ivory mb-5 text-balance">
                    Dr. Osei-Bonsu&apos;s contributions to the Ainu archive helped establish the first
                    Ainu-language elementary curriculum in Hokkaido.
                  </p>
                  <p className="font-body text-sm text-ivory/50 leading-relaxed">
                    Her 2023 phonological analysis of Ainu tonal patterns, archived in Oralis, was
                    cited in UNESCO&apos;s 2024 Endangered Languages Report and subsequently used by the
                    Hokkaido Ainu Association to develop teaching materials.
                  </p>
                </div>
                <div className="space-y-5">
                  {[
                    { num: '4',     desc: 'Peer-reviewed papers citing Oralis contributions'   },
                    { num: '2',     desc: 'Government language programs informed'               },
                    { num: '1,200', desc: 'Students using materials derived from her archive'  },
                  ].map(({ num, desc }) => (
                    <div key={desc} className="flex items-start gap-5 border-t border-ivory/10 pt-5">
                      <span className="font-display text-4xl font-bold text-gold shrink-0">{num}</span>
                      <span className="font-body text-sm text-ivory/50 pt-2">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
