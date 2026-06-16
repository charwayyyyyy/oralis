/**
 * app/api/feed/route.ts
 *
 * GET /api/feed
 * Fetches the global chronological feed of all contributions.
 * Uses the GSI1 index on the DynamoDB table.
 */

import { NextResponse } from 'next/server'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'
// Disable caching so the feed is always fresh when requested
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '50', 10)

  console.info(`[API /feed] Processing GET request`, { limit })

  try {
    const db = getDb()
    const startTime = Date.now()

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'FEED',
      },
      ScanIndexForward: false, // Descending (newest first)
      Limit: limit > 100 ? 100 : limit,
    })

    const result = await db.send(command)
    const duration = Date.now() - startTime

    const { getPresignedDownloadUrl } = await import('@/lib/aws/s3')

    const items = await Promise.all(
      (result.Items || []).map(async (item) => {
        if (item.s3Key) {
          try {
            item.audioUrl = await getPresignedDownloadUrl(item.s3Key)
          } catch (err) {
            console.error('[API /feed] Failed to sign URL for', item.s3Key, err)
          }
        }
        return item
      })
    )

    console.info(`[API /feed] Successfully fetched feed`, {
      itemCount: items.length,
      durationMs: duration,
      scannedCount: result.ScannedCount
    })

    return NextResponse.json({
      success: true,
      items: items,
      count: items.length
    })
  } catch (error) {
    console.error(`[API /feed] DynamoDB Query Failed:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global feed' },
      { status: 500 }
    )
  }
}
