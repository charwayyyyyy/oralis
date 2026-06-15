'use client'

import { useState } from 'react'
import { SAMPLE_CONTRIBUTOR, RECENT_CONTRIBUTIONS, LANGUAGES, formatNumber } from '@/lib/data'
import Link from 'next/link'

const tabs = ['Overview', 'Contributions', 'Languages', 'Impact']

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
    excerpt: 'Complete vocabulary set for the traditional Mapuche agricultural calendar, recorded with elder community members.',
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
    excerpt: 'Audio documentation of three traditional Livonian fishing songs, annotated with ethnographic context.',
  },
]

const IMPACT_STATS = [
  { label: 'Languages Contributed To', value: 14 },
  { label: 'Communities Reached', value: 28 },
  { label: 'Researchers Assisted', value: 63 },
  { label: 'Hours of Audio Preserved', value: 142 },
]

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('Overview')
  const user = SAMPLE_CONTRIBUTOR

  return (
    <div className="min-h-screen bg-background">
      {/* Header banner */}
      <div className="bg-earth text-primary-foreground py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-gold/60" />
                <span className="font-ui text-xs text-primary-foreground/40 tracking-widest uppercase">
                  Contributor Profile
                </span>
              </div>
              <div className="flex items-center gap-5 mb-4">
                <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
                  <span className="font-display text-2xl font-bold text-gold">A</span>
                </div>
                <div>
                  <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight">{user.name}</h1>
                  <p className="font-body text-primary-foreground/50">{user.location}</p>
                </div>
              </div>
              <p className="font-body text-primary-foreground/60 leading-relaxed max-w-xl">{user.bio}</p>
            </div>

            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Contributions', value: formatNumber(user.contributions) },
                  { label: 'Verified', value: formatNumber(user.verifiedCount) },
                  { label: 'Reputation', value: `${user.reputationScore}/100` },
                  { label: 'Member since', value: user.joinDate },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-primary-foreground/10 p-4">
                    <p className="font-display text-2xl font-bold text-gold mb-0.5">{value}</p>
                    <p className="font-ui text-xs text-primary-foreground/40">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-surface sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-ui text-sm px-4 py-4 border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-earth text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Overview */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              {/* Reputation bar */}
              <div className="border border-border bg-surface p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground">
                    Reputation Score
                  </h3>
                  <span className="font-mono text-sm font-bold text-foreground">{user.reputationScore}/100</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${user.reputationScore}%`, backgroundColor: 'var(--forest)' }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  {[
                    { label: 'Accuracy', value: '98%' },
                    { label: 'Completeness', value: '94%' },
                    { label: 'Community rating', value: '4.9/5' },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="font-display text-xl font-bold text-foreground">{value}</p>
                      <p className="font-ui text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div>
                <h3 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-0 divide-y divide-border">
                  {TIMELINE_CONTRIBUTIONS.slice(0, 5).map((c) => (
                    <div key={c.id} className="py-4 flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-sm font-bold text-foreground">{c.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs font-ui text-muted-foreground">
                              <Link href={`/language/${c.languageId}`} className="text-clay hover:text-earth transition-colors">
                                {c.languageName}
                              </Link>
                              <span>·</span>
                              <span className="capitalize">{c.type.replace('-', ' ')}</span>
                              {c.verified && <><span>·</span><span className="text-forest">Verified</span></>}
                            </div>
                          </div>
                          <span className="font-ui text-xs text-muted-foreground/50 shrink-0">{c.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-6">
              {/* Languages */}
              <div className="border border-border bg-surface p-6">
                <h3 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                  Languages Supported
                </h3>
                <div className="space-y-2">
                  {user.languages.map((lang) => (
                    <div key={lang} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="font-display text-sm font-bold text-foreground">{lang}</span>
                      <span className="font-ui text-xs text-muted-foreground">Active</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 font-ui text-xs text-muted-foreground/50">+10 more languages documented</p>
              </div>

              {/* Badges */}
              <div className="border border-border bg-surface p-6">
                <h3 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                  Recognition
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Master Linguist', desc: '500+ verified contributions' },
                    { label: 'Cultural Steward', desc: '10+ languages documented' },
                    { label: 'Elder Recorder', desc: '50+ native speaker recordings' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-sm bg-gold/15 flex items-center justify-center shrink-0">
                        <span className="text-gold text-xs">◆</span>
                      </div>
                      <div>
                        <p className="font-ui text-xs font-medium text-foreground">{label}</p>
                        <p className="font-ui text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Impact tab */}
        {activeTab === 'Impact' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {IMPACT_STATS.map(({ label, value }) => (
                <div key={label} className="border border-border bg-surface p-6 text-center">
                  <p className="font-display text-4xl font-bold text-earth mb-1">{value.toLocaleString()}</p>
                  <p className="font-ui text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            <div className="border border-border bg-surface p-8">
              <h3 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
                Narrative Impact
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="font-display text-xl font-bold text-foreground mb-3">
                    Dr. Osei-Bonsu&apos;s contributions to the Ainu archive helped establish the first
                    Ainu-language elementary curriculum in Hokkaido.
                  </p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Her 2023 phonological analysis of Ainu tonal patterns, archived in Oralis, was
                    cited in UNESCO&apos;s 2024 Endangered Languages Report and subsequently used by the
                    Hokkaido Ainu Association to develop teaching materials.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { num: '4', desc: 'Peer-reviewed papers citing Oralis contributions' },
                    { num: '2', desc: 'Government language programs informed' },
                    { num: '1,200', desc: 'Students using materials derived from her archive' },
                  ].map(({ num, desc }) => (
                    <div key={desc} className="flex items-start gap-4 border-t border-border pt-4">
                      <span className="font-display text-3xl font-bold text-gold shrink-0">{num}</span>
                      <span className="font-body text-sm text-muted-foreground pt-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contributions tab */}
        {activeTab === 'Contributions' && (
          <div>
            <div className="space-y-0 divide-y divide-border border border-border">
              {TIMELINE_CONTRIBUTIONS.map((c) => (
                <div key={c.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 text-xs font-ui">
                        <Link href={`/language/${c.languageId}`} className="text-clay hover:text-earth transition-colors font-medium">
                          {c.languageName}
                        </Link>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground capitalize">{c.type.replace('-', ' ')}</span>
                        {c.verified && (
                          <span className="font-ui text-[10px] text-forest font-medium tracking-wider uppercase">· Verified</span>
                        )}
                      </div>
                      <h3 className="font-display text-base font-bold text-foreground mb-1">{c.title}</h3>
                      {c.excerpt && (
                        <p className="font-body text-sm text-muted-foreground line-clamp-2">{c.excerpt}</p>
                      )}
                    </div>
                    <span className="font-ui text-xs text-muted-foreground/50 shrink-0 pt-0.5">{c.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages tab */}
        {activeTab === 'Languages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LANGUAGES.slice(0, 6).map((lang) => (
              <Link
                key={lang.id}
                href={`/language/${lang.id}`}
                className="border border-border bg-surface p-6 hover:border-gold/40 transition-colors group"
              >
                <h3 className="font-display text-xl font-bold text-foreground group-hover:text-earth transition-colors mb-0.5">
                  {lang.name}
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-4">{lang.country}</p>
                <div className="h-0.5 bg-border rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lang.vitalityScore}%`,
                      backgroundColor: 'var(--forest)',
                    }}
                  />
                </div>
                <p className="font-ui text-xs text-muted-foreground">
                  {lang.audioCount.toLocaleString()} recordings contributed
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
