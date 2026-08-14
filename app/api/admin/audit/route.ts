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
  const entityType = url.searchParams.get('entityType') || undefined
  const action = url.searchParams.get('action') || undefined
  const search = url.searchParams.get('search') || undefined
  const limit = parseInt(url.searchParams.get('limit') || '50', 10)

  const db = getDb()

  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pkPrefix)',
        ExpressionAttributeValues: {
          ':pkPrefix': 'AUDIT#',
        },
      })
    )

    let items = (result.Items || []) as any[]

    if (entityType && entityType !== 'ALL') {
      items = items.filter((a) => a.entityType?.toLowerCase() === entityType.toLowerCase())
    }

    if (action && action !== 'ALL') {
      items = items.filter((a) => a.action?.toLowerCase().includes(action.toLowerCase()))
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim()
      items = items.filter(
        (a) =>
          a.action?.toLowerCase().includes(q) ||
          a.actorId?.toLowerCase().includes(q) ||
          a.entityId?.toLowerCase().includes(q) ||
          a.reason?.toLowerCase().includes(q)
      )
    }

    items.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())

    return NextResponse.json({
      success: true,
      auditLogs: items.slice(0, limit),
      totalCount: items.length,
    })
  } catch (err) {
    console.error('[API /api/admin/audit] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
  }
}
