'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LANGUAGES, VITALITY_STATUS_COLORS, type VitalityStatus } from '@/lib/data'

const CONTINENTS = [
  { name: 'Americas', cx: 22, cy: 48, languages: 847 },
  { name: 'Europe',   cx: 49, cy: 24, languages: 198 },
  { name: 'Africa',   cx: 51, cy: 55, languages: 712 },
  { name: 'Asia',     cx: 68, cy: 30, languages: 934 },
  { name: 'Oceania',  cx: 79, cy: 68, languages: 156 },
]

const SCRIPT_CHARS = ['ᐊ','ᐃ','ᓂ','あ','の','ก','ﺍ','α','ሀ','ᚠ','ᛗ','ᚢ','ข','ﺑ','β','ᐅ']

function getVitalityGlow(status: VitalityStatus): string {
  switch (status) {
    case 'critically-endangered': return 'rgba(155, 58, 42, 0.6)'
    case 'endangered': return 'rgba(140, 90, 60, 0.5)'
    case 'vulnerable': return 'rgba(200, 169, 107, 0.5)'
    case 'safe': return 'rgba(62, 107, 72, 0.5)'
    case 'dormant': return 'rgba(107, 90, 78, 0.4)'
  }
}

export default function WorldAtlas() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [pulse, setPulse] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 200)
    const t2 = setInterval(() => setPulse(n => (n + 1) % LANGUAGES.length), 3000)
    return () => { clearTimeout(t1); clearInterval(t2) }
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
          return <line key={lat} x1="0" y1={y} x2="1000" y2={y} stroke="#C8A96B" strokeWidth="0.3" strokeDasharray="2,12" opacity="0.15" />
        })}
        {/* Longitude lines */}
        {[-120,-60,0,60,120].map(lon => {
          const x = ((lon + 180) / 360) * 1000
          return <line key={lon} x1={x} y1="0" x2={x} y2="500" stroke="#C8A96B" strokeWidth="0.3" strokeDasharray="2,12" opacity="0.15" />
        })}
        {/* Equator */}
        <line x1="0" y1="277.8" x2="1000" y2="277.8" stroke="#C8A96B" strokeWidth="0.6" opacity="0.25" />
        <line x1="500" y1="0" x2="500" y2="500" stroke="#C8A96B" strokeWidth="0.6" opacity="0.25" />

        {/* Continental silhouettes */}
        <path d="M130,100 L170,70 L230,75 L265,105 L275,145 L255,190 L225,215 L195,200 L165,165 L140,130 Z"
          fill="rgba(200,169,107,0.04)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.35" />
        <path d="M225,215 L230,235 L240,240" fill="none" stroke="#C8A96B" strokeWidth="0.5" opacity="0.25" />
        <path d="M240,240 L275,230 L300,260 L295,330 L270,375 L245,380 L220,360 L215,310 L225,265 Z"
          fill="rgba(200,169,107,0.04)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.35" />
        <path d="M455,85 L510,75 L535,95 L525,120 L500,135 L470,128 L450,108 Z"
          fill="rgba(200,169,107,0.04)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.35" />
        <path d="M465,140 L525,128 L555,160 L555,235 L535,285 L505,305 L475,285 L460,232 L455,180 Z"
          fill="rgba(200,169,107,0.04)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.35" />
        <path d="M535,80 L710,65 L750,95 L740,155 L700,172 L648,160 L600,170 L565,148 L538,115 Z"
          fill="rgba(200,169,107,0.04)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.35" />
        <path d="M625,170 L645,200 L640,225 L625,215 L615,195 Z"
          fill="rgba(200,169,107,0.04)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.3" />
        <path d="M705,280 L770,268 L800,298 L788,345 L750,358 L712,342 L698,308 Z"
          fill="rgba(200,169,107,0.04)" stroke="#C8A96B" strokeWidth="0.5" opacity="0.35" />
      </svg>

      {/* Floating script characters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {SCRIPT_CHARS.map((char, i) => (
          <span
            key={i}
            className="absolute font-display text-gold/[0.07] select-none animate-drift-slow"
            style={{
              fontSize: `${14 + (i % 5) * 6}px`,
              left: `${4 + (i * 6.2) % 90}%`,
              top: `${6 + (i * 7.8) % 85}%`,
              opacity: mounted ? (0.06 + (i % 4) * 0.03) : 0,
              transition: `opacity 2.5s ease ${i * 180}ms`,
              animationDelay: `${i * 1.3}s`,
              animationDuration: `${18 + (i % 4) * 5}s`,
              transform: `rotate(${-18 + (i * 13) % 36}deg)`,
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Language dots with vitality glow */}
      {LANGUAGES.map((lang, i) => {
        const x = ((lang.lon + 180) / 360) * 100
        const y = ((90 - lang.lat) / 180) * 100
        const color = VITALITY_STATUS_COLORS[lang.status]
        const glowColor = getVitalityGlow(lang.status)
        const isPulsing = pulse === i
        const isHov = hovered === lang.id

        return (
          <Link
            key={lang.id}
            href={`/language/${lang.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => setHovered(lang.id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`${lang.name} — ${lang.country}`}
          >
            {/* Vitality glow ring */}
            <span
              className="absolute inset-0 -m-4 rounded-full transition-all duration-700"
              style={{
                backgroundColor: 'transparent',
                boxShadow: isPulsing || isHov
                  ? `0 0 16px 4px ${glowColor}, 0 0 32px 8px ${glowColor}`
                  : 'none',
                opacity: isPulsing ? 0.8 : isHov ? 0.6 : 0,
              }}
              aria-hidden="true"
            />

            {/* Dot */}
            <span
              className="relative block rounded-full transition-all duration-300"
              style={{
                width: isHov ? 14 : 8,
                height: isHov ? 14 : 8,
                backgroundColor: color,
                boxShadow: `0 0 8px ${glowColor}`,
              }}
            />

            {/* Tooltip — glassmorphism */}
            {isHov && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{ bottom: '160%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
              >
                <div className="glass-navy rounded-lg px-4 py-2.5 shadow-xl animate-layer-emerge">
                  <p className="font-display text-xs font-bold text-ivory leading-tight">{lang.name}</p>
                  <p className="font-body text-[11px] text-gold/70 italic">{lang.nativeName}</p>
                  <p className="font-ui text-[10px] text-ivory/40 mt-0.5">{lang.country} · {lang.vitalityScore}/100</p>
                </div>
              </div>
            )}
          </Link>
        )
      })}

      {/* Continent labels — glassmorphism */}
      {CONTINENTS.map((c) => (
        <div
          key={c.name}
          className="absolute pointer-events-none z-5 hidden lg:block"
          style={{
            left: `${c.cx}%`,
            top: `${c.cy}%`,
            transform: 'translate(-50%, -50%)',
            opacity: mounted ? 0.5 : 0,
            transition: 'opacity 2s ease 1s',
          }}
        >
          <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold/30">{c.name}</span>
        </div>
      ))}
    </div>
  )
}
