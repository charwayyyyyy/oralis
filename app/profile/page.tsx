import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import UserProfile from '@/components/profile/user-profile'

export default function ProfilePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-[72px]">
        <div className="bg-navy-abyss text-ivory relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 50% 70% at 30% 50%, rgba(200,169,107,0.04) 0%, transparent 60%),
                radial-gradient(ellipse 30% 40% at 80% 70%, rgba(62,107,72,0.03) 0%, transparent 50%)
              `
            }}
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px bg-gold/30" />
              <span className="font-ui text-[11px] text-ivory/25 tracking-[0.25em] uppercase">Your Atlas Identity</span>
            </div>
            <h1 className="font-display font-bold text-ivory leading-tight text-balance mb-5"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
              Your footprint<br />in the atlas.
            </h1>
            <p className="font-body text-ivory/35 text-lg max-w-2xl leading-relaxed">
              Every contribution you make becomes part of the permanent cultural record. Here is
              the mark you have left on humanity&apos;s linguistic heritage.
            </p>
          </div>
        </div>
        <UserProfile />
      </main>
      <Footer />
    </>
  )
}
