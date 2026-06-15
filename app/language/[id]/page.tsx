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

export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ id: l.id }))
}

interface Props {
  params: Promise<{ id: string }>
}

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

export default async function LanguageDetailPage({ params }: Props) {
  const { id } = await params
  const lang = LANGUAGES.find((l) => l.id === id)
  if (!lang) notFound()

  const color = VITALITY_STATUS_COLORS[lang.status]
  const label = VITALITY_STATUS_LABELS[lang.status]

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-[72px]">

        {/* ─── Cinematic header ─────────────────────────────── */}
        <div className="relative bg-navy text-ivory overflow-hidden">
          {/* Subtle pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 65% 80% at 70% 50%, rgba(200,169,107,0.06) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-16 pt-16 pb-20 lg:pt-20 lg:pb-28">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 font-ui text-xs text-ivory/25 mb-12" aria-label="Breadcrumb">
              <Link href="/explore" className="hover:text-ivory/50 transition-colors">Explorer</Link>
              <span aria-hidden="true">/</span>
              <span className="text-ivory/40">{lang.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-end">

              {/* Left — identity */}
              <div className="lg:col-span-7">
                {/* Status badge */}
                <div className="inline-flex items-center gap-2 mb-7">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span
                    className="font-ui text-xs tracking-[0.18em] uppercase"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>

                <h1 className="font-display font-bold text-ivory leading-none mb-3"
                  style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
                  {lang.name}
                </h1>
                <p className="font-body text-gold/50 mb-8"
                  style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)' }}>
                  {lang.nativeName}
                </p>

                <p className="font-body text-ivory/50 leading-relaxed text-base lg:text-lg max-w-2xl mb-8">
                  {lang.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {lang.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-ui text-[11px] px-2.5 py-1 border border-ivory/10 text-ivory/35"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — vitality + facts */}
              <div className="lg:col-span-5">
                {/* Vitality score — large editorial treatment */}
                <div className="mb-8 pb-8 border-b border-ivory/10">
                  <div className="flex items-end justify-between mb-4">
                    <span className="font-ui text-[11px] text-ivory/25 tracking-[0.18em] uppercase">Vitality Index</span>
                    <span className="font-display text-5xl font-bold leading-none" style={{ color }}>
                      {lang.vitalityScore}
                      <span className="font-ui text-lg text-ivory/20 ml-1">/100</span>
                    </span>
                  </div>
                  {/* Score bar */}
                  <div className="h-1 bg-ivory/8 overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${lang.vitalityScore}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 font-ui text-[10px] text-ivory/15">
                    <span>Extinct</span>
                    <span>Thriving</span>
                  </div>
                </div>

                {/* Key facts grid */}
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: 'Speakers', value: formatSpeakers(lang.speakers) },
                    { label: 'Family', value: lang.family },
                    { label: 'ISO 639-3', value: lang.iso.toUpperCase() },
                    { label: 'Region', value: lang.region },
                    { label: 'Recordings', value: lang.audioCount.toLocaleString() },
                    { label: 'Stories', value: lang.storiesArchived.toString() },
                  ].map(({ label: fl, value }) => (
                    <div key={fl}>
                      <p className="font-ui text-[10px] text-ivory/25 tracking-wide mb-1">{fl}</p>
                      <p className="font-ui text-sm text-ivory/70">{value}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href="/contribute"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-gold font-ui text-sm font-medium tracking-wide hover:bg-gold-pale transition-colors"
                  style={{ color: '#1A1814' }}
                >
                  Contribute to {lang.name}
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Archive body ──────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

            {/* Main content */}
            <div className="lg:col-span-8 space-y-20">

              {/* Featured phrase */}
              {lang.featuredPhrase && (
                <section aria-label="Featured phrase">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-6 h-px bg-gold" aria-hidden="true" />
                    <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Featured Phrase</h2>
                  </div>
                  <div className="border border-border p-8 lg:p-10 bg-surface">
                    <p className="font-display font-bold text-navy italic leading-tight mb-4 text-balance"
                      style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                      &ldquo;{lang.featuredPhrase.text}&rdquo;
                    </p>
                    <p className="font-body text-lg text-stone mb-2">{lang.featuredPhrase.translation}</p>
                    <p className="font-mono text-sm text-stone/50">{lang.featuredPhrase.phonetic}</p>
                  </div>
                </section>
              )}

              {/* Audio library */}
              <section aria-label="Pronunciation library">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-6 h-px bg-gold" aria-hidden="true" />
                  <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Pronunciation Library</h2>
                </div>
                <div className="space-y-3">
                  {RECORDINGS.map((clip, i) => (
                    <AudioPlayer key={i} {...clip} />
                  ))}
                </div>
              </section>

              {/* Story archive */}
              <section aria-label="Story archive">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-6 h-px bg-gold" aria-hidden="true" />
                  <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Story Archive</h2>
                </div>
                <div className="divide-y divide-border border border-border">
                  {STORIES.map((story, i) => (
                    <div key={i} className="flex items-start gap-6 p-6 hover:bg-surface transition-colors group cursor-pointer">
                      {/* Play icon */}
                      <div className="w-9 h-9 border border-border flex items-center justify-center shrink-0 group-hover:border-gold transition-colors">
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M5 3l9 5-9 5V3z" fill="currentColor" className="text-stone group-hover:text-gold transition-colors" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base font-bold text-navy mb-1 group-hover:text-gold transition-colors">
                          {story.title}
                        </h3>
                        <div className="flex items-center gap-3 font-ui text-xs text-stone/60">
                          <span>{story.category}</span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{story.contributor}</span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{story.duration} read</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-10" aria-label="Language information">

              {/* Related contributions */}
              {RECENT_CONTRIBUTIONS.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-5 h-px bg-gold" aria-hidden="true" />
                    <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Recent contributions</h3>
                  </div>
                  <div className="space-y-5">
                    {RECENT_CONTRIBUTIONS.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex gap-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" aria-hidden="true" />
                        <div>
                          <p className="font-display text-sm font-bold text-navy leading-snug">{c.title}</p>
                          <p className="font-ui text-xs text-stone/60 mt-1">{c.contributor} &middot; {c.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vitality context */}
              <div className="bg-surface border border-border p-6">
                <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase mb-4">What does this mean?</h3>
                <div className="flex items-start gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                  <p className="font-body text-sm text-stone leading-relaxed">
                    A vitality score of <strong className="text-navy">{lang.vitalityScore}/100</strong> classifies{' '}
                    {lang.name} as <strong style={{ color }}>{label}</strong> — meaning{' '}
                    {lang.vitalityScore < 20
                      ? 'it has very few speakers remaining and is at critical risk of disappearing within a generation.'
                      : lang.vitalityScore < 40
                      ? 'transmission to children is limited and concerted revitalization efforts are needed.'
                      : lang.vitalityScore < 60
                      ? 'the language is spoken but faces significant pressures from dominant languages.'
                      : 'the language is spoken across generations but still requires active documentation.'}
                  </p>
                </div>
                <Link
                  href="/insights"
                  className="font-ui text-xs text-stone hover:text-navy transition-colors border-b border-stone/20 pb-px"
                >
                  About the vitality index &rarr;
                </Link>
              </div>

              {/* Language navigator */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-5 h-px bg-gold" aria-hidden="true" />
                  <h3 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">From the archive</h3>
                </div>
                <div className="space-y-2">
                  {LANGUAGES.filter((l) => l.id !== lang.id && l.continent === lang.continent).slice(0, 4).map((l) => (
                    <Link
                      key={l.id}
                      href={`/language/${l.id}`}
                      className="flex items-center gap-3 py-2.5 group"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: VITALITY_STATUS_COLORS[l.status] }}
                        aria-hidden="true"
                      />
                      <span className="font-ui text-sm text-stone group-hover:text-navy transition-colors">{l.name}</span>
                      <span className="ml-auto font-ui text-xs text-stone/40">{l.country}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
