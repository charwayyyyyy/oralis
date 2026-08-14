import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { getPresignedDownloadUrl } from '@/lib/aws/s3'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status') || 'ALL'
  const search = url.searchParams.get('search') || undefined
  const type = url.searchParams.get('type') || undefined
  const hasAudio = url.searchParams.get('hasAudio') || 'all'
  const reportedOnly = url.searchParams.get('reportedOnly') === 'true'
  const languageId = url.searchParams.get('languageId') || undefined
  const limit = parseInt(url.searchParams.get('limit') || '50', 10)
  const cursor = url.searchParams.get('cursor') || undefined

  const db = getDb()

  try {
    let exclusiveStartKey: Record<string, unknown> | undefined
    if (cursor) {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
      } catch {
        // ignore
      }
    }

    const scanResult = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':skPrefix': 'CONTRIBUTION',
        },
        ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
      })
    )

    let items = (scanResult.Items || []).map((item) => {
      if (!item.moderationStatus) {
        item.moderationStatus = item.verified ? 'APPROVED' : 'PENDING'
      }
      return item
    })

    // Filter by status
    if (status && status !== 'ALL') {
      items = items.filter((i) => (i.moderationStatus || '').toUpperCase() === status.toUpperCase())
    }

    // Filter by languageId
    if (languageId) {
      items = items.filter((i) => i.languageId === languageId || i.PK === `LANGUAGE#${languageId}`)
    }

    // Filter by type
    if (type && type !== 'all') {
      items = items.filter((i) => i.type === type)
    }

    // Filter by audio
    if (hasAudio === 'true') {
      items = items.filter((i) => Boolean(i.audioS3Key || i.s3Key))
    } else if (hasAudio === 'false') {
      items = items.filter((i) => !i.audioS3Key && !i.s3Key)
    }

    // Filter by reports
    if (reportedOnly) {
      items = items.filter((i) => (i.reportCount || 0) > 0)
    }

    // Search query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim()
      items = items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.context?.toLowerCase().includes(q) ||
          i.languageName?.toLowerCase().includes(q) ||
          i.contributorName?.toLowerCase().includes(q) ||
          i.body?.toLowerCase().includes(q)
      )
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

    // Generate presigned audio URLs for the requested page of items
    const pageItems = items.slice(0, limit)
    const itemsWithAudio = await Promise.all(
      pageItems.map(async (item) => {
        const s3Key = item.audioS3Key || item.s3Key
        let audioUrl = item.audioUrl
        if (s3Key && !audioUrl) {
          try {
            audioUrl = await getPresignedDownloadUrl(s3Key as string)
          } catch (err) {
            console.warn('[Admin Contributions] Failed to sign URL:', s3Key, err)
          }
        }
        return {
          ...item,
          audioUrl,
        }
      })
    )

    const nextCursor = scanResult.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(scanResult.LastEvaluatedKey)).toString('base64')
      : null

    return NextResponse.json({
      success: true,
      items: itemsWithAudio,
      nextCursor,
      totalCount: items.length,
    })
  } catch (err) {
    console.error('[API /api/admin/contributions] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 })
  }
}
