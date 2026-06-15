'use client'

/**
 * components/contribution-wizard/StepLanguage.tsx
 *
 * Step 1 — Language Declaration
 * User declares the language they are documenting.
 */

import { useState } from 'react'
import type { WizardState } from './types'

interface Props {
  state:    WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext:   () => void
}

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function StepLanguage({ state, onUpdate, onNext }: Props) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const isValid = state.languageName.trim().length >= 2 && state.region.trim().length >= 2

  async function handleContinue() {
    if (!isValid) return
    setLoading(true)
    setError(null)

    try {
      const res  = await fetch('/api/language/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:       state.languageName.trim(),
          nativeName: state.nativeName.trim(),
          region:     state.region.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create language')

      onUpdate({ languageId: data.languageId, languageCreated: true })
      onNext()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="mb-10">
        <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-3 block">
          Step 1 of 5 — Declaration
        </span>
        <h2 className="font-display text-4xl font-bold text-navy mb-3 leading-tight">
          Name the language<br />you are preserving.
        </h2>
        <p className="font-body text-stone/70 text-base leading-relaxed max-w-md">
          Every preservation begins with a name. Tell us what this language is called —
          both to the world and to the people who speak it.
        </p>
      </div>

      <div className="space-y-6">
        {/* Language name */}
        <div>
          <label htmlFor="lang-name" className="block font-ui text-xs font-medium tracking-wide text-stone/60 mb-2.5 uppercase">
            Language name <span className="text-gold">*</span>
          </label>
          <input
            id="lang-name"
            type="text"
            value={state.languageName}
            onChange={(e) => onUpdate({ languageName: e.target.value })}
            placeholder="e.g. Livonian, Ainu, Yuchi…"
            className="w-full px-5 py-4 glass rounded-xl font-display text-xl text-navy placeholder:text-stone/30 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
            autoFocus
          />
        </div>

        {/* Native name */}
        <div>
          <label htmlFor="native-name" className="block font-ui text-xs font-medium tracking-wide text-stone/60 mb-2.5 uppercase">
            Native name <span className="text-stone/30 font-normal normal-case">(in the language itself)</span>
          </label>
          <input
            id="native-name"
            type="text"
            value={state.nativeName}
            onChange={(e) => onUpdate({ nativeName: e.target.value })}
            placeholder="e.g. Līvõ kēļ, アイヌ・イタㇰ, Tsoyaha…"
            className="w-full px-5 py-4 glass rounded-xl font-body text-lg text-navy placeholder:text-stone/30 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
          />
        </div>

        {/* Region */}
        <div>
          <label htmlFor="region" className="block font-ui text-xs font-medium tracking-wide text-stone/60 mb-2.5 uppercase">
            Region / homeland <span className="text-gold">*</span>
          </label>
          <input
            id="region"
            type="text"
            value={state.region}
            onChange={(e) => onUpdate({ region: e.target.value })}
            placeholder="e.g. Livonia Coast, Latvia · Hokkaido, Japan · Oklahoma, USA…"
            className="w-full px-5 py-4 glass rounded-xl font-body text-base text-navy placeholder:text-stone/30 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
          />
        </div>

        {/* Preview ID */}
        {state.languageName.trim().length > 1 && (
          <div className="glass rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="font-ui text-[10px] text-stone/40 uppercase tracking-widest">Atlas ID</span>
            <code className="font-mono text-sm text-gold">{slugify(state.languageName)}</code>
          </div>
        )}

        {error && (
          <div className="glass rounded-xl px-5 py-3 border border-red-300/30">
            <p className="font-ui text-sm text-red-500">⚠ {error}</p>
          </div>
        )}
      </div>

      <div className="mt-10">
        <button
          onClick={handleContinue}
          disabled={!isValid || loading}
          className="w-full py-4 font-ui text-sm font-medium tracking-wide glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
              </svg>
              Registering in atlas…
            </>
          ) : (
            'Begin phrase collection →'
          )}
        </button>
      </div>
    </div>
  )
}
