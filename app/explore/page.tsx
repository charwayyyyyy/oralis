/**
 * app/explore/page.tsx
 *
 * Server Component — fetches all languages from DynamoDB at build time (SSG).
 * Revalidates every hour so new languages added via /api/languages appear
 * without a full redeploy.
 *
 * The interactive filter/map UI lives in ExploreClient (client component).
 */

import type { Metadata } from 'next'
import ExploreClient from '@/components/explore/explore-client'
import { getAllLanguages } from '@/lib/services/languages'
import { LANGUAGES }      from '@/lib/data'
import type { Language }  from '@/lib/data'

export const metadata: Metadata = {
  title: 'Explore Endangered Languages & Living Cultural Atlas',
  description: 'Navigate humanity\'s linguistic heritage. Search endangered languages by continent, vitality status, and speaker counts on the interactive Oralis world atlas.',
  keywords: ['endangered languages map', 'linguistic atlas', 'indigenous languages', 'language explorer', 'world languages directory'],
  alternates: {
    canonical: '/explore',
  },
}

// Revalidate every 1 hour — SSG with stale-while-revalidate
export const revalidate = 3600

export default async function ExplorePage() {
  let languages: Language[] = []

  try {
    languages = await getAllLanguages()
  } catch (err) {
    // Graceful fallback to static data if DynamoDB is not yet configured
    console.warn('[ExplorePage] DynamoDB unavailable, falling back to static data:', err)
    languages = LANGUAGES
  }

  return (
    <div className="min-h-screen bg-background pt-[72px]">
      <ExploreClient languages={languages} />
    </div>
  )
}
