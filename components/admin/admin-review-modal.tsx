'use client'

import React, { useState } from 'react'
import { X, Check, XCircle, EyeOff, Archive, AlertTriangle, Play, Pause, Volume2, Globe } from 'lucide-react'
import AdminAudioPlayer from './admin-audio-player'
import AdminStatusBadge from './admin-status-badge'
import type { Language, Contribution } from '@/lib/data'

interface Props {
  isOpen: boolean
  type: 'language' | 'contribution'
  item: (Language & Record<string, any>) | (Contribution & Record<string, any>) | null
  onClose: () => void
  onModerate: (action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE', reason?: string) => Promise<void>
}

export default function AdminReviewModal({ isOpen, type, item, onClose, onModerate }: Props) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [showReasonInput, setShowReasonInput] = useState<string | null>(null)

  if (!isOpen || !item) return null

  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE') => {
    if ((action === 'REJECT' || action === 'HIDE') && !reason.trim() && showReasonInput !== action) {
      setShowReasonInput(action)
      return
    }

    try {
      setLoading(true)
      await onModerate(action, reason.trim())
      setShowReasonInput(null)
      setReason('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const isLang = type === 'language'
  const title = isLang ? (item as Language).name : (item as Contribution).title || '(Untitled contribution)'
  const sub = isLang
    ? `Native: ${(item as Language).nativeName || 'N/A'} · Region: ${(item as Language).region || 'N/A'}`
    : `Language: ${(item as any).languageName || item.languageId || 'N/A'} · Type: ${(item as Contribution).type}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-abyss/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-3xl shadow-2xl max-w-xl w-full p-6 text-navy max-h-[90vh] flex flex-col font-body">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-ui uppercase font-bold tracking-wider">
                {isLang ? 'Language Submission' : 'Contribution Submission'}
              </span>
              <AdminStatusBadge status={(item as any).moderationStatus || (item as any).status} />
            </div>
            <h3 className="font-display font-bold text-xl text-navy mt-1.5">{title}</h3>
            <p className="text-xs font-ui text-stone-500 mt-0.5">{sub}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-navy rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-ui">
          {/* Audio Player if contribution has audio */}
          {!isLang && ((item as any).audioUrl || (item as any).audioS3Key) && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-navy flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-gold" />
                  Archived Audio Recording
                </span>
              </div>
              <AdminAudioPlayer src={(item as any).audioUrl} title={title} />
            </div>
          )}

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80">
            <div>
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Contributor</span>
              <span className="font-semibold text-navy block mt-0.5">{(item as any).contributorName || 'Anonymous'}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Submitted Date</span>
              <span className="font-mono text-[11px] text-stone-700 block mt-0.5">
                {new Date((item as any).createdAt || (item as any).submittedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>

            {isLang ? (
              <>
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">ISO Code</span>
                  <span className="font-mono text-[11px] text-stone-700 block mt-0.5">{((item as Language).iso || (item as any).isoCode) || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Endangerment</span>
                  <span className="font-semibold text-amber-700 block mt-0.5">{((item as Language).vitalityStatus || (item as Language).status) || 'Unlisted'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2">
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Translation</span>
                  <span className="text-stone-800 block mt-0.5 italic">{((item as any).translation) || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Cultural Context / Meaning</span>
                  <p className="text-stone-700 block mt-0.5 leading-relaxed">
                    {((item as any).culturalContext) || (item as Contribution).context || ((item as any).text) || '—'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Reason prompt */}
          {showReasonInput && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <label className="font-semibold text-amber-900 block">
                Specify reason for {showReasonInput.toLowerCase()}ing:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Inaccurate transcription, duplicates existing entry..."
                rows={2}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAction('REJECT')}
              disabled={loading}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-ui font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => handleAction('HIDE')}
              disabled={loading}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-ui font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-ui font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAction('APPROVE')}
              disabled={loading}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-ui font-semibold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Processing...' : 'Approve Submission'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
