/**
 * app/explore/page.tsx
 *
 * Server Component — fetches all languages from DynamoDB at build time (SSG).
 * Revalidates every hour so new languages added via /api/languages appear
 * without a full redeploy.
 *
 * The interactive filter/map UI lives in ExploreClient (client component).
 */

import Navigation from '@/components/navigation'
import Footer     from '@/components/footer'
import ExploreClient from '@/components/explore/explore-client'
import { getAllLanguages } from '@/lib/services/languages'
import { LANGUAGES }      from '@/lib/data'
import type { Language }  from '@/lib/data'

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
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-[72px]">
        <ExploreClient languages={languages} />
      </main>
      <Footer />
    </>
  )
}
