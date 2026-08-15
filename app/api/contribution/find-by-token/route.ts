/**
 * app/api/contribution/find-by-token/route.ts
 *
 * GET /api/contribution/find-by-token?token=<uuid>
 *
 * Looks up a contribution by its deleteToken.
 * Used by the Profile / "Manage My Contribution" page.
 *
 * Implementation:
 *   We query the FEED GSI (all contributions) with a filter on deleteToken.
 *   This is a scan-with-filter on the GSI — acceptable at this scale.
 *   We never expose the deleteToken in the response; the caller already has it.
 */

import { NextRequest, NextResponse } from 'next/server'
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')

  if (!token || !UUID_RE.test(token)) {
    return NextResponse.json({ error: 'A valid token is required' }, { status: 400 })
  }

  const db = getDb()

  try {
    // 1. First scan/query table for deleteToken
    const scanResult = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'deleteToken = :token',
        ExpressionAttributeValues: {
          ':token': token,
        },
        Limit: 10,
      })
    )

    const item = scanResult.Items?.[0] ?? null

    if (!item) {
      return NextResponse.json({ error: 'No contribution found for this token.' }, { status: 404 })
    }

    // Return safe fields — never include deleteToken in response
    const { deleteToken: _hidden, ...safeItem } = item

    return NextResponse.json({ success: true, contribution: safeItem })
  } catch (e) {
    console.error('[API /contribution/find-by-token] Error:', e)
    return NextResponse.json({ error: 'Failed to look up contribution' }, { status: 500 })
  }
}
