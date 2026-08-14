/**
 * app/api/language/full/route.ts
 *
 * GET /api/language/full?id=xxx
 * Retrieves public language data: approved metadata and approved contributions only.
 */

import { NextResponse } from 'next/server'
import { getLanguageById, getLanguageContributions } from '@/lib/services/languages'
import { getPresignedDownloadUrl } from '@/lib/aws/s3'
import { serializePublicContribution } from '@/lib/contracts/contribution'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Language ID is required' }, { status: 400 })
  }

  console.info(`[API /language/full] Fetching public data for language: ${id}`)

  try {
    const startTime = Date.now()
    const metadata = await getLanguageById(id, false)

    if (!metadata) {
      return NextResponse.json({ error: 'Language not found in public archive' }, { status: 404 })
    }

    const rawContributions = await getLanguageContributions(id, 100, false)

    const contributions = await Promise.all(
      rawContributions.map(async (c) => {
        const s3Key = c.audioS3Key || c.s3Key
        let audioUrl: string | null = c.audioUrl || null
        if (s3Key && !audioUrl) {
          try {
            audioUrl = await getPresignedDownloadUrl(s3Key as string)
          } catch (err) {
            console.warn('[API /language/full] Failed to sign audio URL for', s3Key, err)
          }
        }
        return serializePublicContribution(c, audioUrl)
      })
    )

    const durationMs = Date.now() - startTime

    return NextResponse.json({
      success: true,
      metadata,
      contributions,
      durationMs,
    })
  } catch (error) {
    console.error(`[API /language/full] Failed for ${id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch language archive' },
      { status: 500 }
    )
  }
}
