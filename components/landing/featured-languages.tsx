import Link from 'next/link'
import { LANGUAGES, VITALITY_STATUS_LABELS, VITALITY_STATUS_COLORS, formatSpeakers } from '@/lib/data'

const featured = LANGUAGES.slice(0, 4)

function VitalityBar({ score, status }: { score: number; status: string }) {
  const color = VITALITY_STATUS_COLORS[status as keyof typeof VITALITY_STATUS_COLORS] ?? '#C8A96B'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-xs text-muted-foreground tabular-nums w-8 text-right">{score}</span>
    </div>
  )
}

export default function FeaturedLanguages() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-gold" />
              <span className="font-ui text-xs text-muted-foreground tracking-widest uppercase">
                Featured Languages
              </span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
              Voices on the edge<br />of silence.
            </h2>
          </div>
          <Link
            href="/explore"
            className="font-ui text-sm text-clay hover:text-earth transition-colors flex items-center gap-2 group"
          >
            <span>View all 2,847 languages</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="group-hover:translate-x-1 transition-transform">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Featured grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border">
          {/* Large featured — first language */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-border p-8 lg:p-10 flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span
                    className="inline-block font-ui text-xs font-medium tracking-widest uppercase px-2.5 py-1 rounded-sm mb-3"
                    style={{
                      backgroundColor: `${VITALITY_STATUS_COLORS[featured[0].status]}18`,
                      color: VITALITY_STATUS_COLORS[featured[0].status],
                    }}
                  >
                    {VITALITY_STATUS_LABELS[featured[0].status]}
                  </span>
                  <h3 className="font-display text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                    {featured[0].name}
                  </h3>
                  <p className="font-body text-lg text-muted-foreground mt-1">{featured[0].nativeName}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-muted-foreground">{featured[0].iso.toUpperCase()}</p>
                  <p className="font-ui text-xs text-muted-foreground mt-1">{featured[0].country}</p>
                </div>
              </div>

              {featured[0].featuredPhrase && (
                <div className="mb-6 py-4 border-t border-b border-border/50">
                  <p className="font-display text-xl text-earth italic mb-1">
                    &ldquo;{featured[0].featuredPhrase.text}&rdquo;
                  </p>
                  <p className="font-ui text-xs text-muted-foreground">
                    {featured[0].featuredPhrase.translation}
                    <span className="ml-2 font-mono opacity-60">{featured[0].featuredPhrase.phonetic}</span>
                  </p>
                </div>
              )}

              <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {featured[0].description}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-ui text-muted-foreground mb-2">
                <span>Vitality Score</span>
                <span>{featured[0].vitalityScore}/100</span>
              </div>
              <VitalityBar score={featured[0].vitalityScore} status={featured[0].status} />
              <div className="mt-4 flex items-center gap-4">
                <span className="font-ui text-xs text-muted-foreground">{formatSpeakers(featured[0].speakers)}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="font-ui text-xs text-muted-foreground">{featured[0].audioCount.toLocaleString()} recordings</span>
              </div>
              <Link
                href={`/language/${featured[0].id}`}
                className="mt-4 inline-flex items-center gap-2 font-ui text-sm text-earth hover:text-clay transition-colors"
              >
                Explore archive
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right column — three languages */}
          <div className="lg:col-span-7">
            {featured.slice(1).map((lang, i) => (
              <Link
                key={lang.id}
                href={`/language/${lang.id}`}
                className={`flex items-start gap-6 p-6 lg:p-8 hover:bg-muted/50 transition-colors group ${i < 2 ? 'border-b border-border' : ''}`}
              >
                <div className="w-12 h-12 rounded-sm bg-earth/8 flex items-center justify-center shrink-0 group-hover:bg-earth/12 transition-colors"
                  style={{ backgroundColor: `${VITALITY_STATUS_COLORS[lang.status]}12` }}>
                  <span
                    className="font-display font-bold text-base"
                    style={{ color: VITALITY_STATUS_COLORS[lang.status] }}
                  >
                    {lang.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground leading-tight">{lang.name}</h3>
                      <p className="font-body text-sm text-muted-foreground">{lang.nativeName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className="font-ui text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-sm"
                        style={{
                          backgroundColor: `${VITALITY_STATUS_COLORS[lang.status]}18`,
                          color: VITALITY_STATUS_COLORS[lang.status],
                        }}
                      >
                        {VITALITY_STATUS_LABELS[lang.status]}
                      </span>
                    </div>
                  </div>
                  <p className="font-ui text-xs text-muted-foreground mb-2">{lang.country} · {formatSpeakers(lang.speakers)}</p>
                  <VitalityBar score={lang.vitalityScore} status={lang.status} />
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-ui text-xs text-muted-foreground">{lang.audioCount.toLocaleString()} recordings</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="font-ui text-xs text-muted-foreground">{lang.storiesArchived} stories</span>
                  </div>
                </div>

                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground/40 group-hover:text-clay group-hover:translate-x-1 transition-all"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
