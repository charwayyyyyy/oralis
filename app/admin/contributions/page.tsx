'use client'

import React, { useState, useEffect, useContext } from 'react'
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
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react'
import { AdminContext } from '@/components/admin/admin-layout-client'
import AdminAudioPlayer from '@/components/admin/admin-audio-player'
import type { Contribution } from '@/lib/data'

export default function AdminContributionsPage() {
  const { refreshKey, triggerRefresh } = useContext(AdminContext)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [hasAudioFilter, setHasAudioFilter] = useState<string>('all')
  const [reportedOnly, setReportedOnly] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Bulk Selection
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  // Dialogs
  const [rejectingContrib, setRejectingContrib] = useState<Contribution | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [deletingContrib, setDeletingContrib] = useState<Contribution | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchContributions = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/admin/contributions', window.location.origin)
      url.searchParams.set('status', statusFilter)
      if (typeFilter !== 'all') url.searchParams.set('type', typeFilter)
      if (hasAudioFilter !== 'all') url.searchParams.set('hasAudio', hasAudioFilter)
      if (reportedOnly) url.searchParams.set('reportedOnly', 'true')
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim())

      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load contributions')
      const json = await res.json()
      setContributions(json.items || [])
    } catch (err: any) {
      setError(err.message || 'Error loading contributions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContributions()
    setSelectedKeys(new Set())
  }, [statusFilter, typeFilter, hasAudioFilter, reportedOnly, searchQuery, refreshKey])

  // Single Action
  const handleModerationAction = async (
    PK: string,
    SK: string,
    action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE' | 'RESTORE',
    reason = ''
  ) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/contributions/${encodeURIComponent(SK)}/moderation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PK, SK, action, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      showToast(`Contribution state updated to ${action}.`)
      setRejectingContrib(null)
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  // Bulk Approve
  const handleBulkApprove = async () => {
    if (selectedKeys.size === 0) return
    if (!confirm(`Are you sure you want to approve all ${selectedKeys.size} selected contributions?`)) return

    setActionLoading(true)
    try {
      for (const itemKey of Array.from(selectedKeys)) {
        const [pk, sk] = itemKey.split('|||')
        await fetch(`/api/admin/contributions/${encodeURIComponent(sk)}/moderation`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ PK: pk, SK: sk, action: 'APPROVE', reason: 'Bulk curator approval' }),
        })
      }
      showToast(`Approved ${selectedKeys.size} contribution(s).`)
      setSelectedKeys(new Set())
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Bulk approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  // Permanent Delete
  const handlePermanentDelete = async () => {
    if (!deletingContrib) return
    if (deleteConfirmText !== 'DELETE') {
      alert('Type DELETE to confirm.')
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/contributions/${encodeURIComponent(deletingContrib.SK || '')}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PK: deletingContrib.PK,
          SK: deletingContrib.SK,
          confirmationText: deleteConfirmText,
          reason: 'Permanent curator deletion',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete contribution')
      showToast('Contribution and associated audio permanently removed from DynamoDB and S3.')
      setDeletingContrib(null)
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Deletion failed')
    } finally {
      setActionLoading(false)
    }
  }

  const toggleSelect = (key: string) => {
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelectedKeys(next)
  }

  const toggleSelectAll = () => {
    if (selectedKeys.size === contributions.length) {
      setSelectedKeys(new Set())
    } else {
      setSelectedKeys(new Set(contributions.map((c) => `${c.PK || `LANGUAGE#${c.languageId}`}|||${c.SK}`)))
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
            Media & Text Curation
          </span>
          <h1 className="font-display text-3xl font-bold text-navy tracking-tight">
            Contribution Review Queue
          </h1>
          <p className="text-xs font-ui text-stone-500 mt-1">
            Listen to submitted native pronunciations, verify cultural context, and moderate memory recordings.
          </p>
        </div>

        {selectedKeys.size > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
            <span className="text-xs font-ui text-amber-900 font-semibold">
              {selectedKeys.size} selected
            </span>
            <button
              onClick={handleBulkApprove}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-ui font-bold flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Bulk Approve</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone/20 pb-4">
        {(['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'ARCHIVED', 'ALL'] as const).map((tab) => (
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

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrase, story title, context, language, or contributor..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone/20 rounded-xl text-xs font-body text-navy placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full p-2.5 bg-white border border-stone/20 rounded-xl text-xs font-body text-navy"
          >
            <option value="all">All Content Types</option>
            <option value="vocabulary">Vocabulary / Phrase</option>
            <option value="audio">Audio Pronunciation</option>
            <option value="story">Oral Story</option>
            <option value="cultural-context">Cultural Context</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-ui text-stone-600 bg-white border border-stone/20 px-3 py-2.5 rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reportedOnly}
              onChange={(e) => setReportedOnly(e.target.checked)}
              className="rounded text-gold focus:ring-gold"
            />
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span>Reported Only</span>
          </label>

          <select
            value={hasAudioFilter}
            onChange={(e) => setHasAudioFilter(e.target.value)}
            className="flex-1 p-2.5 bg-white border border-stone/20 rounded-xl text-xs font-body text-navy"
          >
            <option value="all">Audio: All</option>
            <option value="true">With Audio Only</option>
            <option value="false">Text Only</option>
          </select>
        </div>
      </div>

      {/* Contributions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs font-ui text-stone-400 bg-white border border-stone/20 rounded-3xl animate-pulse">
            Loading contributions from archive...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-rose-600 font-ui bg-white border border-rose-200 rounded-3xl">
            {error}
          </div>
        ) : contributions.length === 0 ? (
          <div className="p-16 text-center text-stone-400 text-xs font-ui bg-white border border-stone/20 rounded-3xl">
            <Mic className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="font-semibold text-stone-600 text-sm">No contributions in this queue.</p>
            <p className="text-stone-400 mt-1">Try switching status tabs or relaxing search filters.</p>
          </div>
        ) : (
          contributions.map((contrib) => {
            const pk = contrib.PK || `LANGUAGE#${contrib.languageId}`
            const sk = contrib.SK || contrib.id
            const itemKey = `${pk}|||${sk}`
            const isSelected = selectedKeys.has(itemKey)
            const status = (contrib.moderationStatus || 'PENDING').toUpperCase()

            return (
              <div
                key={sk}
                className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all ${
                  isSelected
                    ? 'border-gold/60 ring-1 ring-gold/40 bg-amber-50/20'
                    : 'border-stone/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Select, Info, Content */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => toggleSelect(itemKey)}
                      className="mt-1 focus-ring p-0.5 shrink-0"
                      aria-label="Select contribution"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-gold" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                      )}
                    </button>

                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Header Line */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display font-bold text-lg text-navy break-words">
                          {contrib.title || '(Untitled contribution)'}
                        </h2>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-ui font-semibold bg-stone-100 text-stone-700 uppercase tracking-wider">
                          {contrib.type || 'entry'}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'PENDING'
                              ? 'bg-amber-100 text-amber-900'
                              : status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {status}
                        </span>

                        {(contrib.reportCount || 0) > 0 && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <Flag className="w-3 h-3" />
                            {contrib.reportCount} Report(s)
                          </span>
                        )}
                      </div>

                      {/* Language & Contributor Metadata */}
                      <div className="text-xs font-ui text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>
                          Language: <strong className="text-navy font-semibold">{contrib.languageName || contrib.languageId}</strong>
                        </span>
                        <span></span>
                        <span>
                          Contributor: <strong className="text-navy font-semibold">{contrib.contributorName || 'Anonymous'}</strong>
                        </span>
                        {contrib.location && (
                          <>
                            <span></span>
                            <span>Location: {contrib.location}</span>
                          </>
                        )}
                        <span></span>
                        <span className="text-stone-400 font-mono text-[11px]">
                          {new Date(contrib.createdAt || contrib.submittedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Content / Transcript / Context */}
                      {contrib.context && (
                        <div className="p-3.5 bg-stone-50/70 border border-stone-100 rounded-2xl text-xs font-body text-stone-700 leading-relaxed">
                          <span className="text-[10px] font-ui uppercase font-semibold text-stone-400 block mb-1">
                            Cultural Context
                          </span>
                          {contrib.context}
                        </div>
                      )}

                      {contrib.body && (
                        <div className="p-3.5 bg-stone-50/70 border border-stone-100 rounded-2xl text-xs font-body text-stone-700 leading-relaxed">
                          <span className="text-[10px] font-ui uppercase font-semibold text-stone-400 block mb-1">
                            Full Story Transcript
                          </span>
                          {contrib.body}
                        </div>
                      )}

                      {/* Audio Player Preview */}
                      {contrib.audioUrl && (
                        <div className="pt-1">
                          <AdminAudioPlayer src={contrib.audioUrl} title={contrib.title} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Moderation Action Buttons */}
                  <div className="flex sm:flex-row lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                    {status !== 'APPROVED' && (
                      <button
                        onClick={() => handleModerationAction(pk, sk, 'APPROVE')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-ui font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-50 w-full justify-center"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                    )}

                    {status !== 'REJECTED' && (
                      <button
                        onClick={() => {
                          setRejectingContrib(contrib)
                          setRejectReason('')
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-ui font-semibold flex items-center gap-1.5 transition-colors w-full justify-center"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    )}

                    {status === 'APPROVED' && (
                      <button
                        onClick={() => handleModerationAction(pk, sk, 'HIDE', 'Administrative hide')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-ui font-semibold flex items-center gap-1.5 transition-colors w-full justify-center"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setDeletingContrib(contrib)
                        setDeleteConfirmText('')
                      }}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-700 rounded-xl text-xs font-ui transition-colors w-full flex items-center justify-center gap-1"
                      title="Permanently remove record and S3 audio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MODAL: Reject Reason */}
      {rejectingContrib && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-fadeIn">
            <h3 className="font-display font-bold text-lg text-navy mb-2">
              Reject Contribution
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Specify a reason for rejecting &quot;{rejectingContrib.title}&quot;. This reason will be permanently recorded in the audit log.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g. offensive content, low audio quality, copyright concern)..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body text-navy focus:outline-none focus:ring-2 focus:ring-rose-500/50 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectingContrib(null)}
                className="px-4 py-2 rounded-xl text-xs font-ui text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleModerationAction(
                    rejectingContrib.PK || `LANGUAGE#${rejectingContrib.languageId}`,
                    rejectingContrib.SK || rejectingContrib.id,
                    'REJECT',
                    rejectReason
                  )
                }
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-ui font-bold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Permanent Deletion */}
      {deletingContrib && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-display font-bold text-lg text-navy">
                Permanent Contribution Deletion
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              This will permanently delete <span className="font-bold text-navy">&quot;{deletingContrib.title}&quot;</span> from DynamoDB and remove any associated audio file from Amazon S3 storage.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-ui font-semibold text-stone-700 mb-1">
                Type <span className="font-mono text-rose-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingContrib(null)}
                className="px-4 py-2 rounded-xl text-xs font-ui text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={deleteConfirmText !== 'DELETE' || actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-ui font-bold shadow-sm disabled:opacity-40"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
