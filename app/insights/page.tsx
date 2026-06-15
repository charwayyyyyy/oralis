import InsightsDashboard from '@/components/insights/insights-dashboard'

export default function InsightsPage() {
  return (
    <>
<main className="min-h-screen bg-background pt-[72px]">
        <div className="bg-navy-abyss text-ivory relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 60% 80% at 50% 40%, rgba(200,169,107,0.04) 0%, transparent 60%),
                radial-gradient(ellipse 40% 50% at 80% 80%, rgba(62,107,72,0.03) 0%, transparent 50%)
              `
            }}
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px bg-gold/30" />
              <span className="font-ui text-[11px] text-ivory/25 tracking-[0.25em] uppercase">Global Cultural Observatory</span>
            </div>
            <h1 className="font-display font-bold text-ivory leading-tight text-balance mb-6"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
              Watch the pulse of the<br />world&apos;s cultural heritage.
            </h1>
            <p className="font-body text-ivory/35 text-lg max-w-2xl leading-relaxed">
              A living view of humanity&apos;s linguistic vitality — where languages thrive,
              where they fade, and where preservation efforts are making a difference.
            </p>
          </div>
        </div>
        <InsightsDashboard />
      </main>
</>
  )
}
