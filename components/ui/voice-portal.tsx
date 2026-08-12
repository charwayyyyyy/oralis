'use client'

import { useEffect, useState } from 'react'

const ANCIENT_SCRIPTS = [
  { char: 'ᐊ', label: 'Inuktitut' },
  { char: 'ሀ', label: 'Ge\'ez' },
  { char: 'あ', label: 'Hiragana' },
  { char: 'ᚠ', label: 'Runic' },
  { char: 'ก', label: 'Thai' },
  { char: 'α', label: 'Greek' },
  { char: 'บ', label: 'Khmer' },
  { char: 'ᛗ', label: 'Elder Futhark' },
]

export default function VoicePortal({
  phrase = 'Every language carries a world.',
  nativePhrase = 'アイヌ・イタㇰ · Bats\'il k\'op · Kernewek · Tsoyaha',
  className = '',
}: {
  phrase?: string
  nativePhrase?: string
  className?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`relative w-full max-w-xl mx-auto voice-portal-frame bg-navy-deep/80 backdrop-blur-md p-6 sm:p-8 ${className}`}
      aria-label="Voice Portal: Living linguistic memory emerging from archival silence"
    >
      {/* Outer desaturated archival layer */}
      <div className="voice-portal-outer absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Subtle graticule grid */}
        <svg viewBox="0 0 400 300" className="w-full h-full opacity-30" preserveAspectRatio="none">
          <line x1="0" y1="75" x2="400" y2="75" stroke="#8A7968" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="0" y1="150" x2="400" y2="150" stroke="#8A7968" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="0" y1="225" x2="400" y2="225" stroke="#8A7968" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="100" y1="0" x2="100" y2="300" stroke="#8A7968" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="200" y1="0" x2="200" y2="300" stroke="#8A7968" strokeWidth="0.5" strokeDasharray="4 8" />
          <line x1="300" y1="0" x2="300" y2="300" stroke="#8A7968" strokeWidth="0.5" strokeDasharray="4 8" />
        </svg>

        {/* Archival ghosted glyphs */}
        <div className="absolute inset-0 flex flex-wrap justify-between p-6 opacity-20">
          {ANCIENT_SCRIPTS.map((item, idx) => (
            <span key={idx} className="font-display text-2xl text-stone select-none">
              {item.char}
            </span>
          ))}
        </div>
      </div>

      {/* The Central Voice Portal (Organic Reveal Window) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-6 sm:py-8">
        {/* Portal Ring / Archival Aperture */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center mb-6">
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full border border-gold/30 animate-pulse-vital"
            aria-hidden="true"
          />
          {/* Fine gold border */}
          <div
            className="absolute inset-2 rounded-full border border-gold/60 shadow-[0_0_25px_rgba(200,169,107,0.25)] bg-gradient-to-b from-gold/15 to-transparent"
            aria-hidden="true"
          />

          {/* Living waveform / vocal core */}
          <div className="relative z-10 flex items-center gap-1 sm:gap-1.5 h-12" aria-hidden="true">
            {[40, 75, 100, 60, 90, 45, 80, 50].map((h, i) => (
              <div
                key={i}
                className="w-1 sm:w-1.5 rounded-full bg-gold transition-all duration-300"
                style={{
                  height: mounted ? `${h}%` : '20%',
                  opacity: 0.7 + (i % 3) * 0.15,
                  boxShadow: '0 0 8px rgba(200, 169, 107, 0.4)',
                }}
              />
            ))}
          </div>

          {/* Archival Registration Marks */}
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-gold/50" aria-hidden="true" />
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-gold/50" aria-hidden="true" />
          <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-3 w-0.5 bg-gold/50" aria-hidden="true" />
          <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-3 w-0.5 bg-gold/50" aria-hidden="true" />
        </div>

        {/* Portal Typography */}
        <div className="max-w-md">
          <span className="inline-block font-ui text-[10px] sm:text-xs text-gold/80 tracking-[0.25em] uppercase font-bold mb-2">
            Living Voice Portal
          </span>
          <p className="font-display text-lg sm:text-xl font-bold text-ivory leading-snug mb-2">
            {phrase}
          </p>
          <p className="font-body text-xs sm:text-sm text-gold/70 italic leading-relaxed">
            {nativePhrase}
          </p>
        </div>
      </div>

      {/* Corner registration marks */}
      <span className="pointer-events-none absolute left-2 top-2 h-2 w-2 border-l border-t border-gold/40" aria-hidden="true" />
      <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 border-r border-t border-gold/40" aria-hidden="true" />
      <span className="pointer-events-none absolute left-2 bottom-2 h-2 w-2 border-l border-b border-gold/40" aria-hidden="true" />
      <span className="pointer-events-none absolute right-2 bottom-2 h-2 w-2 border-r border-b border-gold/40" aria-hidden="true" />
    </div>
  )
}
