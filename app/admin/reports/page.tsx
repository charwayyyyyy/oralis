'use client'

import React, { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import {
  Flag,
  CheckCircle2,
  XCircle,
  EyeOff,
  Trash2,
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { AdminContext } from '@/components/admin/admin-layout-client'
import type { ContentReport } from '@/lib/data'

export default function AdminReportsPage() {
  const { refreshKey, triggerRefresh } = useContext(AdminContext)
  const [reports, setReports] = useState<ContentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('OPEN')
  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/reports?status=${statusFilter}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load reports')
      const json = await res.json()
      setReports(json.reports || [])
    } catch (err: any) {
      setError(err.message || 'Error loading reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [statusFilter, refreshKey])

  const handleResolveReport = async (
    reportId: string,
    action: 'RESOLVE_AND_HIDE' | 'RESOLVE_AND_DELETE' | 'DISMISS',
    notes = ''
  ) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update report')
      showToast(`Report ${reportId} processed with ${action}.`)
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-navy text-ivory px-5 py-3 rounded-2xl shadow-xl border border-gold/40 flex items-center gap-3 animate-fadeIn text-xs font-ui font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone/20 pb-4">
        <div>
          <span className="text-[11px] font-ui font-semibold text-gold uppercase tracking-[0.2em] block mb-1">
            Community Integrity
          </span>
          <h1 className="font-display text-3xl font-bold text-navy tracking-tight">
            User Reports Queue
          </h1>
          <p className="text-xs font-ui text-stone-500 mt-1">
            Review community flags regarding misinformation, offensive audio, copyright, or missing consent.
          </p>
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone/20 pb-4">
        {(['OPEN', 'RESOLVED', 'DISMISSED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-ui font-bold transition-all ${
              statusFilter === tab
                ? 'bg-navy text-ivory shadow-sm'
                : 'bg-white border border-stone/20 text-stone-600 hover:bg-stone-50 hover:text-navy'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs font-ui text-stone-400 bg-white border border-stone/20 rounded-3xl animate-pulse">
            Loading reports...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-rose-600 font-ui bg-white border border-rose-200 rounded-3xl">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center text-stone-400 text-xs font-ui bg-white border border-stone/20 rounded-3xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-semibold text-stone-600 text-sm">No reports in this view.</p>
            <p className="text-stone-400 mt-1">The public archive is in good standing.</p>
          </div>
        ) : (
          reports.map((report) => {
            const isPending = report.status === 'OPEN'
            return (
              <div
                key={report.id}
                className="bg-white border border-stone/20 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                        <Flag className="w-4 h-4" />
                      </span>
                      <span className="font-display font-bold text-base text-navy">
                        Reason: {report.reason}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPending ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <div className="text-xs font-ui text-stone-500 flex flex-wrap items-center gap-3">
                      <span>
                        Target: <strong className="text-navy">{report.targetTitle || report.targetId}</strong> ({report.targetType})
                      </span>
                      <span></span>
                      <span className="font-mono text-[11px]">
                        Reported on: {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {report.explanation && (
                      <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs font-body text-rose-900">
                        <strong className="block text-[10px] uppercase tracking-wider text-rose-700 mb-1">
                          Reporter Note
                        </strong>
                        {report.explanation}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                      <button
                        onClick={() => handleResolveReport(report.id, 'DISMISS', 'Report reviewed and dismissed as non-violating')}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-ui font-semibold transition-colors"
                      >
                        Dismiss
                      </button>

                      <button
                        onClick={() => handleResolveReport(report.id, 'RESOLVE_AND_HIDE', 'Report verified; content hidden from public')}
                        disabled={actionLoading}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-ui font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Target</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Permanently delete the reported target contribution and its S3 audio?')) {
                            handleResolveReport(report.id, 'RESOLVE_AND_DELETE', 'Report verified; content permanently deleted')
                          }
                        }}
                        disabled={actionLoading}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-ui font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Target</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
