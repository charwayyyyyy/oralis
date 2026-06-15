import { VITALITY_STATUS_COLORS, VITALITY_STATUS_LABELS, type Language } from '@/lib/data'

interface Props {
  lang: Language
}

const DIMENSIONS = [
  { key: 'speakers', label: 'Speaker Population' },
  { key: 'intergenerational', label: 'Intergenerational Transmission' },
  { key: 'domains', label: 'Language Domains' },
  { key: 'materials', label: 'Educational Materials' },
  { key: 'documentation', label: 'Documentation Quality' },
  { key: 'community', label: 'Community Engagement' },
]

function getDimensionScore(lang: Language, key: string): number {
  switch (key) {
    case 'speakers': return Math.min(100, Math.log10(lang.speakers + 1) * 20)
    case 'intergenerational': return lang.vitalityScore * 0.9
    case 'domains': return Math.min(100, lang.vitalityScore * 1.1)
    case 'materials': return Math.min(100, (lang.storiesArchived / 10) + lang.vitalityScore * 0.3)
    case 'documentation': return Math.min(100, (lang.audioCount / 20) + lang.vitalityScore * 0.2)
    case 'community': return Math.min(100, lang.contributors * 3 + lang.vitalityScore * 0.3)
    default: return lang.vitalityScore
  }
}

export default function VitalityDashboard({ lang }: Props) {
  const color = VITALITY_STATUS_COLORS[lang.status]

  return (
    <div className="border border-border p-6 bg-surface">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-ui text-xs font-medium tracking-widest uppercase text-muted-foreground">
          Vitality Analysis
        </h3>
        <span
          className="font-ui text-xs font-medium px-2 py-0.5 rounded-sm"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {VITALITY_STATUS_LABELS[lang.status]}
        </span>
      </div>

      {/* Score ring */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="26" fill="none"
              stroke={color}
              strokeWidth="6"
              strokeDasharray={`${(lang.vitalityScore / 100) * 163.4} 163.4`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-foreground">{lang.vitalityScore}</span>
          </div>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-foreground leading-tight">
            {lang.vitalityScore >= 70
              ? 'Stable condition'
              : lang.vitalityScore >= 40
              ? 'Vulnerable condition'
              : lang.vitalityScore >= 20
              ? 'At risk condition'
              : 'Critical condition'}
          </p>
          <p className="font-ui text-xs text-muted-foreground mt-0.5">
            {lang.contributors} active contributors
          </p>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-3">
        {DIMENSIONS.map(({ key, label }) => {
          const score = Math.round(getDimensionScore(lang, key))
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs font-ui mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono text-muted-foreground/60">{score}</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${score}%`,
                    backgroundColor: score > 50 ? 'var(--forest)' : score > 25 ? 'var(--gold)' : 'var(--destructive)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-5 border-t border-border">
        <p className="font-ui text-[10px] text-muted-foreground/50 leading-relaxed">
          Vitality scores are computed from UNESCO Language Vitality and Endangerment Framework
          criteria, community-reported data, and Oralis contributor activity.
        </p>
      </div>
    </div>
  )
}
