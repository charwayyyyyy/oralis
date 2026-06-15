/**
 * app/api/language/full/route.ts
 *
 * GET /api/language/full?id=xxx
 * Retrieves full language data including metadata and all contributions.
 *
 * Uses a single QueryCommand against the base table:
 * PK = LANGUAGE#{id}
 * SK is sorted descending, so META comes last (or first depending on M vs C).
 * Wait, 'META' vs 'CONTRIBUTION#...'. 'M' > 'C', so sorted descending, 'META' is returned first,
 * then 'CONTRIBUTION#...'.
 */

import { NextResponse } from 'next/server'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Language ID is required' }, { status: 400 })
  }

  console.info(`[API /language/full] Fetching full data for language: ${id}`)

  try {
    const db = getDb()
    const startTime = Date.now()

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `LANGUAGE#${id}`,
      },
      ScanIndexForward: false, // Descending (META first, then newest contributions)
    })

    const result = await db.send(command)
    const items = result.Items || []
    
    if (items.length === 0) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    const durationMs = Date.now() - startTime

    // Separate metadata and contributions
    const metadata = items.find((item) => item.SK === 'META')
    const rawContributions = items.filter((item) => item.SK.startsWith('CONTRIBUTION#'))

    const { getPresignedDownloadUrl } = await import('@/lib/aws/s3')

    const contributions = await Promise.all(
      rawContributions.map(async (c) => {
        if (c.s3Key) {
          try {
            c.audioUrl = await getPresignedDownloadUrl(c.s3Key)
          } catch (err) {
            console.error('[API /language/full] Failed to sign URL for', c.s3Key, err)
          }
        }
        return c
      })
    )

    if (!metadata) {
      return NextResponse.json({ error: 'Language metadata missing' }, { status: 404 })
    }

    console.info(`[API /language/full] Successfully fetched language data for ${id}`, {
      contributionsCount: contributions.length,
      durationMs,
    })

    return NextResponse.json({
      success: true,
      metadata,
      contributions,
    })
  } catch (error) {
    console.error(`[API /language/full] DynamoDB Query Failed for ${id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch language data' },
      { status: 500 }
    )
  }
}
