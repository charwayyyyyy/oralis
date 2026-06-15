import Link from 'next/link'
import { LANGUAGES, VITALITY_STATUS_LABELS, VITALITY_STATUS_COLORS, formatSpeakers } from '@/lib/data'

const featured = LANGUAGES.slice(0, 5)

export default function FeaturedLanguages() {
  return (
    <section className="bg-surface border-b border-border" aria-label="Featured endangered languages">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-24 lg:py-32">

        {/* Editorial header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16 lg:mb-20 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-8 h-px bg-gold" />
              <span className="font-ui text-xs text-stone tracking-[0.2em] uppercase">Selected from the archive</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-navy leading-tight text-balance">
              Voices on the edge of silence.
            </h2>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 font-ui text-sm text-stone hover:text-navy transition-colors group"
            >
              <span>View all 2,847 languages</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                className="group-hover:translate-x-0.5 transition-transform">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Asymmetric editorial layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-border">

          {/* Hero language — large */}
          <Link
            href={`/language/${featured[0].id}`}
            className="lg:col-span-5 bg-navy group p-10 lg:p-12 flex flex-col justify-between min-h-[420px]"
          >
            <div>
              <span
                className="inline-block font-ui text-[10px] font-medium tracking-[0.18em] uppercase px-2.5 py-1 mb-6"
                style={{
                  backgroundColor: `${VITALITY_STATUS_COLORS[featured[0].status]}30`,
                  color: VITALITY_STATUS_COLORS[featured[0].status],
                }}
              >
                {VITALITY_STATUS_LABELS[featured[0].status]}
              </span>
              <h3 className="font-display text-4xl lg:text-5xl font-bold text-ivory leading-tight mb-2">
                {featured[0].name}
              </h3>
              <p className="font-body text-2xl text-gold/60 mb-6">{featured[0].nativeName}</p>
              {featured[0].featuredPhrase && (
                <p className="font-display text-base text-ivory/50 italic leading-relaxed mb-6 border-l-2 border-gold/30 pl-4">
                  &ldquo;{featured[0].featuredPhrase.text}&rdquo;
                  <span className="block font-body text-sm not-italic text-ivory/35 mt-1">
                    {featured[0].featuredPhrase.translation}
                  </span>
                </p>
              )}
              <p className="font-body text-sm text-ivory/40 leading-relaxed line-clamp-3">
                {featured[0].description}
              </p>
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between font-ui text-xs text-ivory/30 mb-2">
                <span>Vitality</span>
                <span className="font-mono" style={{ color: VITALITY_STATUS_COLORS[featured[0].status] }}>
                  {featured[0].vitalityScore}/100
                </span>
              </div>
              <div className="h-px bg-ivory/10 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 h-full"
                  style={{
                    width: `${featured[0].vitalityScore}%`,
                    backgroundColor: VITALITY_STATUS_COLORS[featured[0].status],
                  }}
                />
              </div>
              <div className="flex items-center gap-2 mt-5 font-ui text-xs text-gold/60 group-hover:text-gold transition-colors">
                <span>Open archive</span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Four secondary languages */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
            {featured.slice(1).map((lang) => {
              const color = VITALITY_STATUS_COLORS[lang.status]
              return (
                <Link
                  key={lang.id}
                  href={`/language/${lang.id}`}
                  className="bg-surface group p-7 lg:p-8 flex flex-col justify-between hover:bg-ivory transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold text-navy leading-tight">{lang.name}</h3>
                        <p className="font-body text-sm text-stone">{lang.nativeName}</p>
                      </div>
                      <span
                        className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                        style={{ backgroundColor: color }}
                        aria-label={VITALITY_STATUS_LABELS[lang.status]}
                      />
                    </div>
                    <p className="font-ui text-xs text-stone mb-4">
                      {lang.country} &middot; {formatSpeakers(lang.speakers)}
                    </p>
                    <div className="h-px bg-border relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0" style={{ width: `${lang.vitalityScore}%`, backgroundColor: color }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-5 font-ui text-xs text-stone/50 group-hover:text-navy transition-colors">
                    <span>{lang.audioCount.toLocaleString()} recordings</span>
                    <span className="ml-auto">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                        className="group-hover:translate-x-0.5 transition-transform">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
