import { notFound } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import Link from 'next/link'
import {
  LANGUAGES,
  RECENT_CONTRIBUTIONS,
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  formatSpeakers,
} from '@/lib/data'
import AudioPlayer from '@/components/language/audio-player'
import VitalityDashboard from '@/components/language/vitality-dashboard'

export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ id: l.id }))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function LanguageDetailPage({ params }: Props) {
  const { id } = await params
  const lang = LANGUAGES.find((l) => l.id === id)
  if (!lang) notFound()

  const relatedContributions = RECENT_CONTRIBUTIONS.filter(
    (c) => c.languageId === lang.id
  )
  const color = VITALITY_STATUS_COLORS[lang.status]

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero banner */}
        <div className="bg-earth text-primary-foreground">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
            <div className="flex items-center gap-2 mb-6 text-xs font-ui text-primary-foreground/40">
              <Link href="/explore" className="hover:text-primary-foreground/70 transition-colors">
                Explorer
              </Link>
              <span>/</span>
              <span className="text-primary-foreground/60">{lang.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
              <div className="lg:col-span-7">
                <span
                  className="inline-block font-ui text-xs font-medium tracking-widest uppercase px-3 py-1 rounded-sm mb-4"
                  style={{ backgroundColor: `${color}30`, color }}
                >
                  {VITALITY_STATUS_LABELS[lang.status]}
                </span>
                <h1 className="font-display text-5xl lg:text-7xl font-bold leading-none mb-3">
                  {lang.name}
                </h1>
                <p className="font-body text-3xl text-primary-foreground/50 mb-6">{lang.nativeName}</p>
                <p className="font-body text-primary-foreground/60 leading-relaxed max-w-2xl text-lg">
                  {lang.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {lang.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-ui text-xs px-2.5 py-1 border border-primary-foreground/15 text-primary-foreground/50 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                {/* Key stats */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Native Speakers', value: formatSpeakers(lang.speakers) },
                    { label: 'Language Family', value: lang.family },
                    { label: 'ISO Code', value: lang.iso.toUpperCase() },
                    { label: 'Region', value: lang.region },
                    { label: 'Audio Recordings', value: lang.audioCount.toLocaleString() },
                    { label: 'Stories Archived', value: lang.storiesArchived.toString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="border-t border-primary-foreground/10 pt-3">
                      <p className="font-ui text-xs text-primary-foreground/40 tracking-wide mb-1">{label}</p>
                      <p className="font-ui text-sm font-medium text-primary-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Vitality score */}
                <div className="mt-6 pt-6 border-t border-primary-foreground/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-ui text-xs text-primary-foreground/40 tracking-wide">Vitality Score</p>
                    <p className="font-mono text-sm font-medium" style={{ color }}>{lang.vitalityScore}/100</p>
                  </div>
                  <div className="h-1 bg-primary-foreground/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${lang.vitalityScore}%`, backgroundColor: color }}
                    />
                  </div>
                </div>

                <Link
                  href="/contribute"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 px-6 py-3 bg-gold font-ui text-sm font-medium tracking-wide hover:bg-gold/90 transition-colors"
                  style={{ color: '#1F1F1F' }}
                >
                  Contribute to {lang.name}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main content */}
            <div className="lg:col-span-8 space-y-16">

              {/* Featured phrase */}
              {lang.featuredPhrase && (
                <section>
                  <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
                    <div className="w-6 h-px bg-gold" />
                    Featured Phrase
                  </h2>
                  <div className="border border-border p-8 bg-surface">
                    <p className="font-display text-4xl lg:text-5xl font-bold text-foreground italic mb-3">
                      &ldquo;{lang.featuredPhrase.text}&rdquo;
                    </p>
                    <p className="font-body text-lg text-muted-foreground mb-2">
                      {lang.featuredPhrase.translation}
                    </p>
                    <p className="font-mono text-sm text-muted-foreground/60">
                      {lang.featuredPhrase.phonetic}
                    </p>
                  </div>
                </section>
              )}

              {/* Audio Library */}
              <section>
                <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
                  <div className="w-6 h-px bg-gold" />
                  Pronunciation Library
                </h2>
                <div className="space-y-3">
                  {[
                    { title: 'Greeting — Morning salutation', duration: '0:24', contributor: 'M. Pérez Gómez', date: '2 days ago' },
                    { title: 'Numbers 1–20 with tonal markers', duration: '1:42', contributor: 'T. Yamamoto', date: '1 week ago' },
                    { title: 'Seasonal vocabulary — Harvest terms', duration: '3:15', contributor: 'R. Cañumil', date: '3 weeks ago' },
                    { title: 'Ceremonial opening invocation', duration: '4:02', contributor: 'K. Bērziņš', date: '1 month ago' },
                  ].map((clip, i) => (
                    <AudioPlayer key={i} {...clip} />
                  ))}
                </div>
              </section>

              {/* Story Archive */}
              <section>
                <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
                  <div className="w-6 h-px bg-gold" />
                  Story Archive
                </h2>
                <div className="space-y-0 divide-y divide-border">
                  {[
                    {
                      title: 'The Origin of Fire — A creation narrative',
                      type: 'Oral History',
                      contributor: 'Elder J. Sikwame',
                      words: 1240,
                      hasAudio: true,
                    },
                    {
                      title: 'Songs of the Harvest Moon',
                      type: 'Ceremonial Song',
                      contributor: 'Cultural Council',
                      words: 340,
                      hasAudio: true,
                    },
                    {
                      title: 'The Navigator&apos;s Star Map',
                      type: 'Traditional Knowledge',
                      contributor: 'Capt. H. Ngata',
                      words: 2100,
                      hasAudio: false,
                    },
                  ].map((story, i) => (
                    <div key={i} className="py-5 flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M2 4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5l-3 2V4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-base font-bold text-foreground mb-0.5">{story.title}</h3>
                        <div className="flex flex-wrap gap-3 text-xs font-ui text-muted-foreground">
                          <span>{story.type}</span>
                          <span className="w-1 h-1 rounded-full bg-border self-center" />
                          <span>{story.contributor}</span>
                          <span className="w-1 h-1 rounded-full bg-border self-center" />
                          <span>{story.words.toLocaleString()} words</span>
                          {story.hasAudio && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-border self-center" />
                              <span className="text-forest font-medium">Audio available</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button className="font-ui text-xs text-muted-foreground/50 hover:text-clay transition-colors">
                        Read &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent contributions */}
              {relatedContributions.length > 0 && (
                <section>
                  <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-3">
                    <div className="w-6 h-px bg-gold" />
                    Recent Contributions
                  </h2>
                  <div className="space-y-4">
                    {relatedContributions.map((c) => (
                      <div key={c.id} className="p-4 border border-border bg-surface">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-ui text-xs text-muted-foreground capitalize">{c.type.replace('-', ' ')}</span>
                          {c.verified && (
                            <span className="font-ui text-[10px] text-forest font-medium tracking-wider">· Verified</span>
                          )}
                        </div>
                        <h3 className="font-display text-sm font-bold text-foreground mb-1">{c.title}</h3>
                        <p className="font-body text-xs text-muted-foreground">{c.contributor} · {c.date}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-8">
                <VitalityDashboard lang={lang} />

                {/* Contributor community */}
                <div className="border border-border p-6">
                  <h3 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                    Contributors ({lang.contributors})
                  </h3>
                  <div className="space-y-3">
                    {['M. Pérez Gómez', 'T. Yamamoto', 'R. Cañumil', 'K. Bērziņš'].slice(0, lang.contributors > 3 ? 4 : lang.contributors).map((name, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-earth/15 flex items-center justify-center shrink-0">
                          <span className="font-ui text-[10px] font-bold text-earth">{name.charAt(0)}</span>
                        </div>
                        <span className="font-ui text-xs text-foreground">{name}</span>
                        {i === 0 && (
                          <span className="ml-auto font-ui text-[10px] text-forest">Active</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="font-ui text-xs text-muted-foreground">Last contribution: {lang.lastContribution}</p>
                  </div>
                </div>

                <Link
                  href="/contribute"
                  className="block w-full px-6 py-4 bg-earth text-primary-foreground font-ui text-sm font-medium tracking-wide text-center hover:bg-clay transition-colors"
                >
                  Add a Contribution
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
