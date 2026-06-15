'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LANGUAGES, VITALITY_STATUS_COLORS } from '@/lib/data'

const SCRIPT_CHARS = ['ᐊ','ᐃ','ᐅ','ᓂ','あ','の','ก','ข','ﺍ','ﺑ','α','β','ሀ','ᚠ','ᚢ','ᛗ']

function WorldMap() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPulse(n => (n + 1) % LANGUAGES.length), 2600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Graticule grid */}
      <svg
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Latitude lines */}
        {[-60,-30,0,30,60].map(lat => {
          const y = ((90 - lat) / 180) * 500
          return <line key={lat} x1="0" y1={y} x2="1000" y2={y} stroke="#C8A96B" strokeWidth="0.4" strokeDasharray="3,9" opacity="0.25" />
        })}
        {/* Longitude lines */}
        {[-120,-60,0,60,120].map(lon => {
          const x = ((lon + 180) / 360) * 1000
          return <line key={lon} x1={x} y1="0" x2={x} y2="500" stroke="#C8A96B" strokeWidth="0.4" strokeDasharray="3,9" opacity="0.25" />
        })}
        {/* Equator — slightly brighter */}
        <line x1="0" y1="277.8" x2="1000" y2="277.8" stroke="#C8A96B" strokeWidth="0.8" opacity="0.35" />
        {/* Prime meridian */}
        <line x1="500" y1="0" x2="500" y2="500" stroke="#C8A96B" strokeWidth="0.8" opacity="0.35" />

        {/* Continental silhouettes — simplified */}
        {/* North America */}
        <path d="M130,100 L170,70 L230,75 L265,105 L275,145 L255,190 L225,215 L195,200 L165,165 L140,130 Z"
          fill="rgba(200,169,107,0.06)" stroke="#C8A96B" strokeWidth="0.7" opacity="0.5" />
        {/* Central America connector */}
        <path d="M225,215 L230,235 L240,240" fill="none" stroke="#C8A96B" strokeWidth="0.7" opacity="0.4" />
        {/* South America */}
        <path d="M240,240 L275,230 L300,260 L295,330 L270,375 L245,380 L220,360 L215,310 L225,265 Z"
          fill="rgba(200,169,107,0.06)" stroke="#C8A96B" strokeWidth="0.7" opacity="0.5" />
        {/* Europe */}
        <path d="M455,85 L510,75 L535,95 L525,120 L500,135 L470,128 L450,108 Z"
          fill="rgba(200,169,107,0.06)" stroke="#C8A96B" strokeWidth="0.7" opacity="0.5" />
        {/* Africa */}
        <path d="M465,140 L525,128 L555,160 L555,235 L535,285 L505,305 L475,285 L460,232 L455,180 Z"
          fill="rgba(200,169,107,0.06)" stroke="#C8A96B" strokeWidth="0.7" opacity="0.5" />
        {/* Asia */}
        <path d="M535,80 L710,65 L750,95 L740,155 L700,172 L648,160 L600,170 L565,148 L538,115 Z"
          fill="rgba(200,169,107,0.06)" stroke="#C8A96B" strokeWidth="0.7" opacity="0.5" />
        {/* South Asia peninsula */}
        <path d="M625,170 L645,200 L640,225 L625,215 L615,195 Z"
          fill="rgba(200,169,107,0.06)" stroke="#C8A96B" strokeWidth="0.7" opacity="0.4" />
        {/* Australia */}
        <path d="M705,280 L770,268 L800,298 L788,345 L750,358 L712,342 L698,308 Z"
          fill="rgba(200,169,107,0.06)" stroke="#C8A96B" strokeWidth="0.7" opacity="0.5" />
      </svg>

      {/* Language dots */}
      {LANGUAGES.map((lang, i) => {
        const x = ((lang.lon + 180) / 360) * 100
        const y = ((90 - lang.lat) / 180) * 100
        const color = VITALITY_STATUS_COLORS[lang.status]
        const isPulsing = pulse === i

        return (
          <Link
            key={lang.id}
            href={`/language/${lang.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => setHovered(lang.id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`${lang.name} — ${lang.country}`}
          >
            {isPulsing && (
              <span
                className="absolute inset-0 -m-3 rounded-full map-dot-pulse"
                style={{ backgroundColor: color, opacity: 0.35 }}
                aria-hidden="true"
              />
            )}
            <span
              className="relative block rounded-full transition-all duration-300 group-hover:scale-[2.5]"
              style={{
                width: hovered === lang.id ? 12 : 9,
                height: hovered === lang.id ? 12 : 9,
                backgroundColor: color,
                boxShadow: hovered === lang.id ? `0 0 0 2px rgba(247,244,238,0.5)` : 'none',
              }}
            />
            {hovered === lang.id && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{ bottom: '130%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
              >
                <div className="bg-ivory/95 border border-border px-3 py-2 shadow-xl backdrop-blur-sm">
                  <p className="font-display text-xs font-bold text-navy leading-tight">{lang.name}</p>
                  <p className="font-ui text-[10px] text-stone leading-tight">{lang.country}</p>
                </div>
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col bg-navy overflow-hidden"
      aria-label="Oralis — Enter the Archive"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 55% 42%, rgba(200,169,107,0.07) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Floating script characters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {SCRIPT_CHARS.map((char, i) => (
          <span
            key={i}
            className="absolute font-display text-gold/20 select-none"
            style={{
              fontSize: `${13 + (i % 5) * 5}px`,
              left: `${4 + (i * 6.2) % 90}%`,
              top: `${6 + (i * 7.8) % 85}%`,
              opacity: mounted ? (0.1 + (i % 4) * 0.07) : 0,
              transition: `opacity 2.4s ease ${i * 140}ms`,
              transform: `rotate(${-18 + (i * 13) % 36}deg)`,
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Full-screen interactive map */}
      <div className="absolute inset-0">
        <WorldMap />
      </div>

      {/* Bottom gradient for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(27,42,94,0.96) 0%, rgba(27,42,94,0.55) 38%, rgba(27,42,94,0.10) 100%)' }}
        aria-hidden="true"
      />

      {/* Hero text — lower third */}
      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-16 pb-20 lg:pb-28">
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(22px)',
              transition: 'opacity 1.3s ease 0.4s, transform 1.3s ease 0.4s',
            }}
          >
            <div className="flex items-center gap-4 mb-7">
              <div className="w-10 h-px bg-gold/50" />
              <span className="font-ui text-xs text-gold/60 tracking-[0.22em] uppercase">
                Global Cultural Memory Network
              </span>
            </div>

            <h1 className="font-display font-bold text-ivory leading-[1.04] text-balance mb-7"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)' }}
            >
              Every language<br />
              <em className="not-italic text-gold">carries a world.</em>
            </h1>

            <p
              className="font-body text-ivory/50 leading-relaxed mb-11"
              style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)', maxWidth: '32rem' }}
            >
              2,847 endangered languages. 186,200 hours of oral memory preserved.
              One living archive — built with communities, for all humanity.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/explore"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gold font-ui text-sm font-medium tracking-wide hover:bg-gold-pale transition-colors"
                style={{ color: '#1A1814' }}
              >
                Enter the Archive
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  className="group-hover:translate-x-0.5 transition-transform duration-300"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/contribute"
                className="inline-flex items-center gap-3 font-ui text-sm text-ivory/45 hover:text-ivory/80 transition-colors"
              >
                <span className="w-6 h-px bg-ivory/25" />
                Contribute a language
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="relative z-10 border-t border-ivory/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-5 flex flex-wrap items-center gap-8 lg:gap-12">
          {[
            { value: '2,847', label: 'languages documented' },
            { value: '38.4K', label: 'active contributors' },
            { value: '147',   label: 'countries' },
          ].map(({ value, label }) => (
            <div key={label} className="flex items-baseline gap-2.5">
              <span className="font-display text-lg font-bold text-gold">{value}</span>
              <span className="font-ui text-[11px] text-ivory/30 tracking-wide">{label}</span>
            </div>
          ))}
          <div className="ml-auto hidden sm:flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-pulse" />
            <span className="font-ui text-[11px] text-ivory/25 tracking-widest uppercase">Archive live</span>
          </div>
        </div>
      </div>
    </section>
  )
}
