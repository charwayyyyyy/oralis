'use client'

import React, { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import {
  Globe,
  Mic,
  Flag,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  Check,
  X,
  Volume2,
} from 'lucide-react'
import { AdminContext } from '@/components/admin/admin-layout-client'
import AdminAudioPlayer from '@/components/admin/admin-audio-player'

export default function AdminOverviewPage() {
  const { refreshKey, triggerRefresh } = useContext(AdminContext)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [reconciling, setReconciling] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchOverview = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/overview', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load overview data')
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [refreshKey])

  // Inline Quick Approve for a Language
  const handleQuickApproveLanguage = async (id: string, name: string) => {
    setActionLoading(`lang-${id}`)
    try {
      const res = await fetch(`/api/admin/languages/${id}/moderation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', reason: 'Quick approval from overview dashboard' }),
      })
      if (!res.ok) throw new Error('Failed to approve language')
      showToast(`Language "${name}" approved and published to the atlas!`)
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Approval failed')
    } finally {
      setActionLoading(null)
    }
  }

  // Inline Quick Approve for a Contribution
  const handleQuickApproveContribution = async (PK: string, SK: string, title: string) => {
    setActionLoading(`contrib-${SK}`)
    try {
      const res = await fetch(`/api/admin/contributions/${encodeURIComponent(SK)}/moderation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PK, SK, action: 'APPROVE', reason: 'Quick approval from overview dashboard' }),
      })
      if (!res.ok) throw new Error('Failed to approve contribution')
      showToast(`Contribution "${title}" approved and added to archive!`)
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Approval failed')
    } finally {
      setActionLoading(null)
    }
  }

  // Database Reconciliation
  const handleReconcile = async () => {
    if (!confirm('Run database reconciliation to verify all counters and moderation states against DynamoDB items?')) {
      return
    }
    setReconciling(true)
    try {
      const res = await fetch('/api/admin/reconcile', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Reconciliation failed')
      showToast(json.message || 'Database reconciliation completed successfully!')
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Reconciliation failed')
    } finally {
      setReconciling(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-stone-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-stone-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-white border border-stone-200 rounded-2xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-rose-200 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="font-display text-xl font-bold text-navy mb-2">Signal Interrupted</h2>
        <p className="text-sm text-stone-600 mb-6">{error || 'Could not retrieve platform metrics.'}</p>
        <button
          onClick={fetchOverview}
          className="px-5 py-2.5 bg-navy text-ivory rounded-xl text-xs font-ui font-bold hover:bg-navy/80 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  const { stats, recentLanguages, recentContributions, recentAuditLogs } = data

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-navy text-ivory px-5 py-3 rounded-2xl shadow-xl border border-gold/40 flex items-center gap-3 animate-fadeIn text-xs font-ui font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header & Quick Reconcile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone/20 pb-6">
        <div>
          <span className="text-[11px] font-ui font-semibold text-gold uppercase tracking-[0.2em] block mb-1">
            System Control Panel
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy tracking-tight">
            Moderation Overview
          </h1>
          <p className="text-xs font-ui text-stone-500 mt-1">
            Real-time status of submitted cultural memories and language records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 text-navy border border-stone/30 rounded-xl text-xs font-ui font-semibold shadow-sm transition-all focus-ring disabled:opacity-50"
            title="Recalculate and synchronize all database counters"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gold ${reconciling ? 'animate-spin' : ''}`} />
            <span>{reconciling ? 'Reconciling...' : 'Reconcile DB'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Pending Languages */}
        <Link
          href="/admin/languages?status=PENDING"
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group focus-ring relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-ui font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Pending
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-navy mt-2">
            {stats.pendingLanguages}
          </div>
          <div className="text-[11px] font-ui text-stone-600 mt-1 flex items-center justify-between">
            <span>Languages</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-navy transition-colors" />
          </div>
        </Link>

        {/* Pending Contributions */}
        <Link
          href="/admin/contributions?status=PENDING"
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group focus-ring relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Mic className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-ui font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Pending
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-navy mt-2">
            {stats.pendingContributions}
          </div>
          <div className="text-[11px] font-ui text-stone-600 mt-1 flex items-center justify-between">
            <span>Contributions</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-navy transition-colors" />
          </div>
        </Link>

        {/* Open Reports */}
        <Link
          href="/admin/reports"
          className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm hover:shadow-md hover:border-rose-400 transition-all group focus-ring relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <Flag className="w-4 h-4" />
            </span>
            {stats.openReports > 0 && (
              <span className="text-[10px] font-ui font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Action
              </span>
            )}
          </div>
          <div className="font-display text-3xl font-bold text-navy mt-2">
            {stats.openReports}
          </div>
          <div className="text-[11px] font-ui text-stone-600 mt-1 flex items-center justify-between">
            <span>User Reports</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-navy transition-colors" />
          </div>
        </Link>

        {/* Approved Languages */}
        <Link
          href="/admin/languages?status=APPROVED"
          className="bg-white p-5 rounded-2xl border border-stone/20 shadow-sm hover:shadow-md hover:border-gold/60 transition-all group focus-ring"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-ui font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Public
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-navy mt-2">
            {stats.approvedLanguages}
          </div>
          <div className="text-[11px] font-ui text-stone-600 mt-1 flex items-center justify-between">
            <span>Approved Langs</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-navy transition-colors" />
          </div>
        </Link>

        {/* Approved Contributions */}
        <Link
          href="/admin/contributions?status=APPROVED"
          className="bg-white p-5 rounded-2xl border border-stone/20 shadow-sm hover:shadow-md hover:border-gold/60 transition-all group focus-ring"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <FileCheck className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-ui font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Public
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-navy mt-2">
            {stats.approvedContributions}
          </div>
          <div className="text-[11px] font-ui text-stone-600 mt-1 flex items-center justify-between">
            <span>Approved Records</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-navy transition-colors" />
          </div>
        </Link>

        {/* Contributor Devices */}
        <div className="bg-white p-5 rounded-2xl border border-stone/20 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-ui text-stone-400 uppercase tracking-wider">
              Telemetry
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-navy mt-2">
            {stats.uniqueContributorDevices}
          </div>
          <div className="text-[11px] font-ui text-stone-600 mt-1" title="Estimated based on distinct anonymous device submissions">
            Unique Devices ?
          </div>
        </div>
      </div>

      {/* Two-Column Section: Pending Triage Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Language Submissions */}
        <div className="bg-white border border-stone/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold" />
                <h2 className="font-display font-bold text-lg text-navy">Pending Languages</h2>
                {stats.pendingLanguages > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-mono font-bold">
                    {stats.pendingLanguages}
                  </span>
                )}
              </div>
              <Link
                href="/admin/languages?status=PENDING"
                className="text-xs font-ui text-gold hover:text-navy font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {recentLanguages.filter((l: any) => l.moderationStatus === 'PENDING').length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs font-ui">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <span>All submitted languages have been moderated.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLanguages
                  .filter((l: any) => l.moderationStatus === 'PENDING')
                  .slice(0, 4)
                  .map((lang: any) => (
                    <div
                      key={lang.id}
                      className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-2xl flex items-center justify-between gap-3 hover:bg-white hover:border-gold/40 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-navy truncate">
                            {lang.name}
                          </span>
                          {lang.nativeName && (
                            <span className="text-xs text-stone-500 italic truncate">
                              ({lang.nativeName})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-ui text-stone-500 truncate mt-0.5">
                          {lang.region || 'Region unlisted'}  {lang.contributorName || 'Anonymous'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleQuickApproveLanguage(lang.id, lang.name)}
                          disabled={actionLoading === `lang-${lang.id}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-ui font-semibold flex items-center gap-1 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <Link
                          href={`/admin/languages?search=${encodeURIComponent(lang.name)}`}
                          className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-navy rounded-lg text-xs font-ui transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Contributions */}
        <div className="bg-white border border-stone/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-gold" />
                <h2 className="font-display font-bold text-lg text-navy">Pending Contributions</h2>
                {stats.pendingContributions > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-mono font-bold">
                    {stats.pendingContributions}
                  </span>
                )}
              </div>
              <Link
                href="/admin/contributions?status=PENDING"
                className="text-xs font-ui text-gold hover:text-navy font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {recentContributions.filter((c: any) => c.moderationStatus === 'PENDING').length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs font-ui">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <span>All pending contributions have been reviewed.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recentContributions
                  .filter((c: any) => c.moderationStatus === 'PENDING')
                  .slice(0, 4)
                  .map((contrib: any) => (
                    <div
                      key={contrib.SK}
                      className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:border-gold/40 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-navy truncate">
                            {contrib.title || '(Untitled contribution)'}
                          </span>
                          <span className="px-2 py-0.2 bg-stone-200 text-stone-700 rounded text-[10px] font-ui uppercase tracking-wider">
                            {contrib.type || 'entry'}
                          </span>
                        </div>
                        <p className="text-[11px] font-ui text-stone-500 truncate mt-0.5">
                          {contrib.languageName || contrib.languageId}  by {contrib.contributorName || 'Anonymous'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {contrib.audioUrl && (
                          <AdminAudioPlayer src={contrib.audioUrl} title={contrib.title} />
                        )}
                        <button
                          onClick={() => handleQuickApproveContribution(contrib.PK, contrib.SK, contrib.title)}
                          disabled={actionLoading === `contrib-${contrib.SK}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-ui font-semibold flex items-center gap-1 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="bg-white border border-stone/20 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <h2 className="font-display font-bold text-lg text-navy">Recent Administrative Actions</h2>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs font-ui text-gold hover:text-navy font-semibold flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {recentAuditLogs.length === 0 ? (
          <p className="text-xs font-ui text-stone-400 py-6 text-center">No moderation actions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-ui">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Target Entity</th>
                  <th className="pb-3 font-semibold">Moderator</th>
                  <th className="pb-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentAuditLogs.map((log: any) => (
                  <tr key={log.id || log.SK} className="hover:bg-stone-50/50">
                    <td className="py-3 text-stone-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 font-semibold text-navy">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded font-mono text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-stone-700">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="py-3 text-stone-500">{log.actorId}</td>
                    <td className="py-3 text-stone-600 max-w-xs truncate">{log.reason || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
