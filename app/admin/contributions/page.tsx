'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Mic,
  Search,
  CheckCircle2,
  XCircle,
  EyeOff,
  Archive,
  RotateCcw,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Flag,
  FileText,
  Volume2,
  Filter,
} from 'lucide-react'
import { useAdmin } from '@/components/admin/admin-layout-client'
import { useAdminToast } from '@/components/admin/toast-context'
import AdminStatusBadge from '@/components/admin/admin-status-badge'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import AdminConfirmationDialog from '@/components/admin/admin-confirmation-dialog'
import AdminAudioPlayer from '@/components/admin/admin-audio-player'
import type { Contribution } from '@/lib/data'

export default function AdminContributionsPage() {
  const { refreshKey, triggerRefresh } = useAdmin()
  const { showToast } = useAdminToast()

  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialogs
  const [rejectingContrib, setRejectingContrib] = useState<Contribution | null>(null)
  const [deletingContrib, setDeletingContrib] = useState<Contribution | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchContributions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/contributions', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load contributions')
      const json = await res.json()
      setContributions(json.contributions || [])
    } catch (err: any) {
      setError(err.message || 'Error loading contributions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContributions()
  }, [fetchContributions, refreshKey])

  const handleModerate = async (
    id: string,
    action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE' | 'RESTORE',
    reason?: string
  ) => {
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/contributions/${id}/moderation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Moderation failed')
      showToast(`Contribution ${action.toLowerCase()}d successfully`, 'success')
      setRejectingContrib(null)
      triggerRefresh()
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingContrib) return
    const id = deletingContrib.id || (deletingContrib.SK ? deletingContrib.SK.split('#')[1] : null)
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/contributions/${id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageId: deletingContrib.languageId || deletingContrib.PK?.replace('LANGUAGE#', ''),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Deletion failed')
      showToast('Contribution permanently deleted', 'success')
      setDeletingContrib(null)
      triggerRefresh()
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      const modStatus = c.moderationStatus || (c.verified ? 'APPROVED' : 'PENDING')
      if (statusFilter !== 'ALL' && modStatus !== statusFilter) return false
      if (typeFilter !== 'all' && c.type !== typeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = (c.title || '').toLowerCase().includes(q)
        const matchTrans = ((c as any).translation || '').toLowerCase().includes(q)
        const matchLang = (c.languageName || c.languageId || '').toLowerCase().includes(q)
        if (!matchTitle && !matchTrans && !matchLang) return false
      }
      return true
    })
  }, [contributions, statusFilter, typeFilter, searchQuery])

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/60">
        <div>
          <span className="font-ui text-[10px] tracking-widest uppercase font-semibold text-stone-600 block">
            Memory Triage
          </span>
          <h2 className="font-display font-bold text-2xl text-navy tracking-tight mt-0.5">Contribution Moderation</h2>
          <p className="text-xs font-ui text-stone-500 mt-0.5">
            Review community-submitted audio recordings, phrase translations, and cultural context.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {['PENDING', 'APPROVED', 'HIDDEN', 'REJECTED', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-ui font-semibold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-navy text-gold shadow-sm'
                  : 'bg-stone-100/70 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {st === 'ALL' ? 'All Contributions' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phrase, translation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-ui text-navy placeholder:text-stone-400 focus:outline-none focus:border-gold"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-ui text-navy focus:outline-none focus:border-gold"
          >
            <option value="all">All Content Types</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="story">Story</option>
            <option value="cultural-context">Cultural Context</option>
          </select>
        </div>
      </div>

      {/* Grid of Contributions */}
      {loading ? (
        <div className="p-12 text-center text-xs font-ui text-stone-400">Loading contributions...</div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title="No matching contributions found"
          description="Try selecting a different moderation status or clearing your search filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((contrib) => {
            const modStatus = contrib.moderationStatus || (contrib.verified ? 'APPROVED' : 'PENDING')
            const id = contrib.id || (contrib.SK ? contrib.SK.split('#')[1] : '')
            return (
              <div
                key={contrib.SK || contrib.id}
                className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-gold/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.2 rounded text-[10px] font-ui uppercase font-semibold bg-stone-100 text-stone-700">
                          {contrib.type || 'entry'}
                        </span>
                        <AdminStatusBadge status={modStatus} />
                      </div>
                      <h3 className="font-display font-bold text-base text-navy mt-2">
                        {contrib.title || '(Untitled contribution)'}
                      </h3>
                      {(contrib as any).translation && (
                        <p className="text-xs font-serif italic text-stone-600 mt-0.5">
                          "{(contrib as any).translation}"
                        </p>
                      )}
                    </div>
                  </div>

                  {contrib.audioUrl && (
                    <div className="mt-3">
                      <AdminAudioPlayer src={contrib.audioUrl} title={contrib.title} />
                    </div>
                  )}

                  {((contrib as any).culturalContext || contrib.context || (contrib as any).text) && (
                    <p className="text-xs font-ui text-stone-600 mt-3 p-3 bg-stone-50 rounded-xl leading-relaxed">
                      {((contrib as any).culturalContext || contrib.context || (contrib as any).text)}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-[11px] font-ui text-stone-400">
                    <span>{contrib.languageName || contrib.languageId}</span>
                    <span>by {contrib.contributorName || 'Anonymous'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {modStatus === 'APPROVED' ? (
                      <button
                        onClick={() => handleModerate(id, 'HIDE')}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-amber-50 hover:text-amber-700 text-stone-600 rounded-lg text-xs font-ui transition-colors"
                      >
                        Hide
                      </button>
                    ) : modStatus === 'HIDDEN' ? (
                      <button
                        onClick={() => handleModerate(id, 'RESTORE')}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-600 rounded-lg text-xs font-ui transition-colors"
                      >
                        Restore
                      </button>
                    ) : null}
                    <button
                      onClick={() => setDeletingContrib(contrib)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Permanently Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {modStatus === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRejectingContrib(contrib)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-ui font-semibold transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleModerate(id, 'APPROVE')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-ui font-semibold shadow-sm transition-transform active:scale-95"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      <AdminConfirmationDialog
        isOpen={Boolean(rejectingContrib)}
        title="Reject Contribution"
        description="Please provide a rationale for declining this submission."
        targetName={rejectingContrib?.title || 'Untitled contribution'}
        confirmLabel="Reject Submission"
        isDestructive={true}
        requireReason={true}
        isLoading={actionLoading}
        onConfirm={(reason) => {
          if (!rejectingContrib) return
          const id = rejectingContrib.id || (rejectingContrib.SK ? rejectingContrib.SK.split('#')[1] : '')
          handleModerate(id, 'REJECT', reason)
        }}
        onCancel={() => setRejectingContrib(null)}
      />

      {/* Delete Modal */}
      <AdminConfirmationDialog
        isOpen={Boolean(deletingContrib)}
        title="Permanently Delete Contribution"
        description="Are you sure you want to permanently delete this contribution and its audio file from S3?"
        consequence="This action is permanent and cannot be undone."
        targetName={deletingContrib?.title || 'Untitled contribution'}
        confirmLabel="Delete Permanently"
        isDestructive={true}
        isLoading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingContrib(null)}
      />
    </div>
  )
}
