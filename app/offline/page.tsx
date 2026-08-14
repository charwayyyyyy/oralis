'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WifiOff, RefreshCw, Globe } from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = '/'
      } else {
        setRetrying(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-navy pt-32 pb-24 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center glass-heavy rounded-3xl p-8 sm:p-12 border border-stone/20 shadow-xl shadow-navy/5">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-6 border border-stone-200">
          <WifiOff className="w-7 h-7" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="font-ui text-[10px] tracking-widest uppercase font-bold text-stone-500">
            {isOnline ? 'Connection Restored' : 'Network Disconnected'}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-3">
          The atlas is temporarily offline.
        </h1>

        <p className="font-body text-stone-600 text-sm leading-relaxed mb-8">
          Your connection has been interrupted. Previously loaded public pages may still be available on this device.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full sm:w-auto px-6 py-3 bg-navy text-ivory rounded-xl font-ui text-xs font-bold hover:bg-navy/90 transition-all shadow-md flex items-center justify-center gap-2 focus-ring disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Checking connection...' : 'Retry connection'}</span>
          </button>
          <Link
            href="/explore"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-stone/20 text-navy rounded-xl font-ui text-xs font-semibold hover:bg-stone-50 transition-all focus-ring"
          >
            Explore cached atlas
          </Link>
        </div>
      </div>
    </div>
  )
}
