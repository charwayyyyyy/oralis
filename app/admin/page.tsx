'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Globe,
  Mic,
  Flag,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  Database,
  Users,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import AdminStatusBadge from '@/components/admin/admin-status-badge'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import AdminConfirmationDialog from '@/components/admin/admin-confirmation-dialog'
import AdminReviewModal from '@/components/admin/admin-review-modal'
import { useAdminToast } from '@/components/admin/toast-context'
import { useAdmin } from '@/components/admin/admin-layout-client'
import type { Language, Contribution, AuditLogEntry } from '@/lib/data'
import type { AdminOverviewResponse } from '@/lib/admin-types'

export default function AdminOverviewPage() {
  const { refreshKey, triggerRefresh } = useAdmin()
  const { showToast } = useAdminToast()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AdminOverviewResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Review modal state
  const [reviewItem, setReviewItem] = useState<{
    type: 'language' | 'contribution'
    item: any
  } | null>(null)

  // Reconcile dialog state
  const [isReconcileOpen, setIsReconcileOpen] = useState(false)
  const [reconciling, setReconciling] = useState(false)

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/overview', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load overview telemetry')
      const json: AdminOverviewResponse = await res.json()
      setData(json)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching admin overview:', err)
      setError(err.message || 'Failed to load telemetry')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview, refreshKey])

  // Handle review actions from modal
  const handleModerate = async (action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE', reason?: string) => {
    if (!reviewItem) return
    const { type, item } = reviewItem

    try {
      if (type === 'language') {
        const res = await fetch(`/api/admin/languages/${item.id}/moderation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, reason }),
        })
        if (!res.ok) throw new Error('Language moderation failed')
        showToast(`Language "${item.name}" ${action.toLowerCase()}d successfully`, 'success')
      } else {
        const id = item.id || (item.SK ? item.SK.split('#')[1] : null)
        const res = await fetch(`/api/admin/contributions/${id}/moderation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            reason,
            PK: item.PK,
            SK: item.SK,
            languageId: item.languageId || item.PK?.replace('LANGUAGE#', ''),
          }),
        })
        if (!res.ok) throw new Error('Contribution moderation failed')
        showToast(`Contribution ${action.toLowerCase()}d successfully`, 'success')
      }
      triggerRefresh()
    } catch (err: any) {
      showToast(err.message || 'Moderation action failed', 'error')
      throw err
    }
  }

  // Handle database consistency reconciliation
  const handleRunReconcile = async () => {
    try {
      setReconciling(true)
      const res = await fetch('/api/admin/reconcile', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Reconciliation failed')
      showToast('Database consistency verified and counters synchronized', 'success')
      setIsReconcileOpen(false)
      triggerRefresh()
    } catch (err: any) {
      showToast(err.message || 'Consistency check failed', 'error')
    } finally {
      setReconciling(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-stone-200/60 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-36 bg-stone-200/60 rounded-3xl" />
          <div className="h-36 bg-stone-200/60 rounded-3xl" />
          <div className="h-36 bg-stone-200/60 rounded-3xl" />
        </div>
        <div className="h-28 bg-stone-200/60 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-stone-200/60 rounded-3xl" />
          <div className="h-64 bg-stone-200/60 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center font-body text-navy max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="font-display font-bold text-lg text-rose-900">Failed to Load Overview</h3>
        <p className="text-xs font-ui text-rose-700 mt-1">{error}</p>
        <button
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 bg-navy text-gold font-ui font-semibold text-xs rounded-xl hover:bg-navy-muted transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Telemetry Request</span>
        </button>
      </div>
    )
  }

  const stats = data?.stats || {
    totalLanguages: 0,
    pendingLanguages: 0,
    approvedLanguages: 0,
    rejectedLanguages: 0,
    hiddenLanguages: 0,
    archivedLanguages: 0,
    totalContributions: 0,
    pendingContributions: 0,
    approvedContributions: 0,
    rejectedContributions: 0,
    hiddenContributions: 0,
    archivedContributions: 0,
    audioContributions: 0,
    storyContributions: 0,
    vocabularyContributions: 0,
    culturalContextContributions: 0,
    uniqueContributorDevices: 0,
    openReports: 0,
    resolvedReports: 0,
    approvalRate: null,
    medianReviewTimeMinutes: null,
    databaseSyncStatus: 'SYNCHRONIZED',
    lastRefreshed: new Date().toISOString(),
    queryDurationMs: 0,
    oldestPendingLanguageAge: null,
    oldestPendingContributionAge: null,
    oldestOpenReportAge: null,
  }

  const pendingLangs = (data?.recentLanguages || []).filter(
    (l) => (l.moderationStatus || (l.status === 'PENDING_REVIEW' ? 'PENDING' : 'APPROVED')) === 'PENDING'
  )

  const pendingContribs = (data?.recentContributions || []).filter(
    (c) => (c.moderationStatus || (c.verified ? 'APPROVED' : 'PENDING')) === 'PENDING'
  )

  const recentAudit = data?.recentAuditLogs || []

  return (
    <div className="space-y-8 font-body">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/60">
        <div>
          <span className="font-ui text-[10px] tracking-widest uppercase font-semibold text-stone-600 block">
            System Control Panel
          </span>
          <h2 className="font-display font-bold text-2xl text-navy tracking-tight mt-0.5">
            Moderation Overview
          </h2>
          <p className="text-xs font-ui text-stone-500 mt-0.5">
            Real-time status of submitted cultural memories, language metadata, and community reports.
          </p>
        </div>
      </div>

      {/* 2. PRIMARY ACTION CARDS: NEEDS ATTENTION */}
      <section aria-labelledby="needs-attention-heading" className="space-y-3">
        <h3 id="needs-attention-heading" className="font-ui text-xs font-bold uppercase tracking-wider text-stone-500">
          Action Required
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Pending Languages Card */}
          <Link
            href="/admin/languages?status=PENDING"
            className={`group p-5 rounded-3xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
              stats.pendingLanguages > 0
                ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                : 'bg-white border-stone-200 hover:border-gold/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    stats.pendingLanguages > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </div>
                {stats.pendingLanguages > 0 && stats.oldestPendingLanguageAge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 font-medium">
                    Oldest: {stats.oldestPendingLanguageAge}
                  </span>
                )}
              </div>
              <p className="text-xs font-ui font-semibold text-stone-600">Pending Languages</p>
              <div className="font-display font-bold text-3xl text-navy mt-1 tracking-tight tabular-nums">
                {stats.pendingLanguages}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-ui font-semibold text-gold group-hover:text-navy transition-colors">
              <span>{stats.pendingLanguages > 0 ? 'Review language queue' : 'View all languages'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Pending Contributions Card */}
          <Link
            href="/admin/contributions?status=PENDING"
            className={`group p-5 rounded-3xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
              stats.pendingContributions > 0
                ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                : 'bg-white border-stone-200 hover:border-gold/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    stats.pendingContributions > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </div>
                {stats.pendingContributions > 0 && stats.oldestPendingContributionAge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 font-medium">
                    Oldest: {stats.oldestPendingContributionAge}
                  </span>
                )}
              </div>
              <p className="text-xs font-ui font-semibold text-stone-600">Pending Contributions</p>
              <div className="font-display font-bold text-3xl text-navy mt-1 tracking-tight tabular-nums">
                {stats.pendingContributions}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-ui font-semibold text-gold group-hover:text-navy transition-colors">
              <span>{stats.pendingContributions > 0 ? 'Review contribution queue' : 'View all contributions'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Open Reports Card */}
          <Link
            href="/admin/reports?status=OPEN"
            className={`group p-5 rounded-3xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
              stats.openReports > 0
                ? 'bg-orange-50/50 border-orange-200 hover:border-orange-400'
                : 'bg-white border-stone-200 hover:border-gold/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    stats.openReports > 0 ? 'bg-orange-100 text-orange-800' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                </div>
                {stats.openReports > 0 && stats.oldestOpenReportAge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-medium">
                    Oldest: {stats.oldestOpenReportAge}
                  </span>
                )}
              </div>
              <p className="text-xs font-ui font-semibold text-stone-600">Open Community Reports</p>
              <div className="font-display font-bold text-3xl text-navy mt-1 tracking-tight tabular-nums">
                {stats.openReports}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-ui font-semibold text-gold group-hover:text-navy transition-colors">
              <span>{stats.openReports > 0 ? 'Review open reports' : 'View all reports'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. PLATFORM SUMMARY ROW */}
      <section aria-labelledby="platform-summary-heading" className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-sm">
        <h3 id="platform-summary-heading" className="font-ui text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
          Platform Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          <div className="pt-2 sm:pt-0 sm:px-3 first:pl-0">
            <span className="text-[11px] font-ui text-stone-500 block">Approved Languages</span>
            <span className="font-display font-bold text-xl text-navy mt-1 block tabular-nums">
              {stats.approvedLanguages}
            </span>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-ui text-stone-500 block">Approved Contributions</span>
            <span className="font-display font-bold text-xl text-navy mt-1 block tabular-nums">
              {stats.approvedContributions}
            </span>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-ui text-stone-500 block flex items-center gap-1">
              <span>Unique Contributors</span>
              <span title="Distinct community contributors submitting records"><Info className="w-3 h-3 text-stone-400" /></span>
            </span>
            <span className="font-display font-bold text-xl text-navy mt-1 block tabular-nums">
              {stats.uniqueContributorDevices}
            </span>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-ui text-stone-500 block">Approval Rate</span>
            <span className="font-display font-bold text-xl text-navy mt-1 block tabular-nums">
              {stats.approvalRate !== null ? `${stats.approvalRate}%` : '—'}
            </span>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-3">
            <span className="text-[11px] font-ui text-stone-500 block">Median Review Time</span>
            <span className="font-display font-bold text-xl text-navy mt-1 block tabular-nums">
              {stats.medianReviewTimeMinutes !== null ? `${stats.medianReviewTimeMinutes}m` : '—'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. ACTIVE REVIEW QUEUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Languages Queue */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold" />
                <h3 className="font-display font-bold text-base text-navy">Pending Languages</h3>
                {pendingLangs.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-mono font-bold">
                    {pendingLangs.length}
                  </span>
                )}
              </div>
              <Link
                href="/admin/languages?status=PENDING"
                className="text-xs font-ui font-semibold text-gold hover:text-navy flex items-center gap-1"
              >
                <span>View queue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {pendingLangs.length === 0 ? (
              <AdminEmptyState
                title="No languages need review."
                description="The moderation queue was checked recently. All submitted languages have been reviewed."
                actionLabel="View reviewed languages"
                actionHref="/admin/languages"
              />
            ) : (
              <div className="space-y-3">
                {pendingLangs.slice(0, 4).map((lang: any) => (
                  <div
                    key={lang.id}
                    className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-2xl flex items-center justify-between gap-3 hover:bg-white hover:border-gold/40 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-navy truncate">{lang.name}</span>
                        {lang.nativeName && (
                          <span className="text-xs text-stone-400 font-serif italic truncate">({lang.nativeName})</span>
                        )}
                      </div>
                      <p className="text-[11px] font-ui text-stone-500 truncate mt-0.5">
                        {lang.region || 'Global'} · by {lang.contributorName || 'Anonymous'}
                      </p>
                    </div>

                    <button
                      onClick={() => setReviewItem({ type: 'language', item: lang })}
                      className="px-3 py-1.5 bg-navy hover:bg-navy-muted text-gold rounded-xl text-xs font-ui font-semibold shrink-0 transition-colors shadow-sm"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Contributions Queue */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-gold" />
                <h3 className="font-display font-bold text-base text-navy">Pending Contributions</h3>
                {pendingContribs.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-mono font-bold">
                    {pendingContribs.length}
                  </span>
                )}
              </div>
              <Link
                href="/admin/contributions?status=PENDING"
                className="text-xs font-ui font-semibold text-gold hover:text-navy flex items-center gap-1"
              >
                <span>View queue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {pendingContribs.length === 0 ? (
              <AdminEmptyState
                title="No contributions need review."
                description="New submissions from the preservation studio will appear here automatically."
                actionLabel="View all contributions"
                actionHref="/admin/contributions"
              />
            ) : (
              <div className="space-y-3">
                {pendingContribs.slice(0, 4).map((contrib: any) => (
                  <div
                    key={contrib.SK || contrib.id}
                    className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-2xl flex items-center justify-between gap-3 hover:bg-white hover:border-gold/40 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-navy truncate">
                          {contrib.title || '(Untitled contribution)'}
                        </span>
                        <span className="px-2 py-0.2 bg-stone-200/80 text-stone-700 rounded text-[10px] font-ui uppercase font-semibold">
                          {contrib.type || 'entry'}
                        </span>
                      </div>
                      <p className="text-[11px] font-ui text-stone-500 truncate mt-0.5">
                        {contrib.languageName || contrib.languageId || 'Language'} · by {contrib.contributorName || 'Anonymous'}
                      </p>
                    </div>

                    <button
                      onClick={() => setReviewItem({ type: 'contribution', item: contrib })}
                      className="px-3 py-1.5 bg-navy hover:bg-navy-muted text-gold rounded-xl text-xs font-ui font-semibold shrink-0 transition-colors shadow-sm"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT ADMINISTRATIVE ACTIONS */}
      <section aria-labelledby="recent-activity-heading" className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <h3 id="recent-activity-heading" className="font-display font-bold text-base text-navy">
              Recent Administrative Activity
            </h3>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs font-ui font-semibold text-gold hover:text-navy flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentAudit.length === 0 ? (
          <p className="text-xs font-ui text-stone-400 py-6 text-center">No moderation actions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-ui">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5 font-semibold">Timestamp</th>
                  <th className="pb-2.5 font-semibold">Action</th>
                  <th className="pb-2.5 font-semibold">Target Entity</th>
                  <th className="pb-2.5 font-semibold">Moderator</th>
                  <th className="pb-2.5 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentAudit.slice(0, 5).map((log: any) => (
                  <tr key={log.id || log.SK} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-2.5 text-stone-500 font-mono text-[11px]">
                      {new Date(log.timestamp || log.SK || Date.now()).toLocaleString()}
                    </td>
                    <td className="py-2.5 font-semibold text-navy">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded font-mono text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-stone-700">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="py-2.5 text-stone-500">{log.actorId || 'Curator'}</td>
                    <td className="py-2.5 text-stone-600 max-w-xs truncate">{log.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 6. SYSTEM HEALTH & MAINTENANCE PANEL */}
      <section aria-labelledby="system-health-heading" className="bg-stone-50/80 border border-stone-200/80 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-stone-500" />
              <h3 id="system-health-heading" className="font-display font-bold text-base text-navy">
                System Health & Data Consistency
              </h3>
            </div>
            <p className="text-xs font-ui text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Verifies DynamoDB partition integrity across all language metadata records, contribution sort keys, and recalculates accurate counter totals across the Atlas.
            </p>
          </div>

          <button
            onClick={() => setIsReconcileOpen(true)}
            className="px-4 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-ui font-semibold text-navy flex items-center gap-2 transition-colors shrink-0 shadow-sm self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Check Data Consistency</span>
          </button>
        </div>
      </section>

      {/* Review Modal */}
      <AdminReviewModal
        isOpen={Boolean(reviewItem)}
        type={reviewItem?.type || 'language'}
        item={reviewItem?.item || null}
        onClose={() => setReviewItem(null)}
        onModerate={handleModerate}
      />

      {/* Confirmation Dialog for Data Consistency Check */}
      <AdminConfirmationDialog
        isOpen={isReconcileOpen}
        title="Check Data Consistency & Recalculate Counters"
        description="This will scan all language metadata and contributions in the database to verify sort keys, audit public visibility predicates, and synchronize language contribution counters."
        consequence="Safe maintenance operation. No existing records or audio files will be deleted or overwritten."
        confirmLabel="Run Consistency Check"
        isLoading={reconciling}
        onConfirm={handleRunReconcile}
        onCancel={() => setIsReconcileOpen(false)}
      />
    </div>
  )
}
