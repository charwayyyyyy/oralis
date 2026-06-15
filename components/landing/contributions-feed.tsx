import Link from 'next/link'
import { RECENT_CONTRIBUTIONS } from '@/lib/data'

const typeIcons: Record<string, { label: string; icon: React.ReactNode }> = {
  audio: {
    label: 'Audio Recording',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1v14M4 4v8M12 4v8M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  vocabulary: {
    label: 'Vocabulary',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 6h6M5 8.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  story: {
    label: 'Story / Oral History',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5l-3 2V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  'cultural-context': {
    label: 'Cultural Context',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
}

export default function ContributionsFeed() {
  return (
    <section className="py-24 lg:py-32 bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left editorial */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold" />
              <span className="font-ui text-xs text-muted-foreground tracking-widest uppercase">
                Live Contributions
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold text-foreground leading-tight text-balance mb-6">
              A world contributing in real time.
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Every hour, linguists, elders, community members, and researchers
              around the world add to the global archive. Each contribution is a
              thread in the tapestry of human cultural memory.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                <span className="font-ui text-sm text-foreground">847 contributors active right now</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span className="font-ui text-sm text-foreground">Contributions in the last hour: 1,243</span>
              </div>
            </div>
            <Link
              href="/contribute"
              className="mt-8 inline-flex items-center gap-2 font-ui text-sm text-earth hover:text-clay transition-colors group"
            >
              <span>Add your contribution</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="group-hover:translate-x-1 transition-transform">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Right feed */}
          <div className="lg:col-span-8">
            <div className="space-y-0 divide-y divide-border">
              {RECENT_CONTRIBUTIONS.map((contribution, i) => {
                const typeInfo = typeIcons[contribution.type]
                return (
                  <article key={contribution.id} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center gap-1 pt-1 shrink-0 w-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1" />
                        {i < RECENT_CONTRIBUTIONS.length - 1 && (
                          <div className="w-px flex-1 min-h-[2rem] bg-border/60" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-ui text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            {typeInfo?.icon}
                            {typeInfo?.label}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <Link
                            href={`/language/${contribution.languageId}`}
                            className="font-ui text-xs font-medium text-clay hover:text-earth transition-colors"
                          >
                            {contribution.languageName}
                          </Link>
                          {contribution.verified && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="font-ui text-[10px] text-forest font-medium tracking-wider uppercase">Verified</span>
                            </>
                          )}
                        </div>

                        <h3 className="font-display text-base font-bold text-foreground mb-1 leading-snug">
                          {contribution.title}
                        </h3>

                        {contribution.excerpt && (
                          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                            {contribution.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs font-ui text-muted-foreground/70">
                          <span>{contribution.contributor}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{contribution.location}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{contribution.date}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="pt-6 border-t border-border mt-2">
              <Link
                href="/explore"
                className="font-ui text-sm text-muted-foreground hover:text-foreground transition-colors"
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
