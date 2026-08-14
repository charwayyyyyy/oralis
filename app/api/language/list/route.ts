/**
 * app/api/language/list/route.ts
 *
 * GET /api/language/list
 * Fetches all approved languages from DynamoDB for public display.
 */

import { NextResponse } from 'next/server'
import { getAllLanguages } from '@/lib/services/languages'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET() {
  console.info(`[API /language/list] Fetching approved languages`)

  try {
    const startTime = Date.now()
    const all = await getAllLanguages()
    const durationMs = Date.now() - startTime

    const languages = all.map((item) => ({
      id: item.id,
      name: item.name,
      nativeName: item.nativeName,
      region: item.region,
      country: item.country,
      vitalityScore: item.vitalityScore,
      speakers: item.speakers,
      audioCount: item.audioCount || 0,
      storiesArchived: item.storiesArchived || 0,
      createdAt: item.createdAt,
    }))

    return NextResponse.json({
      success: true,
      languages,
      count: languages.length,
      durationMs,
    })
  } catch (error) {
    console.error(`[API /language/list] Failed:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    )
  }
}
