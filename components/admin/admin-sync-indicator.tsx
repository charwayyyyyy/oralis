'use client'

import React, { useState } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle, WifiOff, Clock } from 'lucide-react'
import type { SyncState } from '@/lib/admin-types'

interface Props {
  syncState: SyncState
  lastRefreshed?: string | null
  queryDurationMs?: number
  onManualRefresh?: () => void
  isRefreshing?: boolean
}

export default function AdminSyncIndicator({
  syncState,
  lastRefreshed,
  queryDurationMs,
  onManualRefresh,
  isRefreshing = false,
}: Props) {
  const [showDetails, setShowDetails] = useState(false)

  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) return 'Just now'
    const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diffSec < 5) return 'Just now'
    if (diffSec < 60) return `${diffSec}s ago`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    return `${Math.floor(diffMin / 60)}h ago`
  }

  const getStatusContent = () => {
    switch (syncState) {
      case 'UPDATING':
        return {
          label: 'Updating...',
          dotClass: 'bg-amber-400 animate-spin',
          textClass: 'text-amber-700',
          icon: <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />,
        }
      case 'OFFLINE':
        return {
          label: 'Offline',
          dotClass: 'bg-stone-400',
          textClass: 'text-stone-600',
          icon: <WifiOff className="w-3 h-3 text-stone-500" />,
        }
      case 'FAILED':
        return {
          label: 'Sync Error',
          dotClass: 'bg-rose-500',
          textClass: 'text-rose-700',
          icon: <AlertCircle className="w-3 h-3 text-rose-600" />,
        }
      case 'DELAYED':
        return {
          label: 'Delayed',
          dotClass: 'bg-amber-500',
          textClass: 'text-amber-700',
          icon: <Clock className="w-3 h-3 text-amber-600" />,
        }
      case 'UP_TO_DATE':
      default:
        return {
          label: 'Up to date',
          dotClass: 'bg-emerald-500',
          textClass: 'text-emerald-700',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
        }
    }
  }

  const current = getStatusContent()

  return (
    <div className="relative inline-flex items-center">
      <div
        className="flex items-center gap-2 px-2.5 py-1 bg-stone-50 border border-stone-200/80 rounded-lg text-xs font-ui cursor-pointer hover:border-gold/40 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
        title="Click for data synchronization details"
      >
        <span className={`w-2 h-2 rounded-full ${current.dotClass}`} aria-hidden="true" />
        <span className={`font-medium ${current.textClass}`}>{current.label}</span>
        {lastRefreshed && (
          <span className="hidden sm:inline text-stone-400 border-l border-stone-200 pl-2">
            Updated {formatRelativeTime(lastRefreshed)}
          </span>
        )}
        {onManualRefresh && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onManualRefresh()
            }}
            disabled={isRefreshing || syncState === 'UPDATING'}
            className="p-0.5 text-stone-400 hover:text-gold rounded transition-transform active:scale-95 disabled:opacity-50"
            aria-label="Refresh live data"
            title="Manual Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
          </button>
        )}
      </div>

      {showDetails && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-lg p-3 z-50 text-xs font-ui"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-semibold text-navy">
            <span>Synchronization Details</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 font-mono">Real-time</span>
          </div>
          <div className="space-y-1.5 py-2 text-stone-600">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-navy">{current.label}</span>
            </div>
            {lastRefreshed && (
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-mono text-[11px]">{new Date(lastRefreshed).toLocaleTimeString()}</span>
              </div>
            )}
            {queryDurationMs !== undefined && (
              <div className="flex justify-between">
                <span>Query Latency:</span>
                <span className="font-mono text-[11px]">{queryDurationMs}ms</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowDetails(false)}
            className="w-full mt-1 py-1 text-center text-stone-500 hover:text-navy text-[11px] font-medium"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
