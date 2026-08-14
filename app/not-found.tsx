import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-navy pt-32 pb-24 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Archival Coordinate Grid Accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(#C8A96B 0.75px, transparent 0.75px), radial-gradient(#C8A96B 0.75px, #FAF8F5 0.75px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-md w-full text-center relative z-10 glass-heavy rounded-3xl p-8 sm:p-12 border border-stone/20 shadow-xl shadow-navy/5">
        {/* Fading Waveform / Coordinate Visual */}
        <div className="flex items-center justify-center gap-1.5 h-12 mb-6">
          <span className="w-1 h-8 bg-gold/40 rounded-full" />
          <span className="w-1 h-12 bg-gold/60 rounded-full" />
          <span className="w-1 h-6 bg-gold/30 rounded-full" />
          <span className="w-1 h-3 bg-stone-300 rounded-full" />
          <span className="w-1 h-1 bg-stone-200 rounded-full" />
        </div>

        <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold font-bold block mb-2">
          Coordinate: [00° 00' N, 00° 00' E]
        </span>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-3">
          This page has gone silent.
        </h1>

        <p className="font-body text-stone-600 text-sm leading-relaxed mb-8">
          The page may have moved, or this record is no longer part of the public archive.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-navy text-ivory rounded-xl font-ui text-xs font-bold hover:bg-navy/90 transition-all shadow-md focus-ring"
          >
            Return home
          </Link>
          <Link
            href="/explore"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-stone/20 text-navy rounded-xl font-ui text-xs font-semibold hover:bg-stone-50 transition-all focus-ring"
          >
            Explore the atlas
          </Link>
        </div>
      </div>
    </div>
  )
}
