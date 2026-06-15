import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative bg-navy-abyss text-ivory overflow-hidden" aria-label="Atlas colophon">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 80% at 50% 100%, rgba(200,169,107,0.04) 0%, transparent 60%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-16">
        {/* Main colophon */}
        <div className="py-12 border-b border-ivory/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Brand mark */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 group" aria-label="Return to World View">
                <span className="relative grid place-items-center h-11 w-16 rounded-lg overflow-hidden bg-ivory/90 border border-gold/40 shadow-sm">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: 'url(/oralis-logo.png)',
                      backgroundSize: '303% 400%',
                      backgroundPosition: '55% 22%',
                    }}
                  />
                  <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-1.5 w-1.5 border-l border-t border-gold/70" />
                  <span aria-hidden="true" className="pointer-events-none absolute right-1 bottom-1 h-1.5 w-1.5 border-r border-b border-gold/70" />
                </span>
                <div className="flex flex-col">
                  <span className="font-display text-xl font-bold tracking-tight text-ivory group-hover:text-gold transition-colors">Oralis</span>
                  <span className="font-body text-xs text-ivory/25 italic">A living atlas of human cultural memory</span>
                </div>
              </Link>
            </div>

            {/* Atlas links */}
            <div className="flex flex-wrap items-center gap-6 lg:gap-8">
              {[
                { label: 'World View', href: '/' },
                { label: 'Discover', href: '/explore' },
                { label: 'Preserve', href: '/contribute' },
                { label: 'Observatory', href: '/observatory' },
                { label: 'Insights', href: '/insights' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-ui text-xs text-ivory/25 hover:text-ivory/60 transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="font-ui text-[11px] text-ivory/15">
              &copy; {new Date().getFullYear()} Oralis. Every language carries a world.
            </p>
            <span className="text-ivory/10">&middot;</span>
            <a href="https://github.com/charwayyyyyy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group text-ivory/20 hover:text-ivory/60 transition-colors">
              <span className="font-ui text-[11px]">Built by charwayyyyyy</span>
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-ivory transition-colors">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-ui text-[10px] text-ivory/10 tracking-wider uppercase">Infrastructure</span>
            <span className="font-mono text-[10px] text-gold/25">AWS</span>
            <span className="font-ui text-[10px] text-ivory/8">&middot;</span>
            <span className="font-mono text-[10px] text-gold/25">Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
