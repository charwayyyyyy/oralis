'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw, AlertCircle } from 'lucide-react'

interface Props {
  src?: string
  title?: string
  onRefreshUrl?: () => Promise<void>
}

// Global reference to ensure only ONE audio plays at a time
let globalCurrentAudio: HTMLAudioElement | null = null

export default function AdminAudioPlayer({ src, title = 'Audio Recording', onRefreshUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      setHasError(false)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
      setIsPlaying(false)
    }

    const handleWaiting = () => setIsLoading(true)
    const handlePlaying = () => {
      setIsLoading(false)
      setIsPlaying(true)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
    }
  }, [src])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !src) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      // Pause any other currently playing audio
      if (globalCurrentAudio && globalCurrentAudio !== audio) {
        globalCurrentAudio.pause()
      }
      globalCurrentAudio = audio
      audio.play().catch(() => setHasError(true))
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const mins = Math.floor(secs / 60)
    const rem = Math.floor(secs % 60)
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`
  }

  if (!src) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-400 italic py-2">
        <span>No audio recording attached</span>
      </div>
    )
  }

  return (
    <div className="bg-sand/60 border border-stone/20 rounded-xl p-3 max-w-md w-full shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {hasError ? (
        <div className="flex items-center justify-between gap-3 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Audio stream expired or format unsupported</span>
          </div>
          {onRefreshUrl && (
            <button
              onClick={() => onRefreshUrl()}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-medium text-[11px] transition-colors shrink-0"
            >
              Refresh Link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-9 h-9 rounded-full bg-navy text-ivory flex items-center justify-center hover:bg-navy/80 transition-transform active:scale-95 shrink-0 shadow focus-ring"
              aria-label={isPlaying ? `Pause audio for ${title}` : `Play audio for ${title}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Seek Bar */}
            <div className="flex-1 flex flex-col gap-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-stone/20 rounded-lg appearance-none cursor-pointer accent-gold focus-ring"
                aria-label={`Seek audio position for ${title}`}
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-stone/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={toggleMute}
                className="p-1 text-stone hover:text-navy rounded focus-ring"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
