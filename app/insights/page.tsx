import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import InsightsDashboard from '@/components/insights/insights-dashboard'

export default function InsightsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-[72px]">
        {/* Editorial header */}
        <div className="bg-navy text-ivory">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-gold/50" />
              <span className="font-ui text-xs text-ivory/30 tracking-[0.2em] uppercase">Cultural Vitality Observatory</span>
            </div>
            <h1 className="font-display font-bold text-ivory leading-tight text-balance mb-6"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
              The state of the world&apos;s<br />linguistic heritage.
            </h1>
            <p className="font-body text-ivory/45 text-lg max-w-2xl">
              Real-time intelligence across 2,847 languages — vitality indices,
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
