'use client'

import { useState } from 'react'
import { Flag, Check, AlertCircle, X } from 'lucide-react'

interface ContributionItemProps {
  contribution: {
    id: string
    text?: string
    title?: string
    translation?: string
    body?: string
    context?: string
    audioUrl?: string
    usage?: string
    type?: string
    createdAt: string
    languageId?: string
    PK?: string
    SK?: string
  }
}

export default function ContributionItem({ contribution }: ContributionItemProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState<string>('incorrect-info')
  const [reportExplanation, setReportExplanation] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  const date = new Date(contribution.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const title = contribution.text || contribution.title || '(Untitled contribution)'
  const subtitle = contribution.translation || contribution.body
  const pk = contribution.PK || `LANGUAGE#${contribution.languageId || 'unknown'}`
  const sk = contribution.SK || contribution.id

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingReport(true)
    setReportError(null)

    try {
      const res = await fetch('/api/report/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'contribution',
          targetId: contribution.id,
          targetPK: pk,
          targetSK: sk,
          targetTitle: title,
          languageId: contribution.languageId,
          reason: reportReason,
          explanation: reportExplanation.trim(),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit report')

      setReportSuccess(true)
      setTimeout(() => {
        setReportModalOpen(false)
        setReportSuccess(false)
        setReportExplanation('')
      }, 2500)
    } catch (err: any) {
      setReportError(err.message || 'Error submitting report')
    } finally {
      setSubmittingReport(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 lg:p-8 relative overflow-hidden transition-all hover:shadow-md hover:bg-white/40">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Core content */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              {(contribution.usage || contribution.type) && (
                <span className="px-3 py-1 rounded-full glass-gold text-gold font-ui text-[10px] uppercase tracking-widest font-medium">
                  {contribution.usage || contribution.type}
                </span>
              )}
              <span className="font-ui text-xs text-stone/40 uppercase tracking-widest">
                Archived {date}
              </span>
            </div>

            <button
              onClick={() => setReportModalOpen(true)}
              className="text-[11px] font-ui text-stone/40 hover:text-rose-600 transition-colors flex items-center gap-1 focus-ring rounded p-1"
              title="Report this contribution to archive moderators"
              aria-label={`Report contribution: ${title}`}
            >
              <Flag className="w-3 h-3" />
              <span>Report</span>
            </button>
          </div>

          <h4 className="font-display text-2xl lg:text-3xl font-bold text-navy leading-tight mb-2">
            &quot;{title}&quot;
          </h4>

          {subtitle && (
            <p className="font-body text-lg text-stone/80 italic mb-4 whitespace-pre-line">
              {subtitle}
            </p>
          )}

          {contribution.context && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <p className="font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-2">
                Cultural Context
              </p>
              <p className="font-body text-sm leading-relaxed text-stone/70">
                {contribution.context}
              </p>
            </div>
          )}
        </div>

        {/* Audio Player Area */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col justify-center">
          {contribution.audioUrl ? (
            <div className="glass-heavy rounded-xl p-4 flex flex-col gap-3 border border-gold/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="font-ui text-xs font-medium text-navy uppercase tracking-widest">
                  Original Recording
                </span>
              </div>
              <audio
                controls
                src={contribution.audioUrl}
                className="w-full h-10 custom-audio-player"
                controlsList="nodownload noplaybackrate"
              />
            </div>
          ) : (
            <div className="glass rounded-xl p-6 flex flex-col items-center justify-center border border-dashed border-stone/20 text-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-stone/30 mb-2"
                aria-hidden="true"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              <p className="font-ui text-xs text-stone/40 uppercase tracking-widest">No audio recorded</p>
            </div>
          )}
        </div>
      </div>

      {/* REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-fadeIn relative">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-navy focus-ring p-1 rounded-full"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-navy">Report Received</h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  Thank you for helping uphold the cultural authenticity and respect of the Oralis archive.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-navy">
                    Report Contribution
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Help archive curators maintain integrity and cultural respect.
                  </p>
                </div>

                {reportError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{reportError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-ui font-semibold text-stone-700 mb-1">
                    Reason for concern *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body text-navy focus:ring-2 focus:ring-gold/50"
                  >
                    <option value="incorrect-info">Incorrect or misleading linguistic information</option>
                    <option value="no-consent">No consent / cultural ownership concern</option>
                    <option value="offensive">Offensive, harmful, or inappropriate content</option>
                    <option value="spam">Spam or irrelevant submission</option>
                    <option value="duplicate">Duplicate record</option>
                    <option value="audio-mismatch">Audio does not match written phrase</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-ui font-semibold text-stone-700 mb-1">
                    Additional notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportExplanation}
                    onChange={(e) => setReportExplanation(e.target.value)}
                    placeholder="Provide details to assist moderator evaluation..."
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-body text-navy focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-ui text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-5 py-2.5 bg-navy text-ivory rounded-xl text-xs font-ui font-bold shadow-md hover:bg-navy/90 disabled:opacity-50"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
