'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PulseMessage {
  contributor: string
  action: string
  language: string
  title: string
  date: string
}

export default function LivePulse() {
  const [messages, setMessages] = useState<PulseMessage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch('/api/feed?limit=10', { cache: 'no-store' })
        const data = await res.json()
        if (data.success && data.items.length > 0) {
          const formatted = data.items.map((c: any) => ({
            contributor: c.contributorId || 'Anonymous Guardian',
            action: c.type === 'audio' ? 'preserved a recording of' : c.type === 'story' ? 'archived an oral tradition in' : c.type === 'vocabulary' ? 'documented vocabulary in' : 'added cultural context for',
            language: c.languageName,
            title: c.text || c.title || 'New Contribution',
            date: new Date(c.createdAt).toLocaleDateString(),
          }))
          setMessages(formatted)
        }
      } catch (e) {
        console.error('Failed to fetch pulse feed', e)
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [])

  useEffect(() => {
    if (messages.length === 0) return

    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % messages.length)
        setIsVisible(true)
      }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [messages.length])

  if (loading) return null // Or a subtle skeleton if preferred

  const current = messages.length > 0 ? messages[currentIndex] : null

  return (
    <section className="bg-ivory border-t border-border" aria-label="Live cultural preservation activity">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section label */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="w-8 h-px bg-gold/40" />
            <span className="font-ui text-[11px] text-stone/60 tracking-[0.25em] uppercase">From the atlas — live</span>
            <div className="w-8 h-px bg-gold/40" />
          </div>

          {/* Animated pulse message */}
          {current ? (
            <div className="min-h-[120px] flex items-center justify-center mb-12">
              <div
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}
              >
                <p className="font-body text-stone text-lg lg:text-xl leading-relaxed mb-3">
                  <span className="font-display font-bold text-navy">{current.contributor}</span>
                  {' '}{current.action}{' '}
                  <span className="font-display font-bold text-gold">{current.language}</span>
                </p>
                <p className="font-display text-base italic text-navy/60">
                  &ldquo;{current.title}&rdquo;
                </p>
                <p className="font-ui text-xs text-stone/40 mt-2">{current.date}</p>
              </div>
            </div>
          ) : (
             <div className="min-h-[120px] flex items-center justify-center mb-12">
                <p className="font-body text-stone text-lg lg:text-xl leading-relaxed mb-3 text-center">
                  <span className="font-display italic text-navy/60">No live contributions at this moment.</span><br/>
                  <span className="font-ui text-sm text-stone/60 mt-2 block">Be the first guardian to add an entry today.</span>
                </p>
             </div>
          )}

          {/* Activity pulse indicator — glassmorphism */}
          <div className="inline-flex items-center gap-4 glass rounded-full px-6 py-3">
            <span className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="absolute w-2 h-2 rounded-full bg-gold/40 animate-ping" />
            </span>
            <span className="font-ui text-sm text-navy/70">
              <span className="font-display font-bold text-navy">Live</span> guardians preserving cultures right now
            </span>
          </div>

          {/* CTA */}
          <div className="mt-10">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-3 font-ui text-sm text-stone hover:text-navy transition-colors group"
            >
              <span className="w-6 h-px bg-gold/40 group-hover:w-8 transition-all" />
              Join the preservation
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                className="group-hover:translate-x-0.5 transition-transform">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
