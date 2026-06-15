import {
  LANGUAGES,
  VITALITY_STATUS_LABELS,
  VITALITY_STATUS_COLORS,
  formatNumber,
  type VitalityStatus,
} from '@/lib/data'
import Link from 'next/link'

const statusCounts = LANGUAGES.reduce<Record<string, number>>((acc, l) => {
  acc[l.status] = (acc[l.status] ?? 0) + 1
  return acc
}, {})

const CONTINENT_DATA = [
  { name: 'Americas',  languages: 847,  critical: 234, safe: 120 },
  { name: 'Africa',    languages: 712,  critical: 89,  safe: 380 },
  { name: 'Asia',      languages: 934,  critical: 312, safe: 210 },
  { name: 'Europe',    languages: 198,  critical: 54,  safe: 94  },
  { name: 'Oceania',   languages: 156,  critical: 78,  safe: 18  },
]

const MONTHLY_ACTIVITY = [
  { month: 'Jan', contributions: 8400,  verified: 6200  },
  { month: 'Feb', contributions: 9200,  verified: 7100  },
  { month: 'Mar', contributions: 11800, verified: 8900  },
  { month: 'Apr', contributions: 10200, verified: 8100  },
  { month: 'May', contributions: 14300, verified: 11200 },
  { month: 'Jun', contributions: 16700, verified: 13400 },
]

const maxActivity = Math.max(...MONTHLY_ACTIVITY.map((m) => m.contributions))

export default function InsightsDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">

      {/* Vitality distribution + key numbers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-border mb-px">

        {/* Status distribution */}
        <div className="lg:col-span-5 bg-surface p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-5 h-px bg-gold" aria-hidden="true" />
            <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Vitality Distribution</h2>
          </div>
          <div className="space-y-5">
            {(Object.entries(VITALITY_STATUS_LABELS) as [VitalityStatus, string][]).map(([status, label]) => {
              const count = statusCounts[status] ?? 0
              const total = LANGUAGES.length
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const globalEstimate = Math.round((count / total) * 7000)
              const color = VITALITY_STATUS_COLORS[status]
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                      <span className="font-ui text-sm text-navy">{label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-stone">~{globalEstimate.toLocaleString()}</span>
                      <span className="font-mono text-xs text-stone/50 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-px bg-border relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-8 font-ui text-[10px] text-stone/40 leading-relaxed">
            Global figures extrapolated from Oralis sample (n={LANGUAGES.length}) across ~7,000 documented languages.
          </p>
        </div>

        {/* Key metrics grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-px bg-border">
          {[
            { label: 'Languages at Critical Risk',   value: '3,500+',                                       note: 'Estimated globally',         highlight: true  },
            { label: 'New Contributions / Day',       value: '~12,400',                                      note: 'Average last 30 days',       highlight: false },
            { label: 'Verified Submissions',          value: formatNumber(Math.round(186200 * 0.78)),        note: '78% verification rate',      highlight: false },
            { label: 'Languages with Audio',          value: '1,943',                                        note: '68% of archive',             highlight: false },
            { label: 'Active Archive Regions',        value: '12',                                           note: 'Global AWS distribution',    highlight: false },
            { label: 'Speaker Recordings',            value: '24,800+',                                      note: 'Native voices preserved',    highlight: true  },
          ].map(({ label, value, note, highlight }) => (
            <div
              key={label}
              className={`p-7 lg:p-8 ${highlight ? 'bg-navy' : 'bg-surface'}`}
            >
              <p className={`font-display text-3xl lg:text-4xl font-bold mb-2 leading-none ${highlight ? 'text-gold' : 'text-navy'}`}>
                {value}
              </p>
              <p className={`font-ui text-xs font-medium mb-1 ${highlight ? 'text-ivory/70' : 'text-navy'}`}>{label}</p>
              <p className={`font-ui text-[10px] ${highlight ? 'text-ivory/30' : 'text-stone/50'}`}>{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity chart */}
      <div className="bg-surface border border-border p-8 lg:p-10 mt-px mb-px">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-5 h-px bg-gold" aria-hidden="true" />
            <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Contribution Activity — 2025</h2>
          </div>
          <div className="hidden sm:flex items-center gap-5 font-ui text-[11px] text-stone">
            <span className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-gold inline-block" />
              Total
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-navy inline-block" />
              Verified
            </span>
          </div>
        </div>
        <div className="flex items-end gap-4 h-44">
          {MONTHLY_ACTIVITY.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end gap-0.5 h-36">
                <div
                  className="flex-1 bg-gold/25 hover:bg-gold/40 transition-colors"
                  style={{ height: `${(month.contributions / maxActivity) * 100}%` }}
                  title={`${month.contributions.toLocaleString()} contributions`}
                />
                <div
                  className="flex-1 bg-navy/40 hover:bg-navy/60 transition-colors"
                  style={{ height: `${(month.verified / maxActivity) * 100}%` }}
                  title={`${month.verified.toLocaleString()} verified`}
                />
              </div>
              <span className="font-ui text-[10px] text-stone/50">{month.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Regional + most active */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-border mt-px mb-12">

        {/* Regional */}
        <div className="lg:col-span-6 bg-surface p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-5 h-px bg-gold" aria-hidden="true" />
            <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">By Continent</h2>
          </div>
          <div className="space-y-6">
            {CONTINENT_DATA.map((c) => {
              const critPct = Math.round((c.critical / c.languages) * 100)
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-ui text-sm font-medium text-navy">{c.name}</span>
                    <div className="flex items-center gap-4 font-ui text-xs text-stone">
                      <span>{c.languages.toLocaleString()} languages</span>
                      <span className="font-medium" style={{ color: VITALITY_STATUS_COLORS['critically-endangered'] }}>
                        {critPct}% at risk
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-border overflow-hidden flex">
                    <div className="h-full" style={{ width: `${(c.critical / c.languages) * 100}%`, backgroundColor: VITALITY_STATUS_COLORS['critically-endangered'] }} />
                    <div className="h-full" style={{ width: `${((c.languages - c.critical - c.safe) / c.languages) * 100}%`, backgroundColor: VITALITY_STATUS_COLORS['endangered'] }} />
                    <div className="h-full" style={{ width: `${(c.safe / c.languages) * 100}%`, backgroundColor: VITALITY_STATUS_COLORS['safe'] }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-6 font-ui text-[10px] text-stone/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VITALITY_STATUS_COLORS['critically-endangered'] }} />
              Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VITALITY_STATUS_COLORS['endangered'] }} />
              Endangered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VITALITY_STATUS_COLORS['safe'] }} />
              Safe
            </span>
          </div>
        </div>

        {/* Most active */}
        <div className="lg:col-span-6 bg-surface p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-5 h-px bg-gold" aria-hidden="true" />
            <h2 className="font-ui text-[11px] text-stone tracking-[0.18em] uppercase">Most Active in Archive</h2>
          </div>
          <div className="divide-y divide-border">
            {LANGUAGES
              .slice()
              .sort((a, b) => b.audioCount - a.audioCount)
              .map((lang, i) => {
                const color = VITALITY_STATUS_COLORS[lang.status]
                const maxCount = Math.max(...LANGUAGES.map(l => l.audioCount))
                return (
                  <div key={lang.id} className="py-3.5 flex items-center gap-4">
                    <span className="font-mono text-xs text-stone/30 w-5 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <Link
                          href={`/language/${lang.id}`}
                          className="font-display text-sm font-bold text-navy hover:text-gold transition-colors"
                        >
                          {lang.name}
                        </Link>
                        <span className="font-ui text-xs text-stone/50">{lang.audioCount.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-border relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0"
                          style={{ width: `${(lang.audioCount / maxCount) * 100}%`, backgroundColor: color }}
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
      <div className="bg-navy text-ivory p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-5 h-px bg-gold/50" aria-hidden="true" />
              <span className="font-ui text-[11px] text-ivory/25 tracking-[0.18em] uppercase">Infrastructure</span>
            </div>
            <h3 className="font-display text-2xl lg:text-3xl font-bold mb-4 text-balance">
              Built for global scale — permanent by design.
            </h3>
            <p className="font-body text-ivory/50 leading-relaxed">
              The Oralis archive is powered by AWS DynamoDB, distributed across 12 global regions
              with sub-10ms read latency. Every contribution is replicated three times for permanence.
              The system is designed to support 100M+ contributions from communities worldwide.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-4">
            {[
              { label: 'DynamoDB Tables', value: '47'    },
              { label: 'Global Regions',  value: '12'    },
              { label: 'Read Latency',    value: '<10ms' },
            ].map(({ label, value }) => (
              <div key={label} className="border border-ivory/10 p-5 text-center">
                <p className="font-mono text-2xl font-bold text-gold mb-1">{value}</p>
                <p className="font-ui text-[10px] text-ivory/35">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
