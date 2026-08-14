'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  RefreshCw,
} from 'lucide-react'
import { useAdmin } from '@/components/admin/admin-layout-client'
import { useAdminToast } from '@/components/admin/toast-context'
import AdminStatusBadge from '@/components/admin/admin-status-badge'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import AdminConfirmationDialog from '@/components/admin/admin-confirmation-dialog'
import type { Language, ModerationStatus } from '@/lib/data'

export default function AdminLanguagesPage() {
  const { refreshKey, triggerRefresh } = useAdmin()
  const { showToast } = useAdminToast()

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
  const [deletingLang, setDeletingLang] = useState<Language | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchLanguages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/languages', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load language registry')
      const json = await res.json()
      setLanguages(json.languages || [])
    } catch (err: any) {
      setError(err.message || 'Network error loading languages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLanguages()
  }, [fetchLanguages, refreshKey])

  // Moderate single language
  const handleModerate = async (
    id: string,
    action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE' | 'RESTORE',
    reason?: string
  ) => {
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/languages/${id}/moderation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Moderation action failed')
      showToast(`Language ${action.toLowerCase()}d successfully`, 'success')
      setRejectingLang(null)
      triggerRefresh()
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Permanent Deletion
  const handleDeleteConfirm = async () => {
    if (!deletingLang) return
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/languages/${deletingLang.id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cascade: true }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Deletion failed')
      showToast(`Language "${deletingLang.name}" deleted permanently`, 'success')
      setDeletingLang(null)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(deletingLang.id)
        return next
      })
      triggerRefresh()
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Metadata Edit Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLang) return
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/languages/${editingLang.id}/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update metadata')
      showToast(`Metadata for "${editingLang.name}" updated successfully`, 'success')
      setEditingLang(null)
      triggerRefresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to update metadata', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Filter languages
  const filteredLanguages = useMemo(() => {
    return languages.filter((l) => {
      const modStatus = l.moderationStatus || (l.status === 'PENDING_REVIEW' ? 'PENDING' : 'APPROVED')
      if (statusFilter !== 'ALL' && modStatus !== statusFilter) return false
      if (regionFilter !== 'ALL' && l.region !== regionFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = l.name.toLowerCase().includes(q)
        const matchNative = (l.nativeName || '').toLowerCase().includes(q)
        const matchIso = (l.iso || '').toLowerCase().includes(q)
        if (!matchName && !matchNative && !matchIso) return false
      }
      return true
    })
  }, [languages, statusFilter, regionFilter, searchQuery])

  const regions = useMemo(() => {
    const set = new Set<string>()
    languages.forEach((l) => {
      if (l.region) set.add(l.region)
    })
    return Array.from(set)
  }, [languages])

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/60">
        <div>
          <span className="font-ui text-[10px] tracking-widest uppercase font-semibold text-stone-600 block">
            Archival Registry
          </span>
          <h2 className="font-display font-bold text-2xl text-navy tracking-tight mt-0.5">Language Registry</h2>
          <p className="text-xs font-ui text-stone-500 mt-0.5">
            Audit, verify, edit cultural metadata, and manage language visibility in the global atlas.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Tabs */}
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
              {st === 'ALL' ? 'All Languages' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search and Region Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search language, ISO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-ui text-navy placeholder:text-stone-400 focus:outline-none focus:border-gold"
            />
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-ui text-navy focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Languages Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-ui text-stone-400">Loading language records...</div>
        ) : filteredLanguages.length === 0 ? (
          <AdminEmptyState
            title="No matching languages found"
            description="Try changing your search keywords or switching status filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-ui">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-stone-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Language</th>
                  <th className="py-3 px-4 font-semibold">Region</th>
                  <th className="py-3 px-4 font-semibold">ISO Code</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Memories</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLanguages.map((lang) => {
                  const modStatus = lang.moderationStatus || (lang.status === 'PENDING_REVIEW' ? 'PENDING' : 'APPROVED')
                  return (
                    <tr key={lang.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-navy text-sm">{lang.name}</div>
                        {lang.nativeName && (
                          <div className="text-stone-400 font-serif italic text-xs">{lang.nativeName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{lang.region || 'Global'}</td>
                      <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">{lang.iso || '—'}</td>
                      <td className="py-3 px-4">
                        <AdminStatusBadge status={modStatus} />
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-700">{(lang as any).contributionCount || lang.audioCount || 0}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {modStatus === 'PENDING' && (
                          <button
                            onClick={() => handleModerate(lang.id, 'APPROVE')}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Approve Language"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingLang(lang)
                            setEditFormData({
                              name: lang.name,
                              nativeName: lang.nativeName || '',
                              region: lang.region || '',
                              country: (lang as any).country || '',
                              speakers: (lang as any).speakers || 0,
                              vitalityStatus: (lang as any).vitalityStatus || 'endangered',
                              description: lang.description || '',
                              adminNotes: (lang as any).adminNotes || '',
                              reason: '',
                            })
                          }}
                          className="p-1.5 text-stone-500 hover:text-navy hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Cultural Metadata"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {modStatus === 'APPROVED' ? (
                          <button
                            onClick={() => handleModerate(lang.id, 'HIDE')}
                            className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Hide Language"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        ) : modStatus === 'HIDDEN' ? (
                          <button
                            onClick={() => handleModerate(lang.id, 'RESTORE')}
                            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore Language"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => setDeletingLang(lang)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Permanently Delete Language"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Metadata Modal */}
      {editingLang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-abyss/60 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-navy max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-display font-bold text-lg text-navy">Edit Metadata: {editingLang.name}</h3>
              <button onClick={() => setEditingLang(null)} className="p-1 text-stone-400 hover:text-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3 text-xs font-ui">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Language Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Native Name</label>
                  <input
                    type="text"
                    value={editFormData.nativeName}
                    onChange={(e) => setEditFormData({ ...editFormData, nativeName: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Region</label>
                  <input
                    type="text"
                    value={editFormData.region}
                    onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Cultural Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Curator Reason for Update</label>
                <input
                  type="text"
                  placeholder="E.g., Updated speaker count from 2026 census..."
                  value={editFormData.reason}
                  onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLang(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-navy text-gold rounded-xl font-semibold shadow-sm hover:bg-navy-muted disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Metadata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmationDialog
        isOpen={Boolean(deletingLang)}
        title="Permanently Delete Language"
        description={`Are you sure you want to permanently delete "${deletingLang?.name}"? All associated contributions, recordings, and metadata will be removed from DynamoDB and S3.`}
        consequence="This action is destructive and cannot be undone."
        targetName={deletingLang?.name}
        confirmLabel="Delete Permanently"
        isDestructive={true}
        isLoading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingLang(null)}
      />
    </div>
  )
}
