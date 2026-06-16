/**
 * app/api/contribution/delete/route.ts
 *
 * DELETE /api/contribution/delete?PK=...&SK=...&token=<uuid>
 *
 * Token-based deletion — no authentication required.
 * The deleteToken was issued at contribution time and returned to the user once.
 * We verify the token matches what's stored in DynamoDB before deleting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const PK    = searchParams.get('PK')
  const SK    = searchParams.get('SK')
  const token = searchParams.get('token')

  // ── Basic parameter validation ────────────────────────────────────────────
  if (!PK || !SK || !token) {
    return NextResponse.json(
      { error: 'PK, SK, and token are required' },
      { status: 400 },
    )
  }

  // Basic UUID format check (avoid DB round-trip on obviously wrong tokens)
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(token)) {
    return NextResponse.json({ error: 'Invalid token format' }, { status: 400 })
  }

  const db = getDb()

  try {
    // 1. Fetch the item
    const { Item } = await db.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } }),
    )

    if (!Item) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    // 2. Verify the delete token
    if (Item.deleteToken !== token) {
      console.warn('[API /contribution/delete] Invalid token attempt', { PK, SK })
      return NextResponse.json(
        { error: 'Invalid delete token. You can only delete contributions you created.' },
        { status: 403 },
      )
    }

    // 3. Delete the contribution
    await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK, SK } }))

    // 4. Decrement language counters (best-effort — don't fail the response if this errors)
    try {
      const languageId = (Item.languageId as string) ?? PK.replace('LANGUAGE#', '')
      const isStory    = Item.type === 'story'
      await db.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `LANGUAGE#${languageId}`, SK: 'META' },
          UpdateExpression: 'ADD #countField :dec',
          ConditionExpression: '#countField > :zero',
          ExpressionAttributeNames: {
            '#countField': isStory ? 'storiesArchived' : 'audioCount',
          },
          ExpressionAttributeValues: { ':dec': -1, ':zero': 0 },
        }),
      )
    } catch (counterErr) {
      // Non-fatal — counter may not exist or already be 0
      console.warn('[API /contribution/delete] Counter decrement failed:', counterErr)
    }

    console.info('[API /contribution/delete] Deleted', { PK, SK })

    return NextResponse.json({ success: true, message: 'Contribution deleted.' })
  } catch (e) {
    console.error('[API /contribution/delete] Error:', e)
    return NextResponse.json(
      { error: 'Failed to delete contribution. Please try again.' },
      { status: 500 },
    )
  }
}
