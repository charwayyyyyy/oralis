'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import WorldAtlas from './world-atlas'

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      className="relative min-h-[100svh] flex flex-col bg-navy-abyss overflow-hidden pt-20"
      aria-labelledby="hero-heading"
    >
      {/* Deep ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 55% 45%, rgba(200,169,107,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 20% 70%, rgba(27,42,94,0.3) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 80% 30%, rgba(200,169,107,0.03) 0%, transparent 50%)
          `
        }}
        aria-hidden="true"
      />

      {/* Full-screen interactive atlas */}
      <div className="absolute inset-0 animate-atlas-breathe">
        <WorldAtlas />
      </div>

      {/* Depth gradient for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to top, rgba(10,18,48,0.98) 0%, rgba(10,18,48,0.7) 40%, rgba(10,18,48,0.1) 70%, rgba(10,18,48,0.3) 100%)
          `
        }}
        aria-hidden="true"
      />

      {/* Hero text — lower third, editorial */}
      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-16 pb-12 lg:pb-16">
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 1.5s ease 0.5s, transform 1.5s ease 0.5s',
            }}
          >
            {/* Kicker */}
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="w-12 h-px bg-gold/50" />
              <span className="font-ui text-xs md:text-[11px] text-gold/70 tracking-[0.25em] uppercase font-bold">
                A Living Atlas of Human Cultural Memory
              </span>
            </div>

            {/* Headline */}
            <h1 
              id="hero-heading"
              className="font-display font-bold text-ivory leading-[1.05] text-balance mb-6 md:mb-8 text-4xl md:text-6xl lg:text-7xl xl:text-[5.5rem]"
            >
              Every language<br />
              <em className="not-italic text-gold">carries a world.</em>
            </h1>

            {/* Subtext — Clear Value Proposition */}
            <p
              className="font-body text-ivory/80 leading-relaxed mb-10 md:mb-12 text-lg md:text-xl max-w-2xl"
            >
              ORALIS is a global platform dedicated to preserving endangered languages. 
              Explore thousands of indigenous voices, or contribute recordings and stories to help safeguard humanity&apos;s linguistic heritage.
            </p>

            {/* CTAs — high contrast, accessible */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
              <Link
                href="/explore"
                className="group flex justify-center items-center gap-3 px-8 py-4 sm:py-5 bg-gold text-navy font-ui text-base sm:text-lg font-bold tracking-wide hover:bg-gold-warm transition-colors rounded-xl shadow-xl shadow-gold/20 focus-ring min-h-[44px]"
              >
                Begin Exploring
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  className="group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/contribute"
                className="flex justify-center items-center gap-3 glass-navy-heavy rounded-xl px-8 py-4 sm:py-5 font-ui text-base sm:text-lg text-ivory font-medium hover:bg-navy transition-colors border border-ivory/20 hover:border-ivory/40 focus-ring min-h-[44px]"
              >
                <span className="w-5 h-px bg-gold/50 hidden sm:block" aria-hidden="true" />
                Leave a Memory
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ambient bar — glassmorphism */}
      <div className="relative z-10 border-t border-ivory/10">
        <div className="glass-dark">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-5 flex flex-wrap items-center gap-6 lg:gap-14">
            {[
              { value: '2,847', label: 'languages indexed' },
              { value: '38.4K', label: 'cultural guardians' },
              { value: '186K',  label: 'hours preserved' },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-2.5">
                <span className="font-display text-lg lg:text-xl font-bold text-gold/90">{value}</span>
                <span className="font-ui text-[10px] lg:text-xs text-ivory/50 tracking-wide uppercase">{label}</span>
              </div>
            ))}
            <div className="ml-auto hidden md:flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-gold/60 animate-pulse" />
              <span className="font-ui text-xs text-ivory/40 tracking-widest uppercase font-bold">Atlas live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
