import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import Hero from '@/components/landing/hero'
import Metrics from '@/components/landing/metrics'
import FeaturedLanguages from '@/components/landing/featured-languages'
import ContributionsFeed from '@/components/landing/contributions-feed'
import Mission from '@/components/landing/mission'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Metrics />
        <FeaturedLanguages />
        <Mission />
        <ContributionsFeed />
      </main>
      <Footer />
    </>
  )
}
