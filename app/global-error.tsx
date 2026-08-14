'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Oralis Global Error]:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F5] text-[#0B132B] flex items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h1 className="text-3xl font-bold mb-3 font-serif">
            We lost the signal.
          </h1>

          <p className="text-stone-600 text-sm leading-relaxed mb-8">
            Oralis could not retrieve this part of the archive. Please try reloading the page.
          </p>

          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#0B132B] text-white rounded-xl text-xs font-bold hover:bg-[#0B132B]/90 transition-all shadow-md inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
        </div>
      </body>
    </html>
  )
}
