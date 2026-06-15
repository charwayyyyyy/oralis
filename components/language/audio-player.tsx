'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  title: string
  duration: string
  contributor: string
  date: string
}

const WAVEFORM_BARS = 48

function generateBars() {
  return Array.from({ length: WAVEFORM_BARS }, (_, i) => {
    const center = WAVEFORM_BARS / 2
    const dist = Math.abs(i - center) / center
    const base = 0.3 + Math.random() * 0.5
    return Math.max(0.15, base * (1 - dist * 0.4))
  })
}

export default function AudioPlayer({ title, duration, contributor, date }: Props) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [bars] = useState(() => generateBars())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setPlaying(false)
            return 0
          }
          return p + 0.5
        })
      }, 80)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing])

  const togglePlay = () => setPlaying((p) => !p)
  const progressBarIndex = Math.floor((progress / 100) * WAVEFORM_BARS)

  return (
    <div className="border border-border bg-surface p-5 hover:border-gold/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="font-display text-sm font-bold text-foreground mb-0.5">{title}</h4>
          <div className="flex items-center gap-3 font-ui text-xs text-muted-foreground">
            <span>{contributor}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{date}</span>
          </div>
        </div>
        <span className="font-mono text-xs text-muted-foreground shrink-0">{duration}</span>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="w-8 h-8 rounded-full bg-earth flex items-center justify-center shrink-0 hover:bg-clay transition-colors"
        >
          {playing ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <rect x="1.5" y="1" width="2.5" height="8" rx="0.5" fill="white" />
              <rect x="6" y="1" width="2.5" height="8" rx="0.5" fill="white" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 1.5l7 3.5-7 3.5V1.5z" fill="white" />
            </svg>
          )}
        </button>

        <div className="flex-1 flex items-end gap-px h-8" aria-hidden="true">
          {bars.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-75"
              style={{
                height: `${height * 100}%`,
                backgroundColor:
                  i < progressBarIndex
                    ? 'var(--gold)'
                    : playing && Math.abs(i - progressBarIndex) < 3
                    ? 'var(--clay)'
                    : 'var(--border)',
                transform: playing && Math.abs(i - progressBarIndex) < 2 ? `scaleY(${1 + Math.random() * 0.3})` : 'scaleY(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress track */}
      <div
        className="h-px bg-border rounded-full overflow-hidden cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width * 100
          setProgress(Math.max(0, Math.min(100, pct)))
        }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: 'var(--gold)' }}
        />
      </div>
    </div>
  )
}
