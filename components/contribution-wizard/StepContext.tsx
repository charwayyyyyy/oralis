'use client'

/**
 * components/contribution-wizard/StepContext.tsx
 *
 * Step 4 — Context Enrichment
 * For each phrase: cultural meaning, context, and usage type.
 * Shows one phrase at a time.
 */

import { useState } from 'react'
import type { WizardState, PhraseEntry, UsageType } from './types'

interface Props {
  state:    WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext:   () => void
  onBack:   () => void
}

const USAGE_OPTIONS: { value: UsageType; label: string; desc: string }[] = [
  { value: 'everyday',   label: 'Everyday',   desc: 'Used in daily conversation'        },
  { value: 'formal',     label: 'Formal',      desc: 'Respectful or official settings'   },
  { value: 'informal',   label: 'Informal',    desc: 'Casual or between close relations' },
  { value: 'ceremonial', label: 'Ceremonial',  desc: 'Ritual, sacred, or spiritual use'  },
  { value: 'proverb',    label: 'Proverb',     desc: 'Wisdom passed through generations' },
]

export default function StepContext({ state, onUpdate, onNext, onBack }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  const relevantPhrases = state.phrases.filter((p) => p.text.trim().length > 0)

  function updatePhrase(id: string, patch: Partial<PhraseEntry>) {
    onUpdate({
      phrases: state.phrases.map((p) => p.id === id ? { ...p, ...patch } : p),
    })
  }

  const activePhrase    = relevantPhrases[activeIdx]
  const enrichedCount   = relevantPhrases.filter((p) => p.context.trim().length > 0).length

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="mb-8">
        <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-3 block">
          Step 4 of 5 — Cultural Context
        </span>
        <h2 className="font-display text-4xl font-bold text-navy mb-3 leading-tight">
          Give each phrase its soul.
        </h2>
        <p className="font-body text-stone/70 text-base max-w-md">
          Context transforms a phrase from data into living culture. Describe when
          it&apos;s used, who says it, and why it matters.
        </p>
      </div>

      {/* Phrase tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {relevantPhrases.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIdx(i)}
            className={`px-3.5 py-2 rounded-xl font-ui text-xs transition-all ${
              i === activeIdx
                ? 'glass-navy-heavy text-ivory'
                : p.context.trim()
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'glass text-stone hover:text-navy'
            }`}
          >
            {p.context.trim() ? '✓ ' : ''}{p.text.slice(0, 16)}{p.text.length > 16 ? '…' : ''}
          </button>
        ))}
      </div>

      {/* Active phrase context form */}
      {activePhrase && (
        <div
          key={activePhrase.id}
          className="glass rounded-2xl p-8 mb-6"
          style={{ animation: 'fadeSlideIn 0.35s ease' }}
        >
          {/* Phrase header */}
          <div className="mb-6 pb-5 border-b border-border/20">
            <p className="font-display text-xl font-bold text-navy">{activePhrase.text}</p>
            {activePhrase.translation && (
              <p className="font-body text-sm text-stone/50 mt-1">&ldquo;{activePhrase.translation}&rdquo;</p>
            )}
            {activePhrase.uploaded && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="font-ui text-[10px] text-green-600">Audio archived</span>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {/* Context textarea */}
            <div>
              <label className="block font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-2.5">
                Cultural significance & context
              </label>
              <textarea
                value={activePhrase.context}
                onChange={(e) => updatePhrase(activePhrase.id, { context: e.target.value })}
                placeholder="When is this said? Who says it? What does it mean to the community? Is it tied to a ritual, season, or relationship?"
                rows={4}
                className="w-full px-4 py-3.5 bg-white/40 border border-border/20 rounded-xl font-body text-sm text-navy placeholder:text-stone/25 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none transition-all leading-relaxed"
              />
            </div>

            {/* Usage type */}
            <div>
              <label className="block font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-3">
                Usage register
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {USAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updatePhrase(activePhrase.id, {
                      usage: activePhrase.usage === opt.value ? '' : opt.value,
                    })}
                    className={`p-3 rounded-xl text-left transition-all ${
                      activePhrase.usage === opt.value
                        ? 'glass-navy text-ivory shadow-sm'
                        : 'glass hover:shadow-sm'
                    }`}
                  >
                    <p className={`font-ui text-xs font-medium ${activePhrase.usage === opt.value ? 'text-ivory' : 'text-navy'}`}>
                      {opt.label}
                    </p>
                    <p className={`font-body text-[10px] mt-0.5 ${activePhrase.usage === opt.value ? 'text-ivory/50' : 'text-stone/50'}`}>
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phrase navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/20">
            <button
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="font-ui text-xs text-stone/50 hover:text-navy transition-colors disabled:opacity-20"
            >
              ← Previous phrase
            </button>
            <span className="font-mono text-xs text-stone/30">{activeIdx + 1} / {relevantPhrases.length}</span>
            <button
              onClick={() => setActiveIdx((i) => Math.min(relevantPhrases.length - 1, i + 1))}
              disabled={activeIdx === relevantPhrases.length - 1}
              className="font-ui text-xs text-gold hover:text-navy transition-colors disabled:opacity-20"
            >
              Next phrase →
            </button>
          </div>
        </div>
      )}

      {/* Enrichment progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-1.5">
          <span className="font-ui text-xs text-stone/50">{enrichedCount} of {relevantPhrases.length} enriched</span>
          <span className="font-ui text-xs text-stone/30">context is optional but powerful</span>
        </div>
        <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold/70 rounded-full transition-all duration-500"
            style={{ width: `${(enrichedCount / Math.max(relevantPhrases.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3.5 font-ui text-sm text-stone hover:text-navy glass rounded-xl transition-all">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3.5 font-ui text-sm font-medium glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-all"
        >
          Review & preserve →
        </button>
      </div>
    </div>
  )
}
