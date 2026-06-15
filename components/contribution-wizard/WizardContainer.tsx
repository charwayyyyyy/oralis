'use client'

/**
 * components/contribution-wizard/WizardContainer.tsx
 *
 * Orchestrates the 5-step language documentation experience.
 * Manages all wizard state and step transitions.
 * Renders the sidebar step indicator and active step content.
 */

import { useState, useCallback } from 'react'
import StepLanguage from './StepLanguage'
import StepPrompts  from './StepPrompts'
import StepAudio    from './StepAudio'
import StepContext  from './StepContext'
import StepReview   from './StepReview'
import { WIZARD_STEPS, getRandomPrompts, createEmptyPhrase } from './types'
import type { WizardState, WizardStep } from './types'

function createInitialState(): WizardState {
  return {
    languageName:    '',
    nativeName:      '',
    region:          '',
    languageId:      '',
    languageCreated: false,
    phrases:         [],
    activePromptIndex: 0,
    submitting:      false,
    submitted:       false,
    submitError:     null,
  }
}

interface Props {
  onClose: () => void
}

export default function WizardContainer({ onClose }: Props) {
  const [step,  setStep]  = useState<WizardStep>(1)
  const [state, setState] = useState<WizardState>(createInitialState)

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const next = useCallback(() => {
    setStep((s) => Math.min(5, s + 1) as WizardStep)
  }, [])

  const back = useCallback(() => {
    setStep((s) => Math.max(1, s - 1) as WizardStep)
  }, [])

  const progress = ((step - 1) / (WIZARD_STEPS.length - 1)) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-stretch overflow-hidden" style={{ fontFamily: 'inherit' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-abyss/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 ml-auto w-full max-w-2xl h-full flex flex-col bg-background shadow-2xl overflow-hidden">

        {/* Top progress bar */}
        <div className="h-0.5 bg-border/20">
          <div
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/20">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-stone/40 mb-0.5">
              Cultural Documentation Ritual
            </p>
            <h1 className="font-display text-base font-bold text-navy">
              {state.languageName || 'New Language'} · Step {step} of 5
            </h1>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-stone/50 hover:text-navy hover:shadow-sm transition-all"
            aria-label="Close wizard"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-8 py-4 border-b border-border/10 flex items-center gap-0">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-ui text-xs font-medium transition-all duration-300 ${
                  s.number < step  ? 'bg-gold/20 text-gold'
                  : s.number === step ? 'bg-gold text-ink shadow-sm shadow-gold/30'
                  : 'glass text-stone/30'
                }`}>
                  {s.number < step ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span className={`font-ui text-[9px] uppercase tracking-wide ${
                  s.number === step ? 'text-gold' : s.number < step ? 'text-gold/50' : 'text-stone/30'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 transition-all duration-300 ${
                  s.number < step ? 'bg-gold/30' : 'bg-border/20'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content — scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {step === 1 && (
            <StepLanguage state={state} onUpdate={update} onNext={next} />
          )}
          {step === 2 && (
            <StepPrompts state={state} onUpdate={update} onNext={next} onBack={back} />
          )}
          {step === 3 && (
            <StepAudio state={state} onUpdate={update} onNext={next} onBack={back} />
          )}
          {step === 4 && (
            <StepContext state={state} onUpdate={update} onNext={next} onBack={back} />
          )}
          {step === 5 && (
            <StepReview state={state} onUpdate={update} onBack={back} />
          )}
        </div>

        {/* Autosave indicator */}
        <div className="px-8 py-3 border-t border-border/10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-ui text-[10px] text-stone/30">
            Progress saved locally · {state.phrases.filter((p) => p.text).length} phrases collected
          </span>
        </div>
      </div>
    </div>
  )
}
