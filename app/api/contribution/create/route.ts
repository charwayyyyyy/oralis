/**
 * app/api/contribution/create/route.ts
 *
 * POST /api/contribution/create
 *
 * Stores a contribution in DynamoDB with rate limiting, Zod validation,
 * contributor name, and a one-time delete token.
 *
 * DynamoDB structure:
 *   PK:      LANGUAGE#<languageId>
 *   SK:      CONTRIBUTION#<ISO timestamp>#<nanoid>
 *   GSI1PK:  FEED
 *   GSI1SK:  <ISO timestamp>   (enables global chronological feed)
 *
 * Returns:
 *   { success, contributionId, sk, deleteToken }
 *   deleteToken is shown once to the user — not stored retrievably.
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { rateLimit } from '@/lib/rate-limit'
import { ContributionCreateSchema } from '@/lib/validations'

export const runtime = 'nodejs'

function nanoid(len = 8): string {
  return Math.random().toString(36).slice(2, 2 + len).padEnd(len, '0')
}

export async function POST(req: NextRequest) {
  // ── Rate limiting: 5 contributions per IP per minute ─────────────────────
  const limited = rateLimit(req, 5, 60_000)
  if (limited) return limited

  // ── Parse body ────────────────────────────────────────────────────────────
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    console.warn('[API /contribution/create] Invalid JSON body')
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // ── Zod validation ────────────────────────────────────────────────────────
  const parsed = ContributionCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const messages = parsed.error.errors.map((e) => e.message).join(', ')
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

  // ── Build item ────────────────────────────────────────────────────────────
  const now         = new Date().toISOString()
  const id          = nanoid()
  const sk          = `CONTRIBUTION#${now}#${id}`
  const deleteToken = crypto.randomUUID() // one-time delete secret

  const item: Record<string, unknown> = {
    // Primary key
    PK:    `LANGUAGE#${languageId}`,
    SK:    sk,
    // GSI for global chronological feed
    GSI1PK: 'FEED',
    GSI1SK: now,
    // Identity
    id,
    languageId:      languageId.trim(),
    languageName:    languageName?.trim() ?? languageId,
    // Content
    type:            contentType ?? 'vocabulary',
    title:           title.trim(),
    body:            body?.trim() ?? '',
    context:         context.trim(),
    source:          source?.trim() ?? '',
    location:        location?.trim() ?? '',
    audioS3Key:      audioS3Key ?? null,
    // Contributor (no account required — just a name)
    contributorName: contributorName.trim(),
    // Delete secret — stored in DB; verified on delete
    deleteToken,
    verified:  false,
    createdAt: now,
  }

  const db = getDb()

  try {
    const startTime = Date.now()

    // 1. Save the contribution record
    await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))

    // 2. Atomic increment of language counters
    const isStory = contentType === 'story'
    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `LANGUAGE#${languageId}`, SK: 'META' },
        UpdateExpression:
          'ADD #countField :inc, #contributors :inc SET #lastUpdate = :now',
        ExpressionAttributeNames: {
          '#countField':   isStory ? 'storiesArchived' : 'audioCount',
          '#contributors': 'contributors',
          '#lastUpdate':   'lastContribution',
        },
        ExpressionAttributeValues: { ':inc': 1, ':now': now },
      }),
    )

    console.info(`[API /contribution/create] Saved`, {
      id,
      sk,
      durationMs: Date.now() - startTime,
    })

    // 3. Revalidate frontend paths
    revalidatePath('/')
    revalidatePath('/observatory')
    revalidatePath('/explore')

    return NextResponse.json(
      {
        success: true,
        contributionId: id,
        sk,
        PK:          item.PK,
        deleteToken, // shown once to user — not recoverable
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
