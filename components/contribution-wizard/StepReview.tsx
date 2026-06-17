'use client'

/**
 * components/contribution-wizard/StepReview.tsx
 *
 * Step 5 — Review & Submit
 * Shows all phrases with audio previews + metadata.
 * Submits each phrase to /api/contribution/create in sequence.
 */

import { useState } from 'react'
import type { WizardState, PhraseEntry } from './types'

interface Props {
  state:    WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onBack:   () => void
}

interface SubmitResult {
  phraseId:       string
  contributionId: string
  success:        boolean
  error?:         string
}

function PhraseCard({ phrase, index }: { phrase: PhraseEntry; index: number }) {
  return (
    <div className="glass rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-ui text-[10px] text-stone/40 uppercase tracking-widest block mb-1">
            Phrase {index + 1}
          </span>
          <p className="font-display text-lg font-bold text-navy leading-snug">{phrase.text}</p>
          {phrase.translation && (
            <p className="font-body text-sm text-stone/60 italic mt-0.5">&ldquo;{phrase.translation}&rdquo;</p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          {phrase.uploaded && (
            <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200 font-ui text-[9px] text-green-700">
              ✓ Audio
            </span>
          )}
          {phrase.usage && (
            <span className="px-2 py-0.5 rounded-full glass font-ui text-[9px] text-stone/60 capitalize">
              {phrase.usage}
            </span>
          )}
        </div>
      </div>

      {/* Prompt */}
      <p className="font-body text-xs text-stone/40 italic border-l-2 border-gold/30 pl-3">
        {phrase.prompt}
      </p>

      {/* Audio preview */}
      {phrase.audioBlob && (
        <div className="glass-gold rounded-lg p-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={URL.createObjectURL(phrase.audioBlob)} className="w-full h-8 rounded" />
        </div>
      )}

      {/* Context */}
      {phrase.context && (
        <p className="font-body text-xs text-stone/60 leading-relaxed bg-stone/5 rounded-lg px-4 py-3">
          {phrase.context}
        </p>
      )}
    </div>
  )
}

export default function StepReview({ state, onUpdate, onBack }: Props) {
  const [submitting,  setSubmitting]  = useState(false)
  const [results,     setResults]     = useState<SubmitResult[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted,   setSubmitted]   = useState(state.submitted)

  const validPhrases = state.phrases.filter((p) => p.text.trim().length > 0)

  async function handleSubmit() {
    setSubmitting(true)
    setCurrentStep(1) // indicate saving started
    setResults([])

    const promises = validPhrases.map(async (phrase) => {
      try {
        const res  = await fetch('/api/contribution/create', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            languageId:      state.languageId,
            languageName:    state.languageName,
            contentType:     'vocabulary',
            title:           phrase.text,
            body:            phrase.translation ? `Translation: ${phrase.translation}\nUsage: ${phrase.usage || ''}\nPrompt: ${phrase.prompt || ''}`.trim() : '',
            context:         phrase.context || phrase.prompt || 'Vocabulary phrase',
            source:          '',
            location:        state.region || '',
            audioS3Key:      phrase.s3Key || undefined,
            contributorName: 'anonymous',
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Submission failed')

        const result: SubmitResult = { phraseId: phrase.id, contributionId: data.contributionId, success: true }
        setResults((prev) => [...prev, result])
        return result
      } catch (e) {
        const result: SubmitResult = {
          phraseId:       phrase.id,
          contributionId: '',
          success:        false,
          error:          e instanceof Error ? e.message : 'Unknown error',
        }
        setResults((prev) => [...prev, result])
        return result
      }
    })

    const allResults = await Promise.all(promises)

    const successCount = allResults.filter((r) => r.success).length
    onUpdate({ submitted: successCount >= 3, submitError: successCount === 0 ? 'All submissions failed' : null })
    setSubmitting(false)
    setSubmitted(successCount >= 3)
    
    if (successCount >= 3) {
      setTimeout(() => {
        window.location.href = '/observatory'
      }, 3500)
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────
  if (submitted) {
    const successCount = results.filter((r) => r.success).length || validPhrases.length
    return (
      <div className="animate-page-enter text-center py-8">
        <div className="w-20 h-20 glass-gold rounded-full flex items-center justify-center mx-auto mb-8">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M6 16l7 7 13-13" stroke="#C8A96B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="font-display text-4xl font-bold text-navy mb-3">Preserved.</h2>
        <p className="font-body text-stone/70 text-lg mb-2">
          <strong>{successCount} phrase{successCount !== 1 ? 's' : ''}</strong> from{' '}
          <strong>{state.languageName}</strong> are now part of the permanent cultural atlas.
        </p>
        <p className="font-body text-stone/50 text-sm mb-10 max-w-sm mx-auto">
          Every voice recorded here becomes a thread in humanity&apos;s living memory.
          Thank you for this act of preservation.
        </p>

        <div className="glass rounded-2xl p-6 mb-8 text-left">
          <p className="font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-4">Archive summary</p>
          <div className="space-y-2.5">
            {[
              { label: 'Language',    value: state.languageName },
              { label: 'Native name', value: state.nativeName || '—' },
              { label: 'Region',      value: state.region },
              { label: 'Atlas ID',    value: state.languageId },
              { label: 'Phrases',     value: `${successCount} preserved` },
              { label: 'Audio',       value: `${validPhrases.filter((p) => p.uploaded).length} recordings` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-4 text-sm">
                <span className="font-ui text-xs text-stone/40 w-28 shrink-0">{label}</span>
                <span className="font-body text-navy">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <a
            href="/observatory"
            className="px-6 py-3.5 font-ui text-sm font-medium glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-all"
          >
            View in Observatory →
          </a>
        </div>
      </div>
    )
  }

  // ── Submitting screen ──────────────────────────────────────────────────
  if (submitting) {
    return (
      <div className="animate-page-enter py-8">
        <div className="mb-8">
          <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-3 block">
            Sealing the record…
          </span>
          <h2 className="font-display text-3xl font-bold text-navy mb-2">
            Preserving {state.languageName}
          </h2>
          <p className="font-body text-stone/60 text-sm">
            Writing {currentStep} of {validPhrases.length} contributions to the archive…
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {validPhrases.map((phrase, i) => {
            const result = results.find((r) => r.phraseId === phrase.id)
            const status = result
              ? result.success ? 'done' : 'error'
              : i + 1 === currentStep ? 'saving' : i < currentStep ? 'waiting' : 'pending'

            return (
              <div key={phrase.id} className={`glass rounded-xl px-5 py-3.5 flex items-center gap-4 transition-all ${
                status === 'done' ? 'border border-green-200/40' : status === 'error' ? 'border border-red-200/40' : ''
              }`}>
                <div className="shrink-0">
                  {status === 'done'   && <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
                  {status === 'error'  && <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center"><span className="text-red-500 text-xs">✕</span></div>}
                  {status === 'saving' && <svg className="animate-spin text-gold" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg>}
                  {(status === 'pending' || status === 'waiting') && <div className="w-5 h-5 rounded-full border border-border/30" />}
                </div>
                <div>
                  <p className="font-body text-sm text-navy truncate">{phrase.text}</p>
                  {result?.error && <p className="font-ui text-[10px] text-red-500 mt-0.5">{result.error}</p>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / Math.max(validPhrases.length, 1)) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  // ── Review screen ──────────────────────────────────────────────────────
  return (
    <div className="animate-page-enter">
      <div className="mb-8">
        <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-3 block">
          Step 5 of 5 — Final Review
        </span>
        <h2 className="font-display text-4xl font-bold text-navy mb-3 leading-tight">
          Review your contribution.
        </h2>
        <p className="font-body text-stone/70 text-base max-w-md">
          Once sealed, these phrases become part of the permanent{' '}
          <strong>{state.languageName}</strong> archive. Review everything carefully.
        </p>
      </div>

      {/* Language summary */}
      <div className="glass-gold rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gold/60" />
          </div>
          <div>
            <p className="font-display text-base font-bold text-navy">{state.languageName}</p>
            {state.nativeName && (
              <p className="font-body text-xs text-stone/50">{state.nativeName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-11">
          <span className="font-ui text-xs text-stone/50">{state.region}</span>
          <span aria-hidden>&middot;</span>
          <code className="font-mono text-xs text-gold">{state.languageId}</code>
          <span aria-hidden>&middot;</span>
          <span className="font-ui text-xs text-stone/50">{validPhrases.length} phrases</span>
          <span aria-hidden>&middot;</span>
          <span className="font-ui text-xs text-stone/50">{validPhrases.filter((p) => p.uploaded).length} recordings</span>
        </div>
      </div>

      {/* Phrase cards */}
      <div className="space-y-4 mb-8">
        {validPhrases.map((phrase, i) => (
          <PhraseCard key={phrase.id} phrase={phrase} index={i} />
        ))}
      </div>

      {/* Consent */}
      <div className="glass rounded-xl px-5 py-4 mb-6">
        <p className="font-ui text-xs text-stone/60 leading-relaxed">
          By sealing this record, I confirm I have the right to share this content and that
          any speakers have given informed consent for cultural archiving. This contribution
          will be preserved under Creative Commons Attribution 4.0 International.
        </p>
      </div>

      {state.submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="font-ui text-sm font-medium text-red-600 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {state.submitError}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-4 font-ui text-sm text-stone hover:text-navy glass rounded-xl transition-all">
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-4 font-ui text-sm font-medium bg-gold/90 backdrop-blur-sm text-ink rounded-xl hover:bg-gold transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Seal {validPhrases.length} phrase{validPhrases.length !== 1 ? 's' : ''} into the atlas
        </button>
      </div>
    </div>
  )
}
