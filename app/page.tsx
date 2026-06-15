import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import Hero from '@/components/landing/hero'
import AtlasNarrative from '@/components/landing/atlas-narrative'
import LivePulse from '@/components/landing/live-pulse'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <AtlasNarrative />
        <LivePulse />
      </main>
      <Footer />
    </>
  )
}
