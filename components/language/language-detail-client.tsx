'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LANGUAGES,
  RECENT_CONTRIBUTIONS,
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  formatSpeakers,
  type Language,
} from '@/lib/data'
import AudioPlayer from '@/components/language/audio-player'

const RECORDINGS = [
  { title: 'Morning greeting — traditional salutation', duration: '0:24', contributor: 'M. Pérez Gómez', date: '2 days ago' },
  { title: 'Numbers 1–20 with tonal markers', duration: '1:42', contributor: 'T. Yamamoto', date: '1 week ago' },
  { title: 'Seasonal vocabulary — harvest terms', duration: '3:15', contributor: 'R. Cañumil', date: '3 weeks ago' },
  { title: 'Ceremonial opening invocation', duration: '4:02', contributor: 'K. Bērziņš', date: '1 month ago' },
]

const STORIES = [
  { title: 'The Origin of Fire', category: 'Cosmology', contributor: 'Elder L. Nahuelpan', duration: '14 min' },
  { title: 'Song of the First River', category: 'Oral Poetry', contributor: 'A. Tshakapesh', duration: '8 min' },
  { title: 'How the Seasons Were Named', category: 'Ecological knowledge', contributor: 'M. Waskahat', duration: '22 min' },
]

const LAYERS = [
  { id: 'identity',  label: 'Identity',  icon: '◈' },
  { id: 'sound',     label: 'Sound',     icon: '◉' },
  { id: 'stories',   label: 'Stories',   icon: '◇' },
  { id: 'community', label: 'Community', icon: '◎' },
  { id: 'vitality',  label: 'Vitality',  icon: '◆' },
] as const

type LayerId = typeof LAYERS[number]['id']

function getVitalityWarmth(score: number) {
  // 0-100 → 0-1 warmth
  return score / 100
}

function getVitalityNarrative(lang: Language): string {
  if (lang.vitalityScore < 10) {
    return `${lang.name} is at the edge of silence. With only ${lang.speakers} speaker${lang.speakers !== 1 ? 's' : ''} remaining, every recording is an act of rescue — every contribution a lifeline for an entire world of knowledge.`
  } else if (lang.vitalityScore < 30) {
    return `${lang.name} faces critical endangerment. Intergenerational transmission has nearly ceased, and without sustained intervention, this language — and the unique cosmology it carries — may fall silent within a generation.`
  } else if (lang.vitalityScore < 50) {
    return `${lang.name} is endangered. While speakers remain, the forces of language shift grow stronger with each passing year. Active documentation and revitalization are essential to ensure this voice endures.`
  } else if (lang.vitalityScore < 70) {
    return `${lang.name} is vulnerable but vibrant. Spoken by ${formatSpeakers(lang.speakers)}, it faces pressure from dominant languages but retains strong community roots. Continued documentation strengthens its future.`
  }
  return `${lang.name} maintains relative stability with ${formatSpeakers(lang.speakers)}. However, no language is truly safe without active intergenerational transmission and cultural support.`
}

function getDimensionScore(lang: Language, key: string): number {
  switch (key) {
    case 'speakers': return Math.min(100, Math.log10(lang.speakers + 1) * 20)
    case 'intergenerational': return lang.vitalityScore * 0.9
    case 'domains': return Math.min(100, lang.vitalityScore * 1.1)
    case 'materials': return Math.min(100, (lang.storiesArchived / 10) + lang.vitalityScore * 0.3)
    case 'documentation': return Math.min(100, (lang.audioCount / 20) + lang.vitalityScore * 0.2)
    case 'community': return Math.min(100, lang.contributors * 3 + lang.vitalityScore * 0.3)
    default: return lang.vitalityScore
  }
}

const DIMENSIONS = [
  { key: 'speakers', label: 'Speaker Population' },
  { key: 'intergenerational', label: 'Intergenerational Transmission' },
  { key: 'domains', label: 'Language Domains' },
  { key: 'materials', label: 'Educational Materials' },
  { key: 'documentation', label: 'Documentation Quality' },
  { key: 'community', label: 'Community Engagement' },
]

export default function LanguageDetailClient({ lang }: { lang: Language }) {
  const [activeLayer, setActiveLayer] = useState<LayerId>('identity')

  const color = VITALITY_STATUS_COLORS[lang.status]
  const label = VITALITY_STATUS_LABELS[lang.status]
  const warmth = getVitalityWarmth(lang.vitalityScore)

  return (
    <main className="min-h-screen bg-background pt-[72px]">
      {/* ─── Territory banner ─────────────────────── */}
      <div
        className="relative text-ivory overflow-hidden"
        style={{
          background: `linear-gradient(135deg, 
            #0A1230 0%, 
            hsl(230, 60%, ${12 + warmth * 8}%) 40%,
            hsl(${35 + warmth * 10}, ${30 + warmth * 30}%, ${14 + warmth * 8}%) 100%)`,
          '--vitality-warmth': warmth,
        } as React.CSSProperties}
      >
        {/* Vitality glow */}
        <div
          className="absolute inset-0 pointer-events-none animate-glow-breathe"
          style={{
            background: `radial-gradient(ellipse 50% 70% at 70% 50%, ${color}15 0%, transparent 60%)`,
            '--vitality-glow-intensity': warmth * 0.3,
            '--vitality-pulse-speed': `${4 - warmth * 2}s`,
          } as React.CSSProperties}
          aria-hidden="true"
        />

        {/* Topographic pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='40' fill='none' stroke='%23C8A96B' stroke-width='0.5'/%3E%3Ccircle cx='100' cy='100' r='70' fill='none' stroke='%23C8A96B' stroke-width='0.3'/%3E%3Ccircle cx='100' cy='100' r='95' fill='none' stroke='%23C8A96B' stroke-width='0.2'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-16 pt-12 pb-16 lg:pt-16 lg:pb-24">
          {/* Breadcrumb — spatial depth */}
          <nav className="flex items-center gap-2 font-ui text-[11px] text-ivory/20 mb-10" aria-label="Atlas depth">
            <Link href="/" className="hover:text-ivory/40 transition-colors">World</Link>
            <span aria-hidden="true">→</span>
            <Link href="/explore" className="hover:text-ivory/40 transition-colors">{lang.continent || 'World'}</Link>
            <span aria-hidden="true">→</span>
            <Link href="/explore" className="hover:text-ivory/40 transition-colors">{lang.country || lang.region}</Link>
            <span aria-hidden="true">→</span>
            <span className="text-gold/50">{lang.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-end">
            {/* Left — identity */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-7">
                <span className="w-2.5 h-2.5 rounded-full animate-glow-breathe" style={{ backgroundColor: color, '--vitality-glow-intensity': '0.3' } as React.CSSProperties} aria-hidden="true" />
                <span className="font-ui text-xs tracking-[0.18em] uppercase" style={{ color }}>{label}</span>
              </div>

              <h1 className="font-display font-bold text-ivory leading-none mb-3"
                style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
                {lang.name}
              </h1>
              <p className="font-body text-gold/40 mb-8"
                style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)' }}>
                {lang.nativeName}
              </p>

              <p className="font-body text-ivory/40 leading-relaxed text-base lg:text-lg max-w-2xl mb-8">
                {lang.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {(lang.tags || []).map((tag) => (
                  <span key={tag} className="font-ui text-[11px] px-3 py-1.5 glass-navy rounded-lg text-ivory/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — vitality score as physical element */}
            <div className="lg:col-span-5">
              <div className="glass-navy rounded-xl p-8 animate-glow-breathe" style={{ '--vitality-glow-intensity': warmth * 0.15 } as React.CSSProperties}>
                <div className="flex items-end justify-between mb-5">
                  <span className="font-ui text-[11px] text-ivory/20 tracking-[0.18em] uppercase">Vitality Index</span>
                  <span className="font-display text-5xl font-bold leading-none" style={{ color }}>
                    {lang.vitalityScore}
                    <span className="font-ui text-lg text-ivory/15 ml-1">/100</span>
                  </span>
                </div>
                <div className="h-1.5 bg-ivory/5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${lang.vitalityScore}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}50` }}
                  />
                </div>
                <div className="flex justify-between font-ui text-[10px] text-ivory/10 mb-6">
                  <span>Silent</span>
                  <span>Thriving</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Speakers', value: formatSpeakers(lang.speakers || 0) },
                    { label: 'Family', value: lang.family || 'Unknown' },
                    { label: 'Recordings', value: (lang.audioCount || 0).toLocaleString() },
                    { label: 'Stories', value: (lang.storiesArchived || 0).toString() },
                  ].map(({ label: fl, value }) => (
                    <div key={fl}>
                      <p className="font-ui text-[10px] text-ivory/15 tracking-wide mb-1">{fl}</p>
                      <p className="font-ui text-sm text-ivory/60">{value}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/contribute"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-gold/90 backdrop-blur-sm font-ui text-sm font-medium tracking-wide hover:bg-gold transition-all rounded-lg"
                  style={{ color: '#1A1814' }}
                >
                  Contribute to {lang.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cultural Memory Layers ───────────────── */}
      <div className="sticky top-[72px] z-30 glass-heavy border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <nav className="flex overflow-x-auto atlas-scroll" aria-label="Cultural memory layers">
            {LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-2 font-ui text-sm px-5 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeLayer === layer.id
                    ? 'border-gold text-navy font-medium'
                    : 'border-transparent text-stone/50 hover:text-navy'
                }`}
              >
                <span className="text-gold/50">{layer.icon}</span>
                {layer.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── Layer content ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-24 animate-page-enter" key={activeLayer}>

        {/* Layer 1: Identity */}
        {activeLayer === 'identity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            <div className="lg:col-span-7 space-y-16">
              {/* Featured phrase — museum exhibit */}
              {lang.featuredPhrase && (
                <section aria-label="Featured phrase">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-8 h-px bg-gold/40" />
                    <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Featured Phrase</h2>
                  </div>
                  <div className="glass-heavy rounded-xl p-10 lg:p-12">
                    <p className="font-display font-bold text-navy italic leading-tight mb-5 text-balance"
                      style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
                      &ldquo;{lang.featuredPhrase.text}&rdquo;
                    </p>
                    <p className="font-body text-lg text-stone mb-2">{lang.featuredPhrase.translation}</p>
                    <p className="font-mono text-sm text-stone/40">{lang.featuredPhrase.phonetic}</p>
                  </div>
                </section>
              )}

              {/* About this language */}
              <section aria-label="About">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-px bg-gold/40" />
                  <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">About {lang.name}</h2>
                </div>
                <div className="prose prose-stone max-w-none">
                  <p className="font-body text-stone leading-relaxed text-base lg:text-lg">{lang.description}</p>
                </div>
                <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'ISO 639-3', value: lang.iso ? lang.iso.toUpperCase() : 'N/A' },
                    { label: 'Region', value: lang.region || 'Unknown' },
                    { label: 'Country', value: lang.country || 'Unknown' },
                    { label: 'Language Family', value: lang.family || 'Unknown' },
                    { label: 'Continent', value: lang.continent || 'Unknown' },
                    { label: 'Contributors', value: (lang.contributors || 1).toString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="glass rounded-lg p-4">
                      <p className="font-ui text-[10px] text-stone/40 tracking-wide mb-1">{label}</p>
                      <p className="font-ui text-sm text-navy font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5 space-y-8">
              <div className="glass-heavy rounded-xl p-6">
                <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase mb-5">From the same region</h3>
                <div className="space-y-3">
                  {LANGUAGES.filter((l) => l.id !== lang.id && l.continent === lang.continent).slice(0, 4).map((l) => (
                    <Link key={l.id} href={`/language/${l.id}`} className="flex items-center gap-3 py-2.5 group">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: VITALITY_STATUS_COLORS[l.status] }} />
                      <span className="font-ui text-sm text-stone group-hover:text-navy transition-colors">{l.name}</span>
                      <span className="ml-auto font-ui text-xs text-stone/30">{l.country}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Layer 2: Sound */}
        {activeLayer === 'sound' && (
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-gold/40" />
              <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Pronunciation Library</h2>
              <span className="font-mono text-[10px] text-stone/30">{lang.audioCount.toLocaleString()} recordings</span>
            </div>
            <p className="font-body text-stone/60 leading-relaxed mb-10 max-w-xl">
              Audio is the most powerful form of cultural preservation. A recording of a native
              speaker carries meaning, emotion, and cadence that text alone cannot capture.
            </p>
            <div className="space-y-4">
              {RECORDINGS.map((clip, i) => (
                <AudioPlayer key={i} {...clip} />
              ))}
            </div>
          </div>
        )}

        {/* Layer 3: Stories */}
        {activeLayer === 'stories' && (
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-gold/40" />
              <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Oral Traditions</h2>
              <span className="font-mono text-[10px] text-stone/30">{lang.storiesArchived} archived</span>
            </div>
            <p className="font-body text-stone/60 leading-relaxed mb-10 max-w-xl">
              Stories are the vessels through which cultures transmit their deepest knowledge —
              cosmologies, ecological wisdom, moral codes, and histories that span millennia.
            </p>
            <div className="space-y-4">
              {STORIES.map((story, i) => (
                <div key={i} className="glass-heavy rounded-xl p-6 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 glass-gold rounded-lg flex items-center justify-center shrink-0 group-hover:bg-gold/15 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M5 3l9 5-9 5V3z" fill="currentColor" className="text-gold/50 group-hover:text-gold transition-colors" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-base font-bold text-navy mb-1 group-hover:text-gold transition-colors">{story.title}</h3>
                      <div className="flex items-center gap-3 font-ui text-xs text-stone/50">
                        <span>{story.category}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{story.contributor}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{story.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer 4: Community */}
        {activeLayer === 'community' && (
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-gold/40" />
              <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Community of Guardians</h2>
              <span className="font-mono text-[10px] text-stone/30">{lang.contributors} contributors</span>
            </div>
            <p className="font-body text-stone/60 leading-relaxed mb-10 max-w-xl">
              These are the people who have dedicated themselves to preserving {lang.name} —
              linguists, elders, community members, and researchers from around the world.
            </p>

            <div className="flex items-center gap-4 glass-heavy rounded-xl p-6 mb-8">
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(5, lang.contributors) }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-navy/10 border-2 border-ivory flex items-center justify-center">
                    <span className="font-display text-xs font-bold text-navy/40">{String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
              <span className="font-ui text-sm text-stone">
                {lang.contributors} guardians have contributed to this archive
              </span>
            </div>

            {/* Recent contributions */}
            <div className="space-y-4">
              {RECENT_CONTRIBUTIONS.slice(0, 4).map((c) => (
                <div key={c.id} className="glass-heavy rounded-xl p-5 flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-navy leading-snug">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1 font-ui text-xs text-stone/50">
                      <span>{c.contributor}</span>
                      <span>&middot;</span>
                      <span>{c.date}</span>
                      {c.verified && (
                        <><span>&middot;</span><span className="text-green-700">Verified</span></>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer 5: Vitality */}
        {activeLayer === 'vitality' && (
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-gold/40" />
              <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Vitality Assessment</h2>
            </div>

            {/* Narrative interpretation */}
            <div className="glass-heavy rounded-xl p-8 lg:p-10 mb-10">
              <p className="font-display text-xl lg:text-2xl font-bold text-navy leading-snug mb-4">
                {getVitalityNarrative(lang)}
              </p>
              <div className="flex items-center gap-3 mt-6">
                <span className="w-3 h-3 rounded-full animate-glow-breathe" style={{ backgroundColor: color, '--vitality-glow-intensity': '0.3' } as React.CSSProperties} />
                <span className="font-ui text-sm" style={{ color }}>{label}</span>
                <span className="font-mono text-sm text-stone/40">&mdash; {lang.vitalityScore}/100</span>
              </div>
            </div>

            {/* Dimension bars */}
            <div className="space-y-5">
              {DIMENSIONS.map(({ key, label: dimLabel }) => {
                const score = Math.round(getDimensionScore(lang, key))
                return (
                  <div key={key} className="glass rounded-lg p-4">
                    <div className="flex items-center justify-between text-xs font-ui mb-2">
                      <span className="text-navy font-medium">{dimLabel}</span>
                      <span className="font-mono text-stone/50">{score}/100</span>
                    </div>
                    <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${score}%`,
                          background: `linear-gradient(90deg, ${color}80, ${color})`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-8 font-ui text-[10px] text-stone/30 leading-relaxed">
              Vitality scores computed from UNESCO Language Vitality and Endangerment Framework criteria,
              community-reported data, and Oralis contributor activity.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
