'use client'

import React, { useState, useEffect, useContext } from 'react'
import {
  BarChart3,
  Users,
  Globe,
  Mic,
  ShieldCheck,
  Info,
  Layers,
  PieChart,
} from 'lucide-react'
import { AdminContext } from '@/components/admin/admin-layout-client'
import { VITALITY_STATUS_LABELS, VITALITY_STATUS_COLORS } from '@/lib/data'

export default function AdminAnalyticsPage() {
  const { refreshKey } = useContext(AdminContext)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load analytics')
      const json = await res.json()
      setData(json.data)
    } catch (err: any) {
      setError(err.message || 'Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [refreshKey])

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-xs font-ui text-stone-400 animate-pulse">
        Compiling platform metrics...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-rose-200 text-center max-w-lg mx-auto">
        <p className="text-xs text-rose-600 font-ui">{error || 'Failed to load metrics'}</p>
      </div>
    )
  }

  const { totalLanguages, totalContributions, vitalityBreakdown, contentTypeBreakdown, regionBreakdown, contributorTelemetry } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone/20 pb-4">
        <span className="text-[11px] font-ui font-semibold text-gold uppercase tracking-[0.2em] block mb-1">
          Archival Telemetry
        </span>
        <h1 className="font-display text-3xl font-bold text-navy tracking-tight">
          Platform Analytics
        </h1>
        <p className="text-xs font-ui text-stone-500 mt-1">
          Accurate preservation statistics, vitality classifications, and privacy-preserving contributor metrics.
        </p>
      </div>

      {/* Contributor Privacy & Honesty Banner */}
      <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 leading-relaxed">
          <strong className="font-semibold block mb-0.5">Privacy-Preserving Contributor Telemetry:</strong>
          Oralis does not enforce account creation for public language preservation. Unique contributor metrics are estimated using anonymous, privacy-preserving device tokens. Clearing browser cookies or contributing from multiple devices will increment distinct device counts.
        </div>
      </div>

      {/* Primary Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone/20 shadow-sm">
          <span className="text-xs font-ui text-stone-400 uppercase tracking-wider block mb-1">
            Languages Registered
          </span>
          <div className="font-display text-4xl font-bold text-navy">
            {totalLanguages}
          </div>
          <span className="text-[11px] font-ui text-stone-500 mt-2 block">
            Across global linguistic families
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone/20 shadow-sm">
          <span className="text-xs font-ui text-stone-400 uppercase tracking-wider block mb-1">
            Total Contributions
          </span>
          <div className="font-display text-4xl font-bold text-navy">
            {totalContributions}
          </div>
          <span className="text-[11px] font-ui text-stone-500 mt-2 block">
            Recordings, phrases, and stories
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone/20 shadow-sm">
          <span className="text-xs font-ui text-stone-400 uppercase tracking-wider block mb-1">
            Unique Contributor Devices
          </span>
          <div className="font-display text-4xl font-bold text-navy">
            {contributorTelemetry.uniqueContributorDevices}
          </div>
          <span className="text-[11px] font-ui text-stone-500 mt-2 block">
            Estimated anonymous device origins
          </span>
        </div>
      </div>

      {/* Vitality & Content Type Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vitality Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-stone/20 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <PieChart className="w-4 h-4 text-gold" />
            <h2 className="font-display font-bold text-lg text-navy">Linguistic Vitality Status</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(vitalityBreakdown).map(([statusKey, count]: [string, any]) => {
              const label = VITALITY_STATUS_LABELS[statusKey] || statusKey
              const color = VITALITY_STATUS_COLORS[statusKey as any] || '#C8A96B'
              const pct = totalLanguages > 0 ? Math.round((count / totalLanguages) * 100) : 0

              return (
                <div key={statusKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-ui">
                    <span className="font-medium text-navy flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                    <span className="text-stone-500 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-stone/20 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Layers className="w-4 h-4 text-gold" />
            <h2 className="font-display font-bold text-lg text-navy">Archive Content Types</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(contentTypeBreakdown).map(([typeKey, count]: [string, any]) => {
              const pct = totalContributions > 0 ? Math.round((count / totalContributions) * 100) : 0
              return (
                <div key={typeKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-ui">
                    <span className="font-medium text-navy capitalize">
                      {typeKey.replace(/-/g, ' ')}
                    </span>
                    <span className="text-stone-500 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-navy rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
