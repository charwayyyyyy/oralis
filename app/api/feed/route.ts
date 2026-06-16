/**
 * app/api/feed/route.ts
 *
 * GET /api/feed?limit=20&cursor=<base64>
 *
 * Fetches the global chronological feed of all contributions.
 * Uses GSI1 (GSI1PK = 'FEED', sorted by GSI1SK descending).
 *
 * Pagination:
 *   - Pass cursor (base64-encoded LastEvaluatedKey) to get the next page
 *   - Response includes nextCursor (null when no more pages)
 */

import { NextRequest, NextResponse } from 'next/server'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'
// Disable caching so the feed is always fresh
export const fetchCache = 'force-no-store'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export async function GET(request: NextRequest) {
  const url = new URL(request.url)

  // ── Parse query params ────────────────────────────────────────────────────
  const rawLimit = parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)
  const limit = isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : Math.min(rawLimit, MAX_LIMIT)

  const cursorParam = url.searchParams.get('cursor')
  let exclusiveStartKey: Record<string, unknown> | undefined

  if (cursorParam) {
    try {
      const decoded = Buffer.from(cursorParam, 'base64').toString('utf-8')
      exclusiveStartKey = JSON.parse(decoded)
    } catch {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 })
    }
  }

  console.info(`[API /feed] GET`, { limit, hasCursor: !!cursorParam })

  try {
    const db = getDb()
    const startTime = Date.now()

    const command = new QueryCommand({
      TableName:                 TABLE_NAME,
      IndexName:                 'GSI1',
      KeyConditionExpression:    'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': 'FEED' },
      ScanIndexForward:          false, // Descending (newest first)
      Limit:                     limit,
      ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
    })

    const result = await db.send(command)
    const duration = Date.now() - startTime

    // ── Generate presigned audio URLs ─────────────────────────────────────
    const { getPresignedDownloadUrl } = await import('@/lib/aws/s3')

    const items = await Promise.all(
      (result.Items ?? []).map(async (item) => {
        if (item.s3Key) {
          try {
            item.audioUrl = await getPresignedDownloadUrl(item.s3Key as string)
          } catch (err) {
            console.error('[API /feed] Failed to sign URL for', item.s3Key, err)
          }
        }
        return item
      }),
    )

    // ── Build next cursor ─────────────────────────────────────────────────
    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : null

    console.info(`[API /feed] Fetched ${items.length} items in ${duration}ms`, {
      nextCursor: !!nextCursor,
      scannedCount: result.ScannedCount,
    })

    return NextResponse.json({
      success:    true,
      items,
      count:      items.length,
      nextCursor,           // null when no more pages
    })
  } catch (error) {
    console.error(`[API /feed] DynamoDB Query Failed:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global feed' },
      { status: 500 },
    )
  }
}
