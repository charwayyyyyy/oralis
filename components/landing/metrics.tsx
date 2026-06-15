'use client'

import { useEffect, useRef, useState } from 'react'
import { GLOBAL_METRICS, formatNumber } from '@/lib/data'

function useCountUp(target: number, duration = 2000, started = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!started) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, started])
  return value
}

const metrics = [
  { key: 'languagesPreserved', label: 'Languages Preserved', value: GLOBAL_METRICS.languagesPreserved, suffix: '' },
  { key: 'audioContributions', label: 'Audio Contributions', value: GLOBAL_METRICS.audioContributions, suffix: '' },
  { key: 'storiesArchived', label: 'Stories Archived', value: GLOBAL_METRICS.storiesArchived, suffix: '' },
  { key: 'activeContributors', label: 'Active Contributors', value: GLOBAL_METRICS.activeContributors, suffix: '' },
  { key: 'countriesRepresented', label: 'Countries', value: GLOBAL_METRICS.countriesRepresented, suffix: '' },
  { key: 'hoursRecorded', label: 'Hours Recorded', value: GLOBAL_METRICS.hoursRecorded, suffix: '' },
]

function MetricItem({ label, value, index, started }: { label: string; value: number; index: number; started: boolean }) {
  const count = useCountUp(value, 2200 + index * 100, started)
  return (
    <div className="py-8 lg:py-0 border-b lg:border-b-0 lg:border-r border-border last:border-0">
      <div className="px-6 lg:px-8">
        <p className="font-display text-4xl lg:text-5xl font-bold text-earth mb-2 tabular-nums">
          {formatNumber(count)}
        </p>
        <p className="font-ui text-sm text-muted-foreground tracking-wide">{label}</p>
      </div>
    </div>
  )
}

export default function Metrics() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-surface border-y border-border py-0 lg:py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:grid lg:grid-cols-6 divide-y lg:divide-y-0">
          {metrics.map((m, i) => (
            <MetricItem key={m.key} label={m.label} value={m.value} index={i} started={started} />
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="font-ui text-xs text-muted-foreground tracking-wide">
            Updated in real-time across distributed AWS DynamoDB clusters in 12 regions
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span className="font-ui text-xs text-forest font-medium">Live</span>
          </div>
        </div>
      </div>
    </section>
  )
}
