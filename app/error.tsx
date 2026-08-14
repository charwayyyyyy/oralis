'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Oralis Platform Error]:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-navy pt-32 pb-24 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center glass-heavy rounded-3xl p-8 sm:p-12 border border-stone/20 shadow-xl shadow-navy/5">
        <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center mx-auto mb-6 border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>

        <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold font-bold block mb-2">
          Signal Interruption
        </span>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-3">
          We lost the signal.
        </h1>

        <p className="font-body text-stone-600 text-sm leading-relaxed mb-8">
          Oralis could not retrieve this part of the archive. The connection may have timed out.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-navy text-ivory rounded-xl font-ui text-xs font-bold hover:bg-navy/90 transition-all shadow-md flex items-center justify-center gap-2 focus-ring"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-stone/20 text-navy rounded-xl font-ui text-xs font-semibold hover:bg-stone-50 transition-all focus-ring"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  )
}
