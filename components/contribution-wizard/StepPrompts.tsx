'use client'

/**
 * components/contribution-wizard/StepPrompts.tsx
 *
 * Step 2 — Guided Phrase Collection
 * Shows cultural prompts one at a time, user types the phrase + translation.
 * Focus mode: only one prompt visible at a time.
 */

import { useState, useEffect } from 'react'
import { CULTURAL_PROMPTS, getRandomPrompts, createEmptyPhrase } from './types'
import type { WizardState, PhraseEntry } from './types'

interface Props {
  state:    WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext:   () => void
  onBack:   () => void
}

export default function StepPrompts({ state, onUpdate, onNext, onBack }: Props) {
  const [activeIdx, setActiveIdx] = useState(
    state.phrases.length > 0 ? state.phrases.length - 1 : 0
  )

  // Initialise 5 prompts if none yet
  useEffect(() => {
    if (state.phrases.length === 0) {
      const initialPrompts = getRandomPrompts(5)
      const initialPhrases = initialPrompts.map((p) => createEmptyPhrase(p.prompt))
      onUpdate({ phrases: initialPhrases })
    }
  }, [state.phrases.length, onUpdate])

  if (state.phrases.length === 0) {
    return null // wait for effect to run
  }

  const activePhrase = state.phrases[activeIdx]
  const MIN_PHRASES  = 3

  function updatePhrase(id: string, patch: Partial<PhraseEntry>) {
    onUpdate({
      phrases: state.phrases.map((p) => p.id === id ? { ...p, ...patch } : p),
    })
  }

  function addNewPrompt() {
    const usedPrompts = new Set(state.phrases.map((p) => p.prompt))
    const available   = CULTURAL_PROMPTS.filter((p) => !usedPrompts.has(p.prompt))
    if (available.length === 0) return
    const random      = available[Math.floor(Math.random() * available.length)]
    const newPhrase   = createEmptyPhrase(random.prompt)
    const newPhrases  = [...state.phrases, newPhrase]
    onUpdate({ phrases: newPhrases })
    setActiveIdx(newPhrases.length - 1)
  }

  function removePhrase(id: string) {
    if (state.phrases.length <= 1) return
    const newPhrases = state.phrases.filter((p) => p.id !== id)
    onUpdate({ phrases: newPhrases })
    setActiveIdx(Math.max(0, activeIdx - 1))
  }

  const completedCount = state.phrases.filter((p) => p.text.trim().length > 0).length
  const canProceed     = completedCount >= MIN_PHRASES

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="mb-8">
        <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-3 block">
          Step 2 of 5 — Phrase Collection
        </span>
        <h2 className="font-display text-4xl font-bold text-navy mb-3 leading-tight">
          Speak through the prompts.
        </h2>
        <p className="font-body text-stone/70 text-base max-w-md">
          Each prompt is a window into the culture. Answer in{' '}
          <strong className="text-navy">{state.languageName}</strong>. Skip any that
          don&apos;t apply — but try to complete at least {MIN_PHRASES}.
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {state.phrases.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIdx(i)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIdx
                ? 'w-8 h-2.5 bg-gold'
                : p.text.trim()
                ? 'w-2.5 h-2.5 bg-green-600/60'
                : 'w-2.5 h-2.5 bg-stone/20 hover:bg-stone/40'
            }`}
            aria-label={`Prompt ${i + 1}`}
          />
        ))}
        <button
          onClick={addNewPrompt}
          className="w-6 h-6 rounded-full border border-dashed border-stone/30 text-stone/40 hover:border-gold/50 hover:text-gold transition-all flex items-center justify-center font-ui text-xs ml-1"
          aria-label="Add new prompt"
          title="Generate a new prompt"
        >
          +
        </button>
      </div>

      {/* Active prompt — focus mode */}
      {activePhrase && (
        <div
          key={activePhrase.id}
          className="glass rounded-2xl p-8 mb-5 transition-all duration-400"
          style={{ animation: 'fadeSlideIn 0.35s ease' }}
        >
          {/* Prompt text */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-2 block">
                Prompt {activeIdx + 1} of {state.phrases.length}
              </span>
              <p className="font-display text-xl font-bold text-navy leading-snug">
                {activePhrase.prompt}
              </p>
            </div>
            {state.phrases.length > 1 && (
              <button
                onClick={() => removePhrase(activePhrase.id)}
                className="shrink-0 ml-4 text-stone/30 hover:text-red-400 transition-colors"
                aria-label="Remove this prompt"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Phrase input */}
          <div className="space-y-4">
            <div>
              <label className="block font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-2">
                In {state.languageName} <span className="text-gold">*</span>
              </label>
              <textarea
                value={activePhrase.text}
                onChange={(e) => updatePhrase(activePhrase.id, { text: e.target.value })}
                placeholder={`Write the phrase in ${state.languageName}…`}
                rows={2}
                className="w-full px-4 py-3 bg-white/40 border border-border/20 rounded-xl font-display text-xl text-navy placeholder:text-stone/25 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none transition-all"
              />
            </div>

            <div>
              <label className="block font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-2">
                Translation / meaning
              </label>
              <input
                type="text"
                value={activePhrase.translation}
                onChange={(e) => updatePhrase(activePhrase.id, { translation: e.target.value })}
                placeholder="English meaning or transliteration…"
                className="w-full px-4 py-3 bg-white/40 border border-border/20 rounded-xl font-body text-base text-navy placeholder:text-stone/25 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
              />
            </div>
          </div>

          {/* Prev / Next phrase navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/20">
            <button
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="font-ui text-xs text-stone/50 hover:text-navy transition-colors disabled:opacity-20"
            >
              ← Previous
            </button>
            <span className="font-mono text-xs text-stone/30">
              {completedCount}/{state.phrases.length} completed
            </span>
            {activeIdx < state.phrases.length - 1 ? (
              <button
                onClick={() => setActiveIdx((i) => i + 1)}
                className="font-ui text-xs text-gold hover:text-navy transition-colors"
              >
                Next prompt →
              </button>
            ) : (
              <button
                onClick={addNewPrompt}
                className="font-ui text-xs text-gold hover:text-navy transition-colors"
              >
                + New prompt
              </button>
            )}
          </div>
        </div>
      )}

      {/* Phrase chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {state.phrases.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 rounded-full font-ui text-xs transition-all duration-200 ${
              i === activeIdx
                ? 'bg-gold/20 text-gold border border-gold/30'
                : p.text.trim()
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'glass text-stone/50 border border-border/20 hover:border-stone/30'
            }`}
          >
            {p.text.trim() ? `"${p.text.slice(0, 18)}${p.text.length > 18 ? '…' : ''}"` : `Prompt ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Requirement bar */}
      {!canProceed && (
        <div className="glass rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gold/60 animate-pulse shrink-0" />
          <p className="font-ui text-xs text-stone/60">
            Complete at least <strong>{MIN_PHRASES} phrases</strong> before recording audio.
            You&apos;ve done {completedCount} so far.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3.5 font-ui text-sm text-stone hover:text-navy glass rounded-xl transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 py-3.5 font-ui text-sm font-medium glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Record audio for each phrase →
        </button>
      </div>
    </div>
  )
}
