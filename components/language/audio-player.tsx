'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Props {
  title: string
  duration?: string
  contributor: string
  date: string
  audioUrl?: string
}

const WAVEFORM_BARS = 48

// Deterministic bar heights to avoid server/client hydration mismatch
const DETERMINISTIC_BARS = [
  0.35, 0.45, 0.6, 0.8, 0.95, 0.7, 0.5, 0.65, 0.85, 1.0, 0.9, 0.75,
  0.6, 0.4, 0.55, 0.7, 0.85, 0.9, 0.75, 0.6, 0.45, 0.35, 0.5, 0.7,
  0.9, 0.85, 0.65, 0.5, 0.6, 0.8, 0.95, 0.7, 0.55, 0.4, 0.5, 0.75,
  0.9, 0.85, 0.7, 0.55, 0.45, 0.35, 0.4, 0.55, 0.7, 0.6, 0.45, 0.3,
]

export default function AudioPlayer({ title, duration = '0:30', contributor, date, audioUrl }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animRef = useRef<number | null>(null)

  // Initialize HTML5 audio if audioUrl is available
  useEffect(() => {
    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    const onLoadedMetadata = () => {
      setTotalDuration(audio.duration || 0)
      setLoading(false)
    }

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const onEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
    }

    const onError = () => {
      setError('Playback failed. Audio format or link expired.')
      setPlaying(false)
      setLoading(false)
    }

    const onWaiting = () => setLoading(true)
    const onCanPlay = () => setLoading(false)

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('canplay', onCanPlay)
      audio.src = ''
    }
  }, [audioUrl])

  // Simulation mode if no real audioUrl is passed
  useEffect(() => {
    if (audioUrl) return

    let interval: NodeJS.Timeout | null = null
    if (playing) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 30) {
            setPlaying(false)
            return 0
          }
          return prev + 0.5
        })
      }, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [playing, audioUrl])

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause()
        setPlaying(false)
      } else {
        audioRef.current.play()
          .then(() => {
            setPlaying(true)
            setError(null)
          })
          .catch((e) => {
            console.warn('Playback error:', e)
            setError('Could not start playback')
            setPlaying(false)
          })
      }
    } else {
      setPlaying((p) => !p)
    }
  }, [playing])

  const effectiveDuration = audioUrl && totalDuration > 0 ? totalDuration : 30
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))
  const progressBarIndex = Math.floor((progressPercent / 100) * WAVEFORM_BARS)

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const targetTime = pct * effectiveDuration
    setCurrentTime(targetTime)
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime
    }
  }

  const handleTouchScrub = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (!touch) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
    const targetTime = pct * effectiveDuration
    setCurrentTime(targetTime)
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime
    }
  }

  return (
    <div className="glass-heavy rounded-xl p-5 hover:shadow-lg transition-all duration-300 group border border-border/30">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="font-display text-sm font-bold text-navy mb-0.5 group-hover:text-gold transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-3 font-ui text-xs text-stone/60">
            <span>{contributor}</span>
            <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
            <span>{date}</span>
          </div>
        </div>
        <span className="font-mono text-xs text-stone/50 shrink-0">
          {formatTime(currentTime)} / {audioUrl && totalDuration > 0 ? formatTime(totalDuration) : duration}
        </span>
      </div>

      {/* Waveform with ambient glow when playing */}
      <div className="relative">
        {playing && (
          <div
            className="absolute inset-0 -m-2 rounded-xl pointer-events-none transition-opacity duration-500"
            style={{
              background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(200,169,107,0.08) 0%, transparent 70%)',
              opacity: 0.9,
            }}
            aria-hidden="true"
          />
        )}

        <div className="flex items-center gap-3 mb-3 relative">
          <button
            onClick={togglePlay}
            aria-label={playing ? `Pause ${title}` : `Play ${title}`}
            className="w-11 h-11 min-w-[44px] min-h-[44px] glass-navy rounded-xl flex items-center justify-center shrink-0 hover:bg-navy transition-all focus-ring text-ivory shadow-sm"
          >
            {loading ? (
              <svg className="animate-spin text-gold" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
              </svg>
            ) : playing ? (
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <rect x="1.5" y="1" width="2.5" height="8" rx="0.5" fill="currentColor" />
                <rect x="6" y="1" width="2.5" height="8" rx="0.5" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="ml-0.5">
                <path d="M2 1.5l7 3.5-7 3.5V1.5z" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Interactive waveform visualizer */}
          <div
            className="flex-1 flex items-end gap-1 h-10 cursor-pointer py-1 touch-none"
            onClick={handleScrub}
            onTouchStart={handleTouchScrub}
            onTouchMove={handleTouchScrub}
            aria-hidden="true"
          >
            {DETERMINISTIC_BARS.map((height, i) => {
              const isPast = i < progressBarIndex
              const isNear = playing && Math.abs(i - progressBarIndex) < 2
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-150"
                  style={{
                    height: `${Math.max(15, height * 100)}%`,
                    backgroundColor: isPast
                      ? '#C8A96B'
                      : isNear
                      ? 'rgba(200,169,107,0.6)'
                      : 'rgba(221,216,206,0.45)',
                    boxShadow: isPast ? '0 0 4px rgba(200,169,107,0.3)' : 'none',
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Progress track */}
      <div
        className="h-1.5 bg-border/30 rounded-full overflow-hidden cursor-pointer touch-target-min flex items-center touch-none"
        onClick={handleScrub}
        onTouchStart={handleTouchScrub}
        onTouchMove={handleTouchScrub}
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Playback progress for ${title}`}
      >
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, rgba(200,169,107,0.7), #C8A96B)',
            boxShadow: '0 0 8px rgba(200,169,107,0.4)',
          }}
        />
      </div>

      {error && (
        <p className="font-ui text-xs text-red-500 mt-2">⚠ {error}</p>
      )}
    </div>
  )
}
