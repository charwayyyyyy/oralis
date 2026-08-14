'use client'

import React, { useEffect, useRef } from 'react'
import { AlertTriangle, AlertCircle, X, Check } from 'lucide-react'

interface Props {
  isOpen: boolean
  title: string
  description: string
  targetName?: string
  consequence?: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  isLoading?: boolean
  error?: string | null
  requireReason?: boolean
  reasonPlaceholder?: string
  onConfirm: (reason?: string) => void
  onCancel: () => void
}

export default function AdminConfirmationDialog({
  isOpen,
  title,
  description,
  targetName,
  consequence,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  error = null,
  requireReason = false,
  reasonPlaceholder = 'Please specify the rationale...',
  onConfirm,
  onCancel,
}: Props) {
  const [reason, setReason] = React.useState('')
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setReason('')
      setTimeout(() => confirmBtnRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onCancel()
    }
  }

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-abyss/60 backdrop-blur-sm animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-navy overflow-hidden font-body">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="font-display font-bold text-lg text-navy">
              {title}
            </h3>
            <p className="text-xs font-ui text-stone-600 mt-1 leading-relaxed">{description}</p>

            {targetName && (
              <div className="mt-3 p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-ui">
                <span className="text-stone-400 uppercase text-[10px] font-semibold tracking-wider block">Target</span>
                <span className="font-semibold text-navy truncate block mt-0.5">{targetName}</span>
              </div>
            )}

            {consequence && (
              <p className="mt-2 text-[11px] font-ui text-stone-500 italic">
                {consequence}
              </p>
            )}

            {requireReason && (
              <div className="mt-4">
                <label className="block text-xs font-ui font-semibold text-stone-700 mb-1">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={reasonPlaceholder}
                  rows={2}
                  disabled={isLoading}
                  className="w-full text-xs font-ui p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
            )}

            {error && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-ui">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-ui font-medium transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (requireReason && !reason.trim())}
            className={`px-4 py-2 rounded-xl text-xs font-ui font-semibold text-white shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 ${
              isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-navy hover:bg-navy-muted'
            }`}
          >
            {isLoading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : isDestructive ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
