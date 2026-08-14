/**
 * app/api/feed/route.ts
 *
 * GET /api/feed?limit=20&cursor=<base64>
 *
 * Fetches the global chronological feed of APPROVED contributions.
 * Uses GSI1 (GSI1PK = 'FEED', sorted by GSI1SK descending).
 */

import { NextRequest, NextResponse } from 'next/server'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { getPresignedDownloadUrl } from '@/lib/aws/s3'
import { isPubliclyVisibleContribution, serializePublicContribution } from '@/lib/contracts/contribution'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export async function GET(request: NextRequest) {
  const url = new URL(request.url)

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
      ScanIndexForward:          false,
      Limit:                     limit * 2, // Fetch buffer to filter for approved items
      ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
    })

    const result = await db.send(command)
    const duration = Date.now() - startTime

    // Filter strictly for approved contributions using centralized visibility predicate
    const rawItems = (result.Items ?? []).filter((item) => isPubliclyVisibleContribution(item)).slice(0, limit)

    // Generate presigned audio URLs and serialize into safe public DTOs
    const items = await Promise.all(
      rawItems.map(async (item) => {
        const s3Key = (item.audioS3Key as string) || (item.s3Key as string)
        let audioUrl: string | null = (item.audioUrl as string) || null
        if (s3Key && !audioUrl) {
          try {
            audioUrl = await getPresignedDownloadUrl(s3Key)
          } catch (err) {
            console.warn('[API /feed] Failed to sign URL for', s3Key, err)
          }
        }
        return serializePublicContribution(item, audioUrl)
      }),
    )

    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : null

    console.info(`[API /feed] Returned ${items.length} approved items in ${duration}ms`)

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      nextCursor,
    })
  } catch (error) {
    console.error(`[API /feed] DynamoDB Query Failed:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global feed' },
      { status: 500 },
    )
  }
}
