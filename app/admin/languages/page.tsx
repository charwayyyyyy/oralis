'use client'

import React, { useState, useEffect, useContext, useMemo } from 'react'
import {
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  EyeOff,
  Archive,
  RotateCcw,
  Trash2,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Info,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
} from 'lucide-react'
import { AdminContext } from '@/components/admin/admin-layout-client'
import type { Language, ModerationStatus } from '@/lib/data'

export default function AdminLanguagesPage() {
  const { refreshKey, triggerRefresh } = useContext(AdminContext)
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState('ALL')

  // Selections for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals & Dialogs
  const [selectedLang, setSelectedLang] = useState<Language | null>(null)
  const [editingLang, setEditingLang] = useState<Language | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    nativeName: '',
    region: '',
    country: '',
    speakers: 0,
    vitalityStatus: 'endangered',
    description: '',
    adminNotes: '',
    reason: '',
  })

  const [rejectingLang, setRejectingLang] = useState<Language | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [deletingLang, setDeletingLang] = useState<Language | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [cascadeDelete, setCascadeDelete] = useState(false)

  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const fetchLanguages = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/languages?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to load languages list')
      const json = await res.json()
      setLanguages(json.items || [])
    } catch (err: any) {
      setError(err.message || 'Error loading languages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLanguages()
    setSelectedIds(new Set())
  }, [statusFilter, searchQuery, refreshKey])

  // Status Action (Approve, Reject, Hide, Archive, Restore)
  const handleModerationAction = async (
    languageId: string,
    action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE' | 'RESTORE',
    reason = ''
  ) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/languages/${languageId}/moderation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update moderation state')
      showToast(`Language "${languageId}" is now ${action}D.`)
      setRejectingLang(null)
      setSelectedLang(null)
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  // Bulk Approve
  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to approve all ${selectedIds.size} selected languages?`)) return

    setActionLoading(true)
    try {
      for (const id of Array.from(selectedIds)) {
        await fetch(`/api/admin/languages/${id}/moderation`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'APPROVE', reason: 'Bulk curator approval' }),
        })
      }
      showToast(`Approved ${selectedIds.size} language(s).`)
      setSelectedIds(new Set())
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Bulk approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  // Metadata Edit Submit
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLang) return
    if (!editFormData.reason.trim()) {
      alert('Please enter a justification reason for this factual metadata update.')
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/languages/${editingLang.id}/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update metadata')
      showToast(`Metadata for "${editingLang.name}" updated with audit trail.`)
      setEditingLang(null)
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Update failed')
    } finally {
      setActionLoading(false)
    }
  }

  // Permanent Delete
  const handlePermanentDelete = async () => {
    if (!deletingLang) return
    if (deleteConfirmText !== 'DELETE') {
      alert('You must type DELETE to confirm permanent deletion.')
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/languages/${deletingLang.id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationText: deleteConfirmText,
          cascade: cascadeDelete,
          reason: 'Permanent curator deletion',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete language')
      showToast(data.message || `Language "${deletingLang.name}" permanently deleted.`)
      setDeletingLang(null)
      setSelectedLang(null)
      triggerRefresh()
    } catch (err: any) {
      alert(err.message || 'Deletion failed')
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle selection
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLanguages.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredLanguages.map((l) => l.id)))
    }
  }

  // Filter by region locally if selected
  const filteredLanguages = useMemo(() => {
    return languages.filter((l) => {
      if (regionFilter !== 'ALL' && l.continent !== regionFilter && l.region !== regionFilter) {
        return false
      }
      return true
    })
  }, [languages, regionFilter])

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-navy text-ivory px-5 py-3 rounded-2xl shadow-xl border border-gold/40 flex items-center gap-3 animate-fadeIn text-xs font-ui font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone/20 pb-4">
        <div>
          <span className="text-[11px] font-ui font-semibold text-gold uppercase tracking-[0.2em] block mb-1">
            Language Registry
          </span>
          <h1 className="font-display text-3xl font-bold text-navy tracking-tight">
            Language Review Queue
          </h1>
          <p className="text-xs font-ui text-stone-500 mt-1">
            Review community language declarations, correct factual metadata, and manage publication states.
          </p>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
            <span className="text-xs font-ui text-amber-900 font-semibold">
              {selectedIds.size} selected
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

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language name, native script, ISO code, or region..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone/20 rounded-xl text-xs font-body text-navy placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
          />
        </div>
      </div>

      {/* Languages Table / Card List */}
      <div className="bg-white border border-stone/20 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-ui text-stone-400 animate-pulse">
            Loading languages from archive...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-rose-600 font-ui">
            {error}
          </div>
        ) : filteredLanguages.length === 0 ? (
          <div className="p-16 text-center text-stone-400 text-xs font-ui">
            <Globe className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="font-semibold text-stone-600 text-sm">No languages in this queue.</p>
            <p className="text-stone-400 mt-1">Adjust your status filter or search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-ui">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/80 text-stone-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 w-8">
                    <button onClick={toggleSelectAll} className="focus-ring p-0.5">
                      {selectedIds.size === filteredLanguages.length ? (
                        <CheckSquare className="w-4 h-4 text-gold" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Language</th>
                  <th className="py-3.5 px-4 font-semibold">Region / Family</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Contributor</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLanguages.map((lang) => {
                  const status = (lang.moderationStatus || 'PENDING').toUpperCase()
                  const isSelected = selectedIds.has(lang.id)
                  return (
                    <tr
                      key={lang.id}
                      className={`hover:bg-stone-50/50 transition-colors ${
                        isSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <button onClick={() => toggleSelect(lang.id)} className="focus-ring p-0.5">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-gold" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-300 hover:text-stone-500" />
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-navy">{lang.name}</span>
                          {lang.nativeName && (
                            <span className="text-xs text-stone-500 italic">({lang.nativeName})</span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                          ID: {lang.id} {lang.iso ? ` ISO: ${lang.iso}` : ''}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-stone-700 font-medium">{lang.region || 'Unknown Region'}</div>
                        <div className="text-[11px] text-stone-400">{lang.family || lang.country || ''}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : status === 'PENDING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-stone-700 font-medium">{lang.contributorName || 'Anonymous'}</div>
                        {lang.contributorEmail && (
                          <div className="text-[10px] text-stone-400 font-mono truncate max-w-[140px]">
                            {lang.contributorEmail}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status !== 'APPROVED' && (
                            <button
                              onClick={() => handleModerationAction(lang.id, 'APPROVE')}
                              disabled={actionLoading}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors focus-ring"
                              title="Approve Language"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {status !== 'REJECTED' && (
                            <button
                              onClick={() => {
                                setRejectingLang(lang)
                                setRejectReason('')
                              }}
                              disabled={actionLoading}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors focus-ring"
                              title="Reject Language"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingLang(lang)
                              setEditFormData({
                                name: lang.name,
                                nativeName: lang.nativeName || '',
                                region: lang.region || '',
                                country: lang.country || '',
                                speakers: lang.speakers || 0,
                                vitalityStatus: (lang.vitalityStatus || lang.status || 'endangered') as string,
                                description: lang.description || '',
                                adminNotes: lang.adminNotes || '',
                                reason: '',
                              })
                            }}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors focus-ring"
                            title="Edit Factual Metadata"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setDeletingLang(lang)
                              setDeleteConfirmText('')
                              setCascadeDelete(false)
                            }}
                            className="p-1.5 bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-700 rounded-lg transition-colors focus-ring"
                            title="Permanent Deletion"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Reject Reason */}
      {rejectingLang && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-fadeIn">
            <h3 className="font-display font-bold text-lg text-navy mb-2">
              Reject Language Submission
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Specify a reason for rejecting &quot;{rejectingLang.name}&quot;. This will be recorded in the audit log.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g. invalid language declaration, duplicate entry)..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body text-navy focus:outline-none focus:ring-2 focus:ring-rose-500/50 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectingLang(null)}
                className="px-4 py-2 rounded-xl text-xs font-ui text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerationAction(rejectingLang.id, 'REJECT', rejectReason)}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-ui font-bold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Metadata Factual Correction */}
      {editingLang && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 animate-fadeIn my-8">
            <h3 className="font-display font-bold text-xl text-navy mb-1">
              Correct Factual Metadata
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Language: <span className="font-bold text-navy">{editingLang.name}</span> ({editingLang.id})
              <br />
              <span className="text-amber-700">Edits are audited and do not silently overwrite community history.</span>
            </p>

            <form onSubmit={handleSaveMetadata} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-ui font-semibold text-stone-600 mb-1">
                    Language Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-ui font-semibold text-stone-600 mb-1">
                    Native Name / Script
                  </label>
                  <input
                    type="text"
                    value={editFormData.nativeName}
                    onChange={(e) => setEditFormData({ ...editFormData, nativeName: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-ui font-semibold text-stone-600 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.region}
                    onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-ui font-semibold text-stone-600 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-ui font-semibold text-stone-600 mb-1">
                    Estimated Speakers
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.speakers}
                    onChange={(e) => setEditFormData({ ...editFormData, speakers: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-ui font-semibold text-stone-600 mb-1">
                    Vitality Status
                  </label>
                  <select
                    value={editFormData.vitalityStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, vitalityStatus: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body"
                  >
                    <option value="safe">Safe</option>
                    <option value="vulnerable">Vulnerable</option>
                    <option value="endangered">Endangered</option>
                    <option value="critically-endangered">Critically Endangered</option>
                    <option value="dormant">Dormant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-ui font-semibold text-stone-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body"
                />
              </div>

              <div>
                <label className="block text-[11px] font-ui font-semibold text-rose-700 mb-1">
                  Reason for Factual Update *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                  placeholder="e.g., Corrected ISO classification and native spelling"
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-body"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingLang(null)}
                  className="px-4 py-2 rounded-xl text-xs font-ui text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-navy text-ivory rounded-xl text-xs font-ui font-bold shadow-md hover:bg-navy/90"
                >
                  Save Audited Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Permanent Deletion */}
      {deletingLang && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-display font-bold text-lg text-navy">
                Permanent Language Deletion
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              This will permanently delete <span className="font-bold text-navy">&quot;{deletingLang.name}&quot;</span> from DynamoDB. This action cannot be undone.
            </p>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 mb-4">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={cascadeDelete}
                  onChange={(e) => setCascadeDelete(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Also permanently delete attached audio & contributions</span>
              </label>
            </div>

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
                onClick={() => setDeletingLang(null)}
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
