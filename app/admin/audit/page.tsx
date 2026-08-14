'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { History, Search, ShieldCheck, Filter } from 'lucide-react'
import { useAdmin } from '@/components/admin/admin-layout-client'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import type { AuditLogEntry } from '@/lib/data'

export default function AdminAuditPage() {
  const { refreshKey } = useAdmin()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entityFilter, setEntityFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/audit', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load audit trail')
      const json = await res.json()
      setLogs(json.logs || [])
    } catch (err: any) {
      setError(err.message || 'Error loading audit logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs, refreshKey])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchAction = (log.action || '').toLowerCase().includes(q)
        const matchEntity = (log.entityId || '').toLowerCase().includes(q)
        const matchActor = (log.actorId || '').toLowerCase().includes(q)
        const matchReason = (log.reason || '').toLowerCase().includes(q)
        if (!matchAction && !matchEntity && !matchActor && !matchReason) return false
      }
      return true
    })
  }, [logs, entityFilter, searchQuery])

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/60">
        <div>
          <span className="font-ui text-[10px] tracking-widest uppercase font-semibold text-stone-600 block">
            System Trail
          </span>
          <h2 className="font-display font-bold text-2xl text-navy tracking-tight mt-0.5">Audit Trail</h2>
          <p className="text-xs font-ui text-stone-500 mt-0.5">
            Immutable log of curator approvals, rejections, metadata edits, and administrative operations.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'LANGUAGE', 'CONTRIBUTION', 'REPORT', 'SYSTEM'].map((ent) => (
            <button
              key={ent}
              onClick={() => setEntityFilter(ent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-ui font-semibold transition-all shrink-0 ${
                entityFilter === ent
                  ? 'bg-navy text-gold shadow-sm'
                  : 'bg-stone-100/70 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {ent === 'ALL' ? 'All Entities' : ent.charAt(0) + ent.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-ui text-navy placeholder:text-stone-400 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-ui text-stone-400">Loading audit history...</div>
        ) : filteredLogs.length === 0 ? (
          <AdminEmptyState
            title="No audit entries found"
            description="No administrative actions match your current filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-ui">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-stone-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Entity Type</th>
                  <th className="py-3 px-4 font-semibold">Entity ID</th>
                  <th className="py-3 px-4 font-semibold">Moderator</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                      {new Date(log.timestamp || Date.now()).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-navy">
                      <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[10px] text-stone-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-700">{log.entityType}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500">{log.entityId}</td>
                    <td className="py-3 px-4 text-stone-600">{log.actorId || 'Curator'}</td>
                    <td className="py-3 px-4 text-stone-600 max-w-xs truncate">{log.reason || '—'}</td>
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
