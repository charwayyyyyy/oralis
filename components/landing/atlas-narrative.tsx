'use client'

import { useEffect, useRef, useState } from 'react'

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.25) {
  const [isInView, setIsInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true) },
      { threshold }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, threshold])
  return isInView
}

function NarrativeBlock({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 1s ease ${delay}ms, transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const pillars = [
  {
    number: '01',
    title: 'Preserve',
    body: 'Archive audio recordings, oral histories, and cultural stories directly from native speakers and elders — before silence becomes permanent.',
  },
  {
    number: '02',
    title: 'Understand',
    body: 'Every language encodes a unique cosmology — ways of perceiving time, nature, kinship, and the cosmos that exist nowhere else. We make this knowledge navigable.',
  },
  {
    number: '03',
    title: 'Revitalize',
    body: 'Communities access their own linguistic heritage to build revitalization programs, school curricula, and intergenerational bridges.',
  },
  {
    number: '04',
    title: 'Connect',
    body: 'Link indigenous communities, academic linguists, and international organizations in a shared act of cultural stewardship.',
  },
]

export default function AtlasNarrative() {
  return (
    <section className="bg-ivory" aria-label="The crisis and our mission">
      {/* ─── The Crisis ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-28 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Left — narrative pull */}
          <div className="lg:col-span-5">
            <NarrativeBlock>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-px bg-gold" />
                <span className="font-ui text-xs text-stone tracking-[0.2em] uppercase">The silent crisis</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-navy leading-tight text-balance mb-8">
                When a language disappears, an entire world goes silent.
              </h2>
              <p className="font-body text-stone leading-relaxed text-base lg:text-lg">
                Languages are not merely means of communication — they are vessels of cosmologies,
                ecological knowledge, legal systems, and ways of being human that exist nowhere else on Earth.
                Their loss is irreversible.
              </p>
            </NarrativeBlock>
          </div>

          {/* Right — editorial figures in glassmorphism cards */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              {[
                { figure: '43%',    caption: "of the world's languages are endangered" },
                { figure: '1',      caption: 'language lost every 40 days on average' },
                { figure: '7,000+', caption: 'living languages spoken on Earth today' },
                { figure: '3,500',  caption: 'at risk of disappearing this century' },
              ].map(({ figure, caption }, i) => (
                <NarrativeBlock key={caption} delay={i * 120}>
                  <div className="glass-heavy rounded-xl p-8 lg:p-10 hover:shadow-lg transition-shadow duration-500">
                    <p className="font-display text-4xl lg:text-5xl font-bold text-navy mb-4 leading-none">
                      {figure}
                    </p>
                    <p className="font-body text-stone text-sm lg:text-base leading-snug">
                      {caption}
                    </p>
                  </div>
                </NarrativeBlock>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── The Manifesto ─────────────────────────── */}
      <div className="bg-navy text-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-28 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            {/* Left — manifesto */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <NarrativeBlock>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-px bg-gold/40" />
                  <span className="font-ui text-xs text-ivory/25 tracking-[0.2em] uppercase">Our covenant</span>
                </div>
                <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight text-balance mb-8">
                  Language loss is the silent extinction crisis of our era.
                </h2>
                <p className="font-body text-ivory/45 leading-relaxed text-base lg:text-lg mb-12">
                  Of the ~7,000 languages spoken today, linguists estimate that half will
                  be silent by the end of this century. Each lost language takes with it
                  a unique system of knowledge — botanical classifications, navigation
                  techniques, ecological wisdom, philosophical traditions.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-ivory/8">
                  <NarrativeBlock delay={200}>
                    <div className="glass-navy rounded-xl p-5">
                      <p className="font-display text-2xl font-bold text-gold mb-1">3,500+</p>
                      <p className="font-ui text-xs text-ivory/30 leading-snug">Languages at risk of extinction</p>
                    </div>
                  </NarrativeBlock>
                  <NarrativeBlock delay={350}>
                    <div className="glass-navy rounded-xl p-5">
                      <p className="font-display text-2xl font-bold text-gold mb-1">40 days</p>
                      <p className="font-ui text-xs text-ivory/30 leading-snug">Average between last-speaker silences</p>
                    </div>
                  </NarrativeBlock>
                </div>
              </NarrativeBlock>
            </div>

            {/* Right — four pillars */}
            <div className="lg:col-span-7">
              {pillars.map((pillar, i) => (
                <NarrativeBlock key={pillar.number} delay={i * 100}>
                  <div
                    className={`flex gap-8 py-10 ${i < pillars.length - 1 ? 'border-b border-ivory/6' : ''}`}
                  >
                    <span className="font-mono text-xs text-gold/20 shrink-0 w-7 pt-1">{pillar.number}</span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-ivory mb-3">{pillar.title}</h3>
                      <p className="font-body text-ivory/45 leading-relaxed">{pillar.body}</p>
                    </div>
                  </div>
                </NarrativeBlock>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
