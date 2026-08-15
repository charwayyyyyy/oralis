'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { BarChart3, Users, Globe, Mic, ShieldCheck, Info } from 'lucide-react'
import { useAdmin } from '@/components/admin/admin-layout-client'
import { VITALITY_STATUS_LABELS, VITALITY_STATUS_COLORS } from '@/lib/data'

export default function AdminAnalyticsPage() {
  const { refreshKey } = useAdmin()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load telemetry')
      const json = await res.json()
      setData(json.data)
    } catch (err: any) {
      setError(err.message || 'Error loading telemetry')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics, refreshKey])

  if (loading && !data) {
    return <div className="p-12 text-center text-xs font-ui text-stone-400">Loading archival telemetry...</div>
  }

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/60">
        <div>
          <span className="font-ui text-[10px] tracking-widest uppercase font-semibold text-stone-600 block">
            Telemetry & Vitality
          </span>
          <h2 className="font-display font-bold text-2xl text-navy tracking-tight mt-0.5">Archival Telemetry</h2>
          <p className="text-xs font-ui text-stone-500 mt-0.5">
            Database-backed metrics on endangerment vitality, language preservation coverage, and audio records.
          </p>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm">
          <span className="text-[11px] font-ui text-stone-500 uppercase font-semibold">Total Indexed Languages</span>
          <div className="font-display font-bold text-3xl text-navy mt-1">
            {data?.overview?.totalLanguages ?? data?.totalLanguages ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm">
          <span className="text-[11px] font-ui text-stone-500 uppercase font-semibold">Preserved Memories</span>
          <div className="font-display font-bold text-3xl text-navy mt-1">
            {data?.overview?.totalContributions ?? data?.totalContributions ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm">
          <span className="text-[11px] font-ui text-stone-500 uppercase font-semibold">Audio Recordings</span>
          <div className="font-display font-bold text-3xl text-navy mt-1">
            {data?.overview?.audioContributions ?? data?.audioContributions ?? 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm">
          <span className="text-[11px] font-ui text-stone-500 uppercase font-semibold">Audited Actions</span>
          <div className="font-display font-bold text-3xl text-navy mt-1">
            {data?.overview?.totalAuditEntries ?? data?.totalAuditEntries ?? 0}
          </div>
        </div>
      </div>

      {/* Vitality Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm">
        <h3 className="font-display font-bold text-lg text-navy mb-4">Vitality & Endangerment Distribution</h3>
        <div className="space-y-3">
          {Object.entries(data?.vitalityBreakdown || {}).map(([key, count]: [string, any]) => {
            const total = Object.values(data?.vitalityBreakdown || {}).reduce((acc: number, val: any) => acc + Number(val || 0), 0) || 1
            const pct = Math.round((count / total) * 100)
            const label = VITALITY_STATUS_LABELS[key as keyof typeof VITALITY_STATUS_LABELS] || key
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs font-ui">
                  <span className="font-semibold text-stone-700 capitalize">{label}</span>
                  <span className="font-mono text-stone-500">{count} languages ({pct}%)</span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-navy rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
