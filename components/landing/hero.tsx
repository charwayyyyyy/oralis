'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import WorldAtlas from './world-atlas'
import VoicePortal from '@/components/ui/voice-portal'

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
      {/* Editorial Layered Text Behind Objects */}
      <span
        className="editorial-bg-text top-16 left-4 lg:left-12 text-[18vw] lg:text-[15vw] opacity-40 select-none"
        aria-hidden="true"
      >
        VOICE
      </span>

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

      {/* Full-screen interactive atlas backdrop */}
      <div className="absolute inset-0 animate-atlas-breathe opacity-70">
        <WorldAtlas />
      </div>

      {/* Depth gradient for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to top, rgba(10,18,48,0.98) 0%, rgba(10,18,48,0.75) 45%, rgba(10,18,48,0.2) 75%, rgba(10,18,48,0.4) 100%)
          `
        }}
        aria-hidden="true"
      />

      {/* Main Hero grid: Value proposition + Inverted Voice Portal */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 lg:px-16 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Editorial content */}
          <div
            className="lg:col-span-7"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 1.2s ease 0.3s, transform 1.2s ease 0.3s',
            }}
          >
            {/* Kicker */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-gold/60" />
              <span className="font-ui text-xs md:text-[11px] text-gold/80 tracking-[0.25em] uppercase font-bold">
                A Living Cultural Preservation Platform
              </span>
            </div>

            {/* Headline */}
            <h1 
              id="hero-heading"
              className="font-display font-bold text-ivory leading-[1.05] text-balance mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Every language<br />
              <em className="not-italic text-gold">carries a world.</em>
            </h1>

            {/* Subtext — Core Value Proposition */}
            <p
              className="font-body text-ivory/85 leading-relaxed mb-8 text-base sm:text-lg md:text-xl max-w-2xl"
            >
              Oralis helps speakers, families and communities preserve pronunciations, stories and cultural knowledge in their own voices. Safeguard humanity&apos;s linguistic heritage before silence becomes permanent.
            </p>

            {/* CTAs — high contrast, tactile iOS-inspired surfaces */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
              <Link
                href="/explore"
                className="group flex justify-center items-center gap-3 px-8 py-4 sm:py-5 bg-gold text-navy font-ui text-base font-bold tracking-wide hover:bg-gold-warm transition-all rounded-xl shadow-xl shadow-gold/20 focus-ring min-h-[44px]"
              >
                Explore Languages
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  className="group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/contribute"
                className="flex justify-center items-center gap-3 glass-navy-heavy rounded-xl px-8 py-4 sm:py-5 font-ui text-base text-ivory font-medium hover:bg-navy transition-all border border-ivory/20 hover:border-ivory/40 focus-ring min-h-[44px]"
              >
                <span className="w-5 h-px bg-gold/50 hidden sm:block" aria-hidden="true" />
                Preserve a Voice
              </Link>
            </div>
          </div>

          {/* Right: Inverted Voice Portal (Central Visual Moment) */}
          <div
            className="lg:col-span-5"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'scale(1)' : 'scale(0.95)',
              transition: 'opacity 1.4s ease 0.5s, transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
            }}
          >
            <VoicePortal />
          </div>

        </div>
      </div>

      {/* Bottom ambient bar with honest metric labeling */}
      <div className="relative z-10 border-t border-ivory/10">
        <div className="glass-dark">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-4 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 lg:gap-12">
              <span className="font-ui text-[10px] text-ivory/40 tracking-wider uppercase font-bold border-r border-ivory/10 pr-6 hidden sm:inline">
                Global Estimates (UNESCO)
              </span>
              {[
                { value: '2,847', label: 'Endangered Languages' },
                { value: '3,500', label: 'At Risk this Century' },
                { value: '186K+', label: 'Hours of Oral Memory' },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-baseline gap-2.5">
                  <span className="font-display text-base lg:text-lg font-bold text-gold/95">{value}</span>
                  <span className="font-ui text-[10px] lg:text-xs text-ivory/60 tracking-wide uppercase">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <span className="w-2 h-2 rounded-full bg-gold/80 animate-pulse" />
              <span className="font-ui text-xs text-ivory/60 tracking-widest uppercase font-bold">Oralis Atlas Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

