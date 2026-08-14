'use client'

import React, { useState, useEffect, useContext } from 'react'
import {
  History,
  Search,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  Tag,
} from 'lucide-react'
import { AdminContext } from '@/components/admin/admin-layout-client'
import type { AuditLogEntry } from '@/lib/data'

export default function AdminAuditPage() {
  const { refreshKey } = useContext(AdminContext)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [entityFilter, setEntityFilter] = useState('ALL')

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/admin/audit', window.location.origin)
      if (entityFilter !== 'ALL') url.searchParams.set('entityType', entityFilter)
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim())

      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load audit logs')
      const json = await res.json()
      setLogs(json.auditLogs || [])
    } catch (err: any) {
      setError(err.message || 'Error loading audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [entityFilter, searchQuery, refreshKey])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone/20 pb-4">
        <span className="text-[11px] font-ui font-semibold text-gold uppercase tracking-[0.2em] block mb-1">
          Governance & Accountability
        </span>
        <h1 className="font-display text-3xl font-bold text-navy tracking-tight">
          Permanent Audit Trail
        </h1>
        <p className="text-xs font-ui text-stone-500 mt-1">
          Immutable chronological record of all administrative approvals, factual metadata modifications, reports, and deletions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, moderator identity, target record, or justification reason..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone/20 rounded-xl text-xs font-body text-navy placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full p-2.5 bg-white border border-stone/20 rounded-xl text-xs font-body text-navy"
          >
            <option value="ALL">All Entity Types</option>
            <option value="language">Language Records</option>
            <option value="contribution">Contribution Records</option>
            <option value="report">User Reports</option>
            <option value="metadata">Metadata Edits</option>
            <option value="reconciliation">Reconciliation Events</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Stream */}
      <div className="bg-white border border-stone/20 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-ui text-stone-400 animate-pulse">
            Loading immutable audit logs...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-rose-600 font-ui">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-stone-400 text-xs font-ui">
            <History className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="font-semibold text-stone-600 text-sm">No audit records found.</p>
            <p className="text-stone-400 mt-1">Actions performed on the platform will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-ui">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/80 text-stone-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                  <th className="py-3.5 px-4 font-semibold">Actor</th>
                  <th className="py-3.5 px-4 font-semibold">Justification / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((log) => (
                  <tr key={log.id || (log as any).SK} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-4 px-4 font-semibold text-navy whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-navy/5 text-navy rounded-lg font-mono text-[10px] border border-navy/10">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-stone-700 whitespace-nowrap">
                      <span className="font-medium">{log.entityType}</span>
                      <span className="text-stone-400 text-[11px] block font-mono">
                        {log.entityId}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-stone-600 whitespace-nowrap">
                      <div className="font-medium text-navy">{log.actorId}</div>
                      <span className="text-[10px] text-stone-400 uppercase">{log.actorRole}</span>
                    </td>

                    <td className="py-4 px-4 text-stone-600 max-w-sm">
                      <p className="line-clamp-2">{log.reason || ''}</p>
                      {log.newState && (
                        <span className="text-[10px] font-mono text-stone-400 mt-0.5 block truncate">
                          State: {JSON.stringify(log.newState)}
                        </span>
                      )}
                    </td>
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
