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
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
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
    // Query the FEED GSI and filter by deleteToken
    // Limit to a reasonable page size — tokens are unique so we stop at 1
    const result = await db.send(
      new QueryCommand({
        TableName:                 TABLE_NAME,
        IndexName:                 'GSI1',
        KeyConditionExpression:    'GSI1PK = :pk',
        FilterExpression:          'deleteToken = :token',
        ExpressionAttributeValues: {
          ':pk':    'FEED',
          ':token': token,
        },
        Limit: 100, // scan up to 100 items to find a match (token is unique)
      }),
    )

    const item = result.Items?.[0] ?? null

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
