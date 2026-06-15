import {
  LANGUAGES,
  GLOBAL_METRICS,
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  formatNumber,
  formatSpeakers,
  type VitalityStatus,
} from '@/lib/data'
import Link from 'next/link'

const statusCounts = LANGUAGES.reduce<Record<string, number>>((acc, l) => {
  acc[l.status] = (acc[l.status] ?? 0) + 1
  return acc
}, {})

const CONTINENT_DATA = [
  { name: 'Americas', languages: 847, critical: 234, safe: 120 },
  { name: 'Africa', languages: 712, critical: 89, safe: 380 },
  { name: 'Asia', languages: 934, critical: 312, safe: 210 },
  { name: 'Europe', languages: 198, critical: 54, safe: 94 },
  { name: 'Oceania', languages: 156, critical: 78, safe: 18 },
]

const MONTHLY_ACTIVITY = [
  { month: 'Jan', contributions: 8400, verified: 6200 },
  { month: 'Feb', contributions: 9200, verified: 7100 },
  { month: 'Mar', contributions: 11800, verified: 8900 },
  { month: 'Apr', contributions: 10200, verified: 8100 },
  { month: 'May', contributions: 14300, verified: 11200 },
  { month: 'Jun', contributions: 16700, verified: 13400 },
]

const maxActivity = Math.max(...MONTHLY_ACTIVITY.map((m) => m.contributions))

export default function InsightsDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      {/* Top row: status distribution + key numbers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Status distribution */}
        <div className="lg:col-span-5 border border-border bg-surface p-8">
          <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
            Language Vitality Distribution
          </h2>
          <div className="space-y-4">
            {(Object.entries(VITALITY_STATUS_LABELS) as [VitalityStatus, string][]).map(([status, label]) => {
              const count = statusCounts[status] ?? 0
              const total = LANGUAGES.length
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const globalEstimate = Math.round((count / total) * 7000)
              const color = VITALITY_STATUS_COLORS[status]
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-ui text-sm text-foreground">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">~{globalEstimate.toLocaleString()}</span>
                      <span className="font-mono text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-6 font-ui text-[10px] text-muted-foreground/50">
            Estimated global figures extrapolated from Oralis sample (n={LANGUAGES.length}) across ~7,000 documented languages
          </p>
        </div>

        {/* Key metrics grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {[
            { label: 'Languages at Critical Risk', value: '3,500+', sub: 'Estimated globally', highlight: true },
            { label: 'New Contributions / Day', value: '~12,400', sub: 'Average last 30 days', highlight: false },
            { label: 'Verified Submissions', value: formatNumber(GLOBAL_METRICS.storiesArchived * 0.78), sub: '78% verification rate', highlight: false },
            { label: 'Languages w/ Audio', value: '1,943', sub: '68% of archive', highlight: false },
            { label: 'AWS Regions Active', value: '12', sub: 'Global distribution', highlight: false },
            { label: 'Unique Speaker Recordings', value: '24,800+', sub: 'Native speakers archived', highlight: true },
          ].map(({ label, value, sub, highlight }) => (
            <div
              key={label}
              className={`border p-6 ${highlight ? 'border-gold/40 bg-gold/5' : 'border-border bg-surface'}`}
            >
              <p className="font-display text-3xl font-bold text-foreground mb-1">{value}</p>
              <p className="font-ui text-xs font-medium text-foreground mb-0.5">{label}</p>
              <p className="font-ui text-[10px] text-muted-foreground/60">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity chart */}
      <div className="border border-border bg-surface p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Contribution Activity — 2025
          </h2>
          <div className="flex items-center gap-4 text-xs font-ui">
            <span className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-earth inline-block" />
              Total contributions
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-forest inline-block" />
              Verified
            </span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {MONTHLY_ACTIVITY.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-32">
                <div
                  className="flex-1 rounded-t-sm bg-earth/20 hover:bg-earth/30 transition-colors"
                  style={{ height: `${(month.contributions / maxActivity) * 100}%` }}
                  title={`${month.contributions.toLocaleString()} contributions`}
                />
                <div
                  className="flex-1 rounded-t-sm bg-forest/60 hover:bg-forest/80 transition-colors"
                  style={{ height: `${(month.verified / maxActivity) * 100}%` }}
                  title={`${month.verified.toLocaleString()} verified`}
                />
              </div>
              <span className="font-ui text-[10px] text-muted-foreground">{month.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Regional breakdown + top languages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Regional */}
        <div className="lg:col-span-6 border border-border bg-surface p-8">
          <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
            By Continent
          </h2>
          <div className="space-y-5">
            {CONTINENT_DATA.map((c) => {
              const critPct = Math.round((c.critical / c.languages) * 100)
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-ui text-sm font-medium text-foreground">{c.name}</span>
                    <div className="flex items-center gap-4 text-xs font-ui text-muted-foreground">
                      <span>{c.languages.toLocaleString()} languages</span>
                      <span className="text-destructive font-medium">{critPct}% at risk</span>
                    </div>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-l-full"
                      style={{ width: `${(c.critical / c.languages) * 100}%`, backgroundColor: 'var(--destructive)' }}
                    />
                    <div
                      className="h-full"
                      style={{ width: `${((c.languages - c.critical - c.safe) / c.languages) * 100}%`, backgroundColor: 'var(--gold)' }}
                    />
                    <div
                      className="h-full rounded-r-full"
                      style={{ width: `${(c.safe / c.languages) * 100}%`, backgroundColor: 'var(--forest)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-[10px] font-ui text-muted-foreground/60">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> Critically endangered</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold" /> Vulnerable</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-forest" /> Safe</span>
          </div>
        </div>

        {/* Most active languages */}
        <div className="lg:col-span-6 border border-border bg-surface p-8">
          <h2 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
            Most Active in Archive
          </h2>
          <div className="space-y-0 divide-y divide-border">
            {LANGUAGES
              .slice()
              .sort((a, b) => b.audioCount - a.audioCount)
              .map((lang, i) => {
                const color = VITALITY_STATUS_COLORS[lang.status]
                return (
                  <div key={lang.id} className="py-3 flex items-center gap-4">
                    <span className="font-mono text-xs text-muted-foreground/40 w-5 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Link href={`/language/${lang.id}`} className="font-display text-sm font-bold text-foreground hover:text-earth transition-colors">
                          {lang.name}
                        </Link>
                        <span className="font-ui text-xs text-muted-foreground">{lang.audioCount.toLocaleString()} recordings</span>
                      </div>
                      <div className="h-0.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(lang.audioCount / Math.max(...LANGUAGES.map(l => l.audioCount))) * 100}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Infrastructure note */}
      <div className="border border-border bg-earth text-primary-foreground p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h3 className="font-display text-xl font-bold mb-2">
              Built for global scale on AWS.
            </h3>
            <p className="font-body text-primary-foreground/60 leading-relaxed">
              The Oralis archive is powered by AWS DynamoDB, distributed across 12 global regions
              with sub-10ms read latency. Every contribution is replicated 3× for permanence.
              The system is designed to support 100M+ contributions from communities worldwide.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-4">
            {[
              { label: 'DynamoDB Tables', value: '47' },
              { label: 'Global Regions', value: '12' },
              { label: 'Read Latency', value: '<10ms' },
            ].map(({ label, value }) => (
              <div key={label} className="border border-primary-foreground/10 p-4 text-center">
                <p className="font-mono text-xl font-bold text-gold mb-1">{value}</p>
                <p className="font-ui text-[10px] text-primary-foreground/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
