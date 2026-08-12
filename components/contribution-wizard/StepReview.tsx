'use client'

/**
 * components/contribution-wizard/StepReview.tsx
 *
 * Step 5 — Review & Submit
 * Shows all phrases with audio previews + metadata.
 * Submits each phrase to /api/contribution/create in sequence.
 * Displays the delete token with copy action and stores locally for management.
 */

import { useState } from 'react'
import Link from 'next/link'
import type { WizardState, PhraseEntry } from './types'

interface Props {
  state:    WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onBack:   () => void
}

interface SubmitResult {
  phraseId:       string
  contributionId: string
  deleteToken?:   string
  success:        boolean
  error?:         string
}

function PhraseCard({ phrase, index }: { phrase: PhraseEntry; index: number }) {
  return (
    <div className="glass rounded-xl p-5 space-y-3 border border-border/30">
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
            <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200 font-ui text-[9px] text-green-700 font-medium">
              ✓ Audio Recorded
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
      <p className="font-body text-xs text-stone/50 italic border-l-2 border-gold/40 pl-3">
        {phrase.prompt}
      </p>

      {/* Audio preview */}
      {phrase.audioUrl && (
        <div className="glass-gold rounded-lg p-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={phrase.audioUrl} className="w-full h-8 rounded" />
        </div>
      )}

      {/* Context */}
      {phrase.context && (
        <p className="font-body text-xs text-stone/70 leading-relaxed bg-stone/5 rounded-lg px-4 py-3">
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
  const [tokens,      setTokens]      = useState<string[]>([])
  const [copied,      setCopied]      = useState(false)

  const validPhrases = state.phrases.filter((p) => p.text.trim().length > 0)

  async function handleSubmit() {
    setSubmitting(true)
    setCurrentStep(1)
    setResults([])

    const capturedTokens: string[] = []

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

        if (data.deleteToken) {
          capturedTokens.push(data.deleteToken)

          // Save token to localStorage for device management
          try {
            const existing = JSON.parse(localStorage.getItem('oralis_tokens') ?? '{}')
            existing[data.contributionId] = {
              token:    data.deleteToken,
              PK:       data.PK,
              sk:       data.sk,
              title:    phrase.text,
              language: state.languageName,
              date:     new Date().toISOString(),
            }
            localStorage.setItem('oralis_tokens', JSON.stringify(existing))
          } catch {
            // LocalStorage quota or SSR safe fallback
          }
        }

        const result: SubmitResult = {
          phraseId:       phrase.id,
          contributionId: data.contributionId,
          deleteToken:    data.deleteToken,
          success:        true,
        }
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

    setTokens(capturedTokens)
    onUpdate({ submitted: successCount >= 3, submitError: successCount === 0 ? 'All submissions failed' : null })
    setSubmitting(false)
    setSubmitted(successCount >= 3)
  }

  const handleCopyTokens = () => {
    if (tokens.length > 0) {
      navigator.clipboard.writeText(tokens.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────
  if (submitted) {
    const successCount = results.filter((r) => r.success).length || validPhrases.length
    return (
      <div className="animate-page-enter text-center py-8">
        <div className="w-20 h-20 glass-gold rounded-full flex items-center justify-center mx-auto mb-8 border border-gold/40 shadow-lg">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M6 16l7 7 13-13" stroke="#C8A96B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="font-display text-4xl font-bold text-navy mb-3">Preserved into the Living Atlas.</h2>
        <p className="font-body text-stone/70 text-lg mb-2">
          <strong>{successCount} phrase{successCount !== 1 ? 's' : ''}</strong> from{' '}
          <strong className="text-navy">{state.languageName}</strong> are now part of humanity&apos;s permanent cultural memory.
        </p>
        <p className="font-body text-stone/50 text-sm mb-8 max-w-md mx-auto">
          Your recording has been sealed with a cryptographic delete token so you retain complete stewardship over your contribution.
        </p>

        {/* Delete Token Box */}
        {tokens.length > 0 && (
          <div className="glass-heavy rounded-2xl p-6 mb-8 text-left max-w-lg mx-auto border border-gold/30">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-ui text-[11px] uppercase tracking-wider text-gold font-bold">
                Your Management / Delete Key
              </span>
              <button
                onClick={handleCopyTokens}
                className="font-ui text-xs px-3 py-1.5 bg-gold text-navy font-bold rounded-lg hover:bg-gold-warm transition-all flex items-center gap-1.5 focus-ring"
              >
                {copied ? '✓ Copied!' : 'Copy Key'}
              </button>
            </div>
            <p className="font-mono text-xs text-navy bg-white/60 p-3 rounded-xl break-all border border-border/40 select-all mb-2">
              {tokens[0]}
            </p>
            <p className="font-body text-[11px] text-stone/60">
              Save this key. You can look up or permanently delete your submission at any time on the <Link href="/profile" className="text-gold underline font-bold">Manage Token</Link> page.
            </p>
          </div>
        )}

        {/* Archive summary */}
        <div className="glass rounded-2xl p-6 mb-8 text-left max-w-lg mx-auto border border-border/30">
          <p className="font-ui text-[10px] uppercase tracking-widest text-stone/50 mb-4 font-bold">Archive Summary</p>
          <div className="space-y-2.5">
            {[
              { label: 'Language',    value: state.languageName },
              { label: 'Native Name', value: state.nativeName || '—' },
              { label: 'Region',      value: state.region },
              { label: 'Atlas ID',    value: state.languageId },
              { label: 'Phrases',     value: `${successCount} preserved` },
              { label: 'Audio',       value: `${validPhrases.filter((p) => p.uploaded).length} recordings` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-4 text-sm">
                <span className="font-ui text-xs text-stone/50 w-28 shrink-0">{label}</span>
                <span className="font-body text-navy font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/observatory"
            className="px-8 py-4 font-ui text-sm font-bold bg-gold text-navy rounded-xl hover:bg-gold-warm transition-all shadow-md focus-ring min-h-[44px] flex items-center"
          >
            View in Global Observatory →
          </Link>
          <Link
            href="/profile"
            className="px-8 py-4 font-ui text-sm font-medium glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-all focus-ring min-h-[44px] flex items-center"
          >
            Manage My Tokens
          </Link>
        </div>
      </div>
    )
  }

  // ── Submitting screen ──────────────────────────────────────────────────
  if (submitting) {
    return (
      <div className="animate-page-enter py-8">
        <div className="mb-8 text-center max-w-md mx-auto">
          <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold font-bold mb-3 block">
            Sealing the Record…
          </span>
          <h2 className="font-display text-3xl font-bold text-navy mb-2">
            Preserving {state.languageName}
          </h2>
          <p className="font-body text-stone/60 text-sm">
            Writing {currentStep} of {validPhrases.length} contributions into DynamoDB & S3…
          </p>
        </div>

        <div className="space-y-3 mb-8 max-w-lg mx-auto">
          {validPhrases.map((phrase, i) => {
            const result = results.find((r) => r.phraseId === phrase.id)
            const status = result
              ? result.success ? 'done' : 'error'
              : i + 1 === currentStep ? 'saving' : i < currentStep ? 'waiting' : 'pending'

            return (
              <div key={phrase.id} className={`glass rounded-xl px-5 py-3.5 flex items-center gap-4 transition-all ${
                status === 'done' ? 'border border-green-400/40 bg-green-50/20' : status === 'error' ? 'border border-red-400/40' : ''
              }`}>
                <div className="shrink-0">
                  {status === 'done'   && <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
                  {status === 'error'  && <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center"><span className="text-red-500 text-xs">✕</span></div>}
                  {status === 'saving' && <svg className="animate-spin text-gold" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg>}
                  {(status === 'pending' || status === 'waiting') && <div className="w-5 h-5 rounded-full border border-border/40" />}
                </div>
                <div>
                  <p className="font-body text-sm text-navy truncate font-medium">{phrase.text}</p>
                  {result?.error && <p className="font-ui text-[10px] text-red-500 mt-0.5">{result.error}</p>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-2 bg-border/30 rounded-full overflow-hidden max-w-lg mx-auto">
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
        <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold/80 font-bold mb-3 block">
          Step 5 of 5 — Final Review
        </span>
        <h2 className="font-display text-4xl font-bold text-navy mb-3 leading-tight">
          Review your contribution.
        </h2>
        <p className="font-body text-stone/70 text-base max-w-md leading-relaxed">
          Once sealed, these phrases become part of the permanent{' '}
          <strong className="text-navy">{state.languageName}</strong> archive. Review everything carefully.
        </p>
      </div>

      {/* Language summary */}
      <div className="glass-gold rounded-2xl p-5 mb-6 border border-gold/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gold" />
          </div>
          <div>
            <p className="font-display text-base font-bold text-navy">{state.languageName}</p>
            {state.nativeName && (
              <p className="font-body text-xs text-stone/60">{state.nativeName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-11 flex-wrap">
          <span className="font-ui text-xs text-stone/60">{state.region}</span>
          <span aria-hidden>&middot;</span>
          <code className="font-mono text-xs text-gold font-bold">{state.languageId}</code>
          <span aria-hidden>&middot;</span>
          <span className="font-ui text-xs text-stone/60">{validPhrases.length} phrases</span>
          <span aria-hidden>&middot;</span>
          <span className="font-ui text-xs text-stone/60">{validPhrases.filter((p) => p.uploaded).length} recordings</span>
        </div>
      </div>

      {/* Phrase cards */}
      <div className="space-y-4 mb-8">
        {validPhrases.map((phrase, i) => (
          <PhraseCard key={phrase.id} phrase={phrase} index={i} />
        ))}
      </div>

      {/* Consent & Open Licensing Notice */}
      <div className="glass rounded-xl px-5 py-4 mb-6 border border-border/30">
        <p className="font-ui text-xs text-stone/70 leading-relaxed">
          By sealing this record, I confirm I have the right to share this content and that
          any speakers have given informed consent for cultural archiving. This contribution
          will be preserved under Creative Commons Attribution 4.0 International (CC BY 4.0).
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

      <div className="flex gap-4">
        <button onClick={onBack} className="px-6 py-4 font-ui text-sm text-stone hover:text-navy glass rounded-xl transition-all min-h-[44px] focus-ring">
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-4 font-ui text-sm font-bold bg-gold text-navy rounded-xl hover:bg-gold-warm transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 min-h-[44px] focus-ring"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Seal {validPhrases.length} phrase{validPhrases.length !== 1 ? 's' : ''} into the atlas
        </button>
      </div>
    </div>
  )
}
