import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import ContributionStudio from '@/components/contribute/contribution-studio'

export default function ContributePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-[72px]">
        <div className="bg-navy-abyss text-ivory relative overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 50% 80% at 30% 50%, rgba(200,169,107,0.05) 0%, transparent 60%),
                radial-gradient(ellipse 40% 60% at 70% 70%, rgba(62,107,72,0.04) 0%, transparent 50%)
              `
            }}
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-px bg-gold/30" />
              <span className="font-ui text-[11px] text-ivory/25 tracking-[0.25em] uppercase">
                Preservation Ritual
              </span>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-5 text-balance">
              Leave a memory<br />in the atlas.
            </h1>
            <p className="font-body text-ivory/40 text-lg max-w-2xl leading-relaxed">
              Every contribution is an act of cultural preservation — a thread woven into
              humanity&apos;s living tapestry. Your memory becomes part of the permanent record.
            </p>
          </div>
        </div>
        <ContributionStudio />
      </main>
      <Footer />
    </>
  )
}
