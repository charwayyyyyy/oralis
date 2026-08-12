import Hero from '@/components/landing/hero'
import FeaturedLanguages from '@/components/landing/featured-languages'
import AtlasNarrative from '@/components/landing/atlas-narrative'
import LivePulse from '@/components/landing/live-pulse'
import ContributionsFeed from '@/components/landing/contributions-feed'

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <FeaturedLanguages />
      <AtlasNarrative />
      <LivePulse />
      <ContributionsFeed />
    </div>
  )
}
