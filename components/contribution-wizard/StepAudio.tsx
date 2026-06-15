'use client'

/**
 * components/contribution-wizard/StepAudio.tsx
 *
 * Step 3 — Audio Recording
 * For each phrase: record via MediaRecorder API or upload a file.
 * Shows one phrase at a time (focus mode).
 * Uploads audio to /api/upload-audio on completion.
 */

import { useState, useRef, useCallback } from 'react'
import type { WizardState, PhraseEntry } from './types'

interface Props {
  state:    WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext:   () => void
  onBack:   () => void
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'uploading' | 'done' | 'error'

function AudioRecorder({
  phrase,
  languageId,
  phraseIndex,
  onUploaded,
}: {
  phrase:      PhraseEntry
  languageId:  string
  phraseIndex: number
  onUploaded:  (patch: Partial<PhraseEntry>) => void
}) {
  const [recState,   setRecState]   = useState<RecordingState>(phrase.uploaded ? 'done' : 'idle')
  const [audioBlob,  setAudioBlob]  = useState<Blob | null>(phrase.audioBlob)
  const [audioUrl,   setLocalUrl]   = useState<string | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [duration,   setDuration]   = useState(0)

  const mediaRef    = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<BlobEvent['data'][]>([])
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Start recording ─────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr     = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url  = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setLocalUrl(url)
        setRecState('recorded')
        stream.getTracks().forEach((t) => t.stop())
      }

      mr.start()
      mediaRef.current = mr
      setRecState('recording')
      setDuration(0)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    } catch (e) {
      setError('Microphone access denied. Please allow microphone permission and try again.')
      setRecState('idle')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  // ── Upload blob to S3 via /api/upload-audio ──────────────────────────────
  const uploadAudio = useCallback(async (blob: Blob) => {
    setRecState('uploading')
    setError(null)
    try {
      const form = new FormData()
      form.append('audio',       blob, `recording-${phraseIndex}.webm`)
      form.append('languageId',  languageId)
      form.append('phraseIndex', String(phraseIndex))

      const res  = await fetch('/api/upload-audio', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')

      onUploaded({ audioBlob: blob, audioUrl: data.audioUrl, s3Key: data.s3Key, uploaded: true })
      setRecState('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
      setRecState('error')
    }
  }, [languageId, phraseIndex, onUploaded])

  // ── Handle file upload ───────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAudioBlob(file)
    setLocalUrl(url)
    setRecState('recorded')
  }, [])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="glass rounded-2xl p-7">
      {/* Phrase display */}
      <div className="mb-6">
        <p className="font-ui text-[10px] uppercase tracking-widest text-stone/40 mb-1.5">Prompt</p>
        <p className="font-body text-sm text-stone/70 italic mb-3">{phrase.prompt}</p>
        {phrase.text && (
          <p className="font-display text-2xl font-bold text-navy">{phrase.text}</p>
        )}
        {phrase.translation && (
          <p className="font-body text-sm text-stone/50 mt-1">&ldquo;{phrase.translation}&rdquo;</p>
        )}
      </div>

      {/* Recording interface */}
      {recState === 'idle' && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-400/30 hover:bg-red-500/20 hover:border-red-400/60 transition-all flex items-center justify-center group"
            aria-label="Start recording"
          >
            <div className="w-7 h-7 rounded-full bg-red-500 group-hover:scale-110 transition-transform" />
          </button>
          <p className="font-ui text-xs text-stone/50">Tap to record</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-ui text-xs text-gold hover:text-navy transition-colors underline underline-offset-2"
          >
            or upload audio file
          </button>
          <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {recState === 'recording' && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/60 hover:bg-red-500/30 transition-all flex items-center justify-center animate-pulse"
            aria-label="Stop recording"
          >
            <div className="w-6 h-6 rounded bg-red-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-sm text-red-500 font-bold">{fmt(duration)}</span>
            <span className="font-ui text-xs text-stone/50">recording</span>
          </div>
          <p className="font-ui text-xs text-stone/40">Tap the square to stop</p>
        </div>
      )}

      {recState === 'recorded' && audioBlob && (
        <div className="space-y-4">
          <div className="glass-gold rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1v14M1 8h14" stroke="#C8A96B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-ui text-xs text-stone/60">Preview recording</span>
            </div>
            {audioUrl && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <audio controls src={audioUrl} className="w-full h-9 rounded-lg" />
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setRecState('idle'); setAudioBlob(null); setLocalUrl(null) }}
              className="flex-1 py-3 font-ui text-sm glass rounded-xl text-stone hover:text-navy transition-all"
            >
              Re-record
            </button>
            <button
              onClick={() => uploadAudio(audioBlob)}
              className="flex-1 py-3 font-ui text-sm font-medium bg-gold/90 text-ink rounded-xl hover:bg-gold transition-all"
            >
              Upload →
            </button>
          </div>
        </div>
      )}

      {recState === 'uploading' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <svg className="animate-spin text-gold" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
          </svg>
          <p className="font-ui text-sm text-stone/60">Uploading to S3…</p>
        </div>
      )}

      {recState === 'done' && (
        <div className="flex items-center gap-3 py-3 glass-gold rounded-xl px-5">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10l4 4 8-8" stroke="#C8A96B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-ui text-sm text-gold">Audio saved to archive</span>
        </div>
      )}

      {recState === 'error' && (
        <div className="space-y-3">
          <p className="font-ui text-xs text-red-500">⚠ {error}</p>
          <button onClick={() => setRecState('idle')} className="font-ui text-xs text-gold hover:underline">
            Try again
          </button>
        </div>
      )}

      {error && recState !== 'error' && (
        <p className="mt-3 font-ui text-xs text-red-500">⚠ {error}</p>
      )}
    </div>
  )
}

// ─── Main Step ───────────────────────────────────────────────────────────────

export default function StepAudio({ state, onUpdate, onNext, onBack }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  const phrasesWithText = state.phrases.filter((p) => p.text.trim().length > 0)
  const uploadedCount   = phrasesWithText.filter((p) => p.uploaded).length

  function updatePhrase(id: string, patch: Partial<PhraseEntry>) {
    onUpdate({
      phrases: state.phrases.map((p) => p.id === id ? { ...p, ...patch } : p),
    })
  }

  const canProceed = uploadedCount >= Math.min(3, phrasesWithText.length)

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="mb-8">
        <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-3 block">
          Step 3 of 5 — Audio Capture
        </span>
        <h2 className="font-display text-4xl font-bold text-navy mb-3 leading-tight">
          Let the voice carry it.
        </h2>
        <p className="font-body text-stone/70 text-base max-w-md">
          Record or upload audio for each phrase. Audio is the most irreplaceable form
          of cultural preservation — a voice outlives any text.
        </p>
      </div>

      {/* Phrase tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {phrasesWithText.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIdx(i)}
            className={`px-3.5 py-2 rounded-xl font-ui text-xs transition-all ${
              i === activeIdx
                ? 'glass-navy-heavy text-ivory'
                : p.uploaded
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'glass text-stone hover:text-navy'
            }`}
          >
            {p.uploaded ? '✓ ' : ''}{p.text.slice(0, 16)}{p.text.length > 16 ? '…' : ''}
          </button>
        ))}
      </div>

      {/* Active recorder */}
      {phrasesWithText[activeIdx] && (
        <AudioRecorder
          key={phrasesWithText[activeIdx].id}
          phrase={phrasesWithText[activeIdx]}
          languageId={state.languageId}
          phraseIndex={activeIdx}
          onUploaded={(patch) => updatePhrase(phrasesWithText[activeIdx].id, patch)}
        />
      )}

      {/* Progress */}
      <div className="mt-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-ui text-xs text-stone/50">
            {uploadedCount} of {phrasesWithText.length} recordings uploaded
          </span>
          <span className="font-ui text-xs text-stone/40">
            {Math.min(3, phrasesWithText.length)} required
          </span>
        </div>
        <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${(uploadedCount / Math.max(phrasesWithText.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3.5 font-ui text-sm text-stone hover:text-navy glass rounded-xl transition-all">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 py-3.5 font-ui text-sm font-medium glass-navy-heavy text-ivory rounded-xl hover:bg-navy transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Enrich with context →
        </button>
      </div>
    </div>
  )
}
