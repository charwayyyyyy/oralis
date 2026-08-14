'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Admin Panel Error]:', error)
  }, [error])

  return (
    <div className="py-16 text-center max-w-lg mx-auto bg-white p-8 rounded-3xl border border-rose-200 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="font-display font-bold text-xl text-navy mb-2">Admin Workspace Error</h2>
      <p className="text-xs text-stone-600 mb-6">{error.message || 'An error occurred while rendering the admin control panel.'}</p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 bg-navy text-ivory rounded-xl text-xs font-ui font-bold hover:bg-navy/80 transition-colors inline-flex items-center gap-2"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Retry View</span>
      </button>
    </div>
  )
}
