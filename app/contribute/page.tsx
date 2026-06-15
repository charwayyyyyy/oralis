import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import ContributionStudio from '@/components/contribute/contribution-studio'

export default function ContributePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <div className="bg-navy text-ivory py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-gold/60" />
              <span className="font-ui text-xs text-ivory/40 tracking-widest uppercase">
                Contribution Studio
              </span>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-4 text-balance">
              Add your voice<br />to the archive.
            </h1>
            <p className="font-body text-ivory/60 text-lg max-w-2xl">
              Every word, story, and pronunciation you contribute becomes part of
              humanity&apos;s permanent cultural record. Your contribution matters.
            </p>
          </div>
        </div>
        <ContributionStudio />
      </main>
      <Footer />
    </>
  )
}
