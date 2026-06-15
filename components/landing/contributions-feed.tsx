import Link from 'next/link'
import { RECENT_CONTRIBUTIONS } from '@/lib/data'

const TYPE_LABELS: Record<string, string> = {
  audio: 'Audio Recording',
  vocabulary: 'Vocabulary',
  story: 'Oral History',
  'cultural-context': 'Cultural Context',
}

export default function ContributionsFeed() {
  return (
    <section className="bg-ivory border-t border-border" aria-label="Live contributions">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left — editorial */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-gold" />
              <span className="font-ui text-xs text-stone tracking-[0.2em] uppercase">From the field</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-navy leading-tight text-balance mb-7">
              A world contributing in real time.
            </h2>
            <p className="font-body text-stone leading-relaxed mb-10">
              Every hour, linguists, elders, community members, and researchers
              add to the archive. Each contribution is a thread in the tapestry
              of human cultural memory.
            </p>
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse shrink-0" />
                <span className="font-ui text-sm text-navy">847 contributors active now</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                <span className="font-ui text-sm text-stone">1,243 contributions in the last hour</span>
              </div>
            </div>
            <Link
              href="/contribute"
              className="inline-flex items-center gap-3 font-ui text-sm text-navy border-b border-navy/30 pb-0.5 hover:border-navy transition-colors group"
            >
              Add your contribution
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                className="group-hover:translate-x-0.5 transition-transform">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Right — feed */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-border">
              {RECENT_CONTRIBUTIONS.map((c) => (
                <article key={c.id} className="py-7 first:pt-0">
                  <div className="flex items-start gap-5">
                    {/* Dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" aria-hidden="true" />

                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                        <span className="font-ui text-[11px] text-stone tracking-wide uppercase">
                          {TYPE_LABELS[c.type] ?? c.type}
                        </span>
                        <span className="text-border" aria-hidden="true">/</span>
                        <Link
                          href={`/language/${c.languageId}`}
                          className="font-ui text-[11px] font-medium text-gold hover:text-navy transition-colors tracking-wide"
                        >
                          {c.languageName}
                        </Link>
                        {c.verified && (
                          <>
                            <span className="text-border" aria-hidden="true">/</span>
                            <span className="font-ui text-[11px] text-green-700 tracking-widest uppercase">Verified</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-bold text-navy leading-snug mb-2">
                        {c.title}
                      </h3>

                      {c.excerpt && (
                        <p className="font-body text-sm text-stone leading-relaxed mb-3 line-clamp-2">
                          {c.excerpt}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-ui text-xs text-stone/60">
                        <span>{c.contributor}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{c.location}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{c.date}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="pt-6 border-t border-border">
              <Link
                href="/explore"
                className="font-ui text-sm text-stone hover:text-navy transition-colors"
              >
                View all recent contributions &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
