'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Flag, CheckCircle2, XCircle, Trash2, Check, AlertTriangle, ShieldAlert } from 'lucide-react'
import { useAdmin } from '@/components/admin/admin-layout-client'
import { useAdminToast } from '@/components/admin/toast-context'
import AdminStatusBadge from '@/components/admin/admin-status-badge'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import AdminConfirmationDialog from '@/components/admin/admin-confirmation-dialog'
import type { ContentReport } from '@/lib/data'

export default function AdminReportsPage() {
  const { refreshKey, triggerRefresh } = useAdmin()
  const { showToast } = useAdminToast()

  const [reports, setReports] = useState<ContentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('OPEN')
  const [actionLoading, setActionLoading] = useState(false)
  const [resolvingReport, setResolvingReport] = useState<{ report: ContentReport; resolution: string } | null>(null)

  const fetchReports = useCallback(async () => {
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
  }, [statusFilter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports, refreshKey])

  const handleResolve = async (id: string, resolution: 'RESOLVED' | 'DISMISSED', notes?: string) => {
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: resolution, notes }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update report')
      showToast(`Report marked as ${resolution.toLowerCase()}`, 'success')
      setResolvingReport(null)
      triggerRefresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to update report', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/60">
        <div>
          <span className="font-ui text-[10px] tracking-widest uppercase font-semibold text-stone-600 block">
            Trust & Safety
          </span>
          <h2 className="font-display font-bold text-2xl text-navy tracking-tight mt-0.5">Community Reports</h2>
          <p className="text-xs font-ui text-stone-500 mt-0.5">
            Review community flagged inaccuracies, offensive content, or copyright concerns.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['OPEN', 'RESOLVED', 'DISMISSED', 'ALL'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-ui font-semibold transition-all ${
              statusFilter === st
                ? 'bg-navy text-gold shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {st === 'ALL' ? 'All Reports' : st.charAt(0) + st.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-ui text-stone-400">Loading reports...</div>
      ) : reports.length === 0 ? (
        <AdminEmptyState
          title="No open reports"
          description="The platform is healthy. No community concerns are awaiting curator evaluation."
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-navy">{report.reason || 'Flagged Content'}</span>
                  <AdminStatusBadge status={report.status} />
                </div>
                <p className="text-xs font-ui text-stone-600 leading-relaxed">{report.explanation || 'No additional details provided.'}</p>
                <div className="text-[11px] font-mono text-stone-400">
                  Target: {report.targetType} ({report.targetId}) · {new Date(report.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>

              {report.status === 'OPEN' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setResolvingReport({ report, resolution: 'DISMISSED' })}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-ui font-semibold"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => setResolvingReport({ report, resolution: 'RESOLVED' })}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-ui font-semibold shadow-sm"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Confirmation */}
      <AdminConfirmationDialog
        isOpen={Boolean(resolvingReport)}
        title={`${resolvingReport?.resolution === 'RESOLVED' ? 'Resolve' : 'Dismiss'} Community Report`}
        description="Add optional curator notes for the audit trail."
        confirmLabel="Confirm"
        requireReason={true}
        reasonPlaceholder="Curator notes / resolution summary..."
        isLoading={actionLoading}
        onConfirm={(notes) => {
          if (!resolvingReport) return
          handleResolve(resolvingReport.report.id, resolvingReport.resolution as any, notes)
        }}
        onCancel={() => setResolvingReport(null)}
      />
    </div>
  )
}
