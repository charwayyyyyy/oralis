import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import InsightsDashboard from '@/components/insights/insights-dashboard'

export default function InsightsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="bg-earth text-primary-foreground py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-gold/60" />
              <span className="font-ui text-xs text-primary-foreground/40 tracking-widest uppercase">
                Cultural Insights
              </span>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-4 text-balance">
              The state of the world&apos;s<br />linguistic heritage.
            </h1>
            <p className="font-body text-primary-foreground/60 text-lg max-w-2xl">
              Real-time intelligence across 2,847 languages — vitality scores,
              community activity, preservation velocity, and global reach.
            </p>
          </div>
        </div>
        <InsightsDashboard />
      </main>
      <Footer />
    </>
  )
}
