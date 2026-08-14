import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
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
  const limit = parseInt(url.searchParams.get('limit') || '50', 10)

  const db = getDb()

  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pkPrefix)',
        ExpressionAttributeValues: {
          ':pkPrefix': 'REPORT#',
        },
      })
    )

    let items = (result.Items || []) as any[]

    if (status && status !== 'ALL') {
      items = items.filter((r) => r.status?.toUpperCase() === status.toUpperCase())
    }

    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

    return NextResponse.json({
      success: true,
      reports: items.slice(0, limit),
      totalCount: items.length,
    })
  } catch (err) {
    console.error('[API /api/admin/reports] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
