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
      className="relative min-h-screen flex flex-col bg-navy-abyss overflow-hidden"
      aria-label="Oralis — World View"
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
            linear-gradient(to top, rgba(10,18,48,0.97) 0%, rgba(10,18,48,0.6) 35%, rgba(10,18,48,0.08) 65%, rgba(10,18,48,0.25) 100%)
          `
        }}
        aria-hidden="true"
      />

      {/* Hero text — lower third, editorial */}
      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-16 pb-8 lg:pb-12">
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 1.5s ease 0.5s, transform 1.5s ease 0.5s',
            }}
          >
            {/* Kicker */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-gold/30" />
              <span className="font-ui text-[11px] text-gold/40 tracking-[0.25em] uppercase">
                A Living Atlas of Human Cultural Memory
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-ivory leading-[1.02] text-balance mb-8"
              style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)' }}
            >
              Every language<br />
              <em className="not-italic text-gold">carries a world.</em>
            </h1>

            {/* Subtext — editorial prose, not metrics */}
            <p
              className="font-body text-ivory/40 leading-relaxed mb-12"
              style={{ fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', maxWidth: '36rem' }}
            >
              Explore 2,847 endangered languages across 147 countries.
              Each dot on this atlas is a living culture — its stories,
              its sounds, its memory of being human.
            </p>

            {/* CTAs — glassmorphism */}
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/explore"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gold/90 backdrop-blur-sm font-ui text-sm font-medium tracking-wide hover:bg-gold transition-all rounded-lg shadow-lg shadow-gold/10"
                style={{ color: '#1A1814' }}
              >
                Begin Exploring
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  className="group-hover:translate-x-0.5 transition-transform duration-300"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/contribute"
                className="inline-flex items-center gap-3 glass-navy rounded-lg px-6 py-4 font-ui text-sm text-ivory/60 hover:text-ivory/90 transition-all"
              >
                <span className="w-5 h-px bg-gold/30" />
                Leave a Memory
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ambient bar — glassmorphism */}
      <div className="relative z-10 border-t border-ivory/5">
        <div className="glass-dark">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-4 flex flex-wrap items-center gap-8 lg:gap-14">
            {[
              { value: '2,847', label: 'languages in the atlas' },
              { value: '38.4K', label: 'cultural guardians' },
              { value: '186K',  label: 'hours of memory preserved' },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-2.5">
                <span className="font-display text-lg font-bold text-gold/70">{value}</span>
                <span className="font-ui text-[10px] text-ivory/20 tracking-wide">{label}</span>
              </div>
            ))}
            <div className="ml-auto hidden sm:flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-pulse" />
              <span className="font-ui text-[10px] text-ivory/15 tracking-widest uppercase">Atlas live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
