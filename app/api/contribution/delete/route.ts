/**
 * app/api/contribution/delete/route.ts
 *
 * POST /api/contribution/delete
 *
 * Permanently deletes a contribution using the contributor's one-time cryptographic delete token.
 * Performs complete cleanup: deletes DynamoDB record + associated S3 audio object.
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { getS3, S3_BUCKET } from '@/lib/aws/s3'
import { rateLimit } from '@/lib/rate-limit'
import { DeleteByTokenSchema } from '@/lib/validations'
import { logAuditEvent } from '@/lib/services/languages'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  return handleDelete(req)
}

export async function DELETE(req: NextRequest) {
  return handleDelete(req)
}

async function handleDelete(req: NextRequest) {
  const limited = rateLimit(req, 10, 60_000)
  if (limited) return limited

  let raw: any = {}
  try {
    raw = await req.json()
  } catch {
    // If not JSON body, check URL searchParams
    const url = new URL(req.url)
    raw = {
      PK: url.searchParams.get('PK') || '',
      SK: url.searchParams.get('SK') || '',
      token: url.searchParams.get('token') || '',
    }
  }

  const parsed = DeleteByTokenSchema.safeParse(raw)
  if (!parsed.success) {
    const err = parsed.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0 
      ? issues.map((e: any) => e.message).join(', ') 
      : (err?.message || 'Validation failed')
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  const { PK, SK, token } = parsed.data
  const db = getDb()

  try {
    // 1. Fetch item
    const { Item } = await db.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } })
    )

    if (!Item) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    // 2. Verify token
    if (Item.deleteToken !== token) {
      console.warn('[API /contribution/delete] Invalid token attempt', { PK, SK })
      return NextResponse.json(
        { error: 'Invalid delete token. You can only delete contributions you created.' },
        { status: 403 }
      )
    }

    // 3. Delete S3 audio object if present
    const s3Key = (Item.audioS3Key as string) || (Item.s3Key as string)
    if (s3Key) {
      try {
        await getS3().send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
          })
        )
        console.info(`[API /contribution/delete] S3 object removed: ${s3Key}`)
      } catch (s3Err) {
        console.warn(`[API /contribution/delete] S3 deletion warning for ${s3Key}:`, s3Err)
      }
    }

    // 4. Delete DynamoDB record
    await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK, SK } }))

    // 5. Decrement counters if item was approved
    const languageId = (Item.languageId as string) ?? PK.replace('LANGUAGE#', '')
    if (Item.moderationStatus === 'APPROVED' || Item.verified === true) {
      const isStory = Item.type === 'story'
      try {
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
          })
        )
      } catch (cntErr) {
        console.warn('[API /contribution/delete] Counter decrement non-fatal warning:', cntErr)
      }
    }

    // 6. Write audit log
    await logAuditEvent({
      action: 'CONTRIBUTOR_TOKEN_DELETE',
      entityType: 'contribution',
      entityId: Item.id || SK,
      entityKey: { PK, SK },
      actorId: 'contributor:token',
      actorRole: 'contributor',
      previousState: { title: Item.title, languageId, s3Key },
      reason: 'Author used personal cryptographic delete token',
    })

    // 7. Revalidate caches
    try {
      revalidatePath('/')
      revalidatePath('/observatory')
      revalidatePath(`/observatory/${languageId}`)
      revalidatePath(`/language/${languageId}`)
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'Your contribution and all associated audio data have been permanently removed from the archive and S3 storage.',
    })
  } catch (e) {
    console.error('[API /contribution/delete] Error:', e)
    return NextResponse.json(
      { error: 'Failed to delete contribution. Please try again.' },
      { status: 500 }
    )
  }
}
