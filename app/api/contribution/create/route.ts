/**
 * app/api/contribution/create/route.ts
 *
 * POST /api/contribution/create
 * Stores a community contribution in DynamoDB as PENDING review.
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { rateLimit } from '@/lib/rate-limit'
import { ContributionCreateSchema } from '@/lib/validations'
import { logAuditEvent } from '@/lib/services/languages'
import { formatContributionSK } from '@/lib/contracts/contribution'

export const runtime = 'nodejs'

function nanoid(len = 8): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, len)
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 5, 60_000)
  if (limited) return limited

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    console.warn('[API /contribution/create] Invalid JSON body')
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ContributionCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const err = parsed.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0 
      ? issues.map((e: any) => e.message).join(', ') 
      : (err?.message || 'Validation failed')
      
    console.warn('[API /contribution/create] Validation failed:', messages)
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  const {
    languageId,
    languageName,
    contentType,
    title,
    body,
    context,
    source,
    location,
    audioS3Key,
    contributorName,
  } = parsed.data

  const now         = new Date().toISOString()
  const id          = nanoid()
  const sk          = formatContributionSK(now, id)
  const deleteToken = crypto.randomUUID()

  const item: Record<string, unknown> = {
    PK:               `LANGUAGE#${languageId.trim()}`,
    SK:               sk,
    GSI1PK:           'FEED',
    GSI1SK:           now,
    id,
    languageId:       languageId.trim(),
    languageName:     languageName?.trim() ?? languageId,
    type:             contentType ?? 'vocabulary',
    title:            title.trim(),
    body:             body?.trim() ?? '',
    context:          context.trim(),
    source:           source?.trim() ?? '',
    location:         location?.trim() ?? '',
    audioS3Key:       audioS3Key ?? null,
    s3Key:            audioS3Key ?? null,
    contributorName:  contributorName.trim(),
    deleteToken,
    verified:         false,
    moderationStatus: 'PENDING',
    visibility:       'ADMIN_ONLY',
    moderationVersion: 1,
    schemaVersion:    2,
    createdAt:        now,
    submittedAt:      now,
  }

  const db = getDb()

  try {
    const startTime = Date.now()

    // 1. Save the pending contribution record
    await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))

    // 2. Log audit trail
    await logAuditEvent({
      action: 'SUBMIT_CONTRIBUTION',
      entityType: 'contribution',
      entityId: id,
      entityKey: { PK: `LANGUAGE#${languageId.trim()}`, SK: sk },
      actorId: contributorName.trim(),
      actorRole: 'contributor',
      newState: {
        title: item.title,
        type: item.type,
        hasAudio: !!audioS3Key,
        moderationStatus: 'PENDING',
      },
      reason: 'New community contribution submitted',
    })

    console.info(`[API /contribution/create] Saved pending contribution`, {
      id,
      sk,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json(
      {
        success: true,
        contributionId: id,
        sk,
        PK: item.PK,
        deleteToken,
        message: 'Your memory has been safely preserved in the Oralis cultural archive and submitted for preservation review.',
      },
      { status: 201 },
    )
  } catch (e) {
    console.error(`[API /contribution/create] DynamoDB error:`, e)
    return NextResponse.json(
      { error: 'Failed to save contribution. Please try again.' },
      { status: 500 },
    )
  }
}
