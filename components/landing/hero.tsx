'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

// Animated world map dots
const MAP_POINTS = [
  { x: 15, y: 38, label: 'Americas' },
  { x: 25, y: 55, label: 'South America' },
  { x: 48, y: 32, label: 'Europe' },
  { x: 52, y: 48, label: 'Africa' },
  { x: 65, y: 35, label: 'Middle East' },
  { x: 72, y: 30, label: 'Central Asia' },
  { x: 80, y: 38, label: 'East Asia' },
  { x: 85, y: 55, label: 'Southeast Asia' },
  { x: 90, y: 65, label: 'Oceania' },
  { x: 20, y: 42, label: 'North America' },
  { x: 55, y: 25, label: 'Northern Europe' },
  { x: 60, y: 55, label: 'East Africa' },
  { x: 75, y: 48, label: 'South Asia' },
]

const LANGUAGE_FLOATS = [
  { text: 'Gunalchéesh', language: 'Tlingit', x: 12, y: 30, delay: 0 },
  { text: 'Kernewek', language: 'Cornish', x: 42, y: 22, delay: 1.2 },
  { text: 'アイヌ・イタㇰ', language: 'Ainu', x: 78, y: 28, delay: 0.8 },
  { text: "Bats'il k'op", language: 'Tzeltal', x: 18, y: 60, delay: 1.8 },
  { text: 'Lingít', language: 'Tlingit', x: 8, y: 52, delay: 2.4 },
  { text: 'Lívoõ kēļ', language: 'Livonian', x: 52, y: 18, delay: 0.4 },
]

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const dots: { x: number; y: number; r: number; phase: number; speed: number }[] = []
    for (let i = 0; i < 60; i++) {
      dots.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.3 + 0.1,
      })
    }

    const lines: { from: number; to: number }[] = []
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x
        const dy = dots[i].y - dots[j].y
        if (Math.sqrt(dx * dx + dy * dy) < 18) {
          lines.push({ from: i, to: j })
        }
      }
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      t += 0.005

      // Lines
      for (const line of lines) {
        const a = dots[line.from]
        const b = dots[line.to]
        const ax = (a.x / 100) * w
        const ay = (a.y / 100) * h
        const bx = (b.x / 100) * w
        const by = (b.y / 100) * h
        const opacity = (Math.sin(t + a.phase) + 1) / 2 * 0.08 + 0.02
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.strokeStyle = `rgba(200, 169, 107, ${opacity})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Dots
      for (const dot of dots) {
        const x = (dot.x / 100) * w
        const y = (dot.y / 100) * h
        const pulse = (Math.sin(t * dot.speed + dot.phase) + 1) / 2
        const alpha = pulse * 0.5 + 0.1
        ctx.beginPath()
        ctx.arc(x, y, dot.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 169, 107, ${alpha})`
        ctx.fill()
      }

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrame)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-earth">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Texture overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 60%, rgba(140, 90, 60, 0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(74, 52, 40, 0.6) 0%, transparent 50%)`,
        }}
        aria-hidden="true"
      />

      {/* Floating language labels */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {LANGUAGE_FLOATS.map((item, i) => (
          <div
            key={i}
            className="absolute opacity-0"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animation: `fadeInFloat 1s ease forwards`,
              animationDelay: `${item.delay + 0.8}s`,
            }}
          >
            <div className="px-3 py-1.5 border border-gold/20 bg-earth/60 backdrop-blur-sm">
              <p className="font-display text-xs text-gold/80 tracking-wide">{item.text}</p>
              <p className="font-ui text-[10px] text-primary-foreground/40 tracking-widest uppercase">{item.language}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-gold/60" />
            <span className="font-ui text-xs font-medium text-gold/80 tracking-widest uppercase">
              Global Cultural Memory Network
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary-foreground leading-[1.05] tracking-tight text-balance mb-8">
            Every language carries a world of knowledge.
          </h1>

          <p className="font-body text-lg md:text-xl text-primary-foreground/70 leading-relaxed max-w-2xl mb-12">
            Preserve endangered languages, oral traditions, and cultural memory
            for future generations. Join a global network of linguists,
            indigenous communities, and researchers.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contribute"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold text-charcoal font-ui font-medium text-sm tracking-wide hover:bg-gold/90 transition-colors"
              style={{ color: '#1F1F1F' }}
            >
              <span>Start Preserving</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-primary-foreground/20 text-primary-foreground font-ui text-sm tracking-wide hover:border-primary-foreground/40 hover:bg-primary-foreground/5 transition-all"
            >
              Explore Languages
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-2 opacity-40">
          <span className="font-ui text-xs text-primary-foreground tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-primary-foreground/40 animate-pulse" />
        </div>
      </div>

      <style>{`
        @keyframes fadeInFloat {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
