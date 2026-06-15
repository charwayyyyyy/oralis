/**
 * app/api/contribution/create/route.ts
 *
 * POST /api/contribution/create
 *
 * Stores a phrase contribution in DynamoDB.
 * Called once per phrase after audio is uploaded.
 *
 * DynamoDB structure:
 *   PK:      LANGUAGE#<languageId>
 *   SK:      CONTRIBUTION#<ISO timestamp>
 *   GSI1PK:  FEED
 *   GSI1SK:  <ISO timestamp>    (enables global chronological feed)
 */

import { NextRequest, NextResponse } from 'next/server'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'

function nanoid(len = 8): string {
  return Math.random().toString(36).slice(2, 2 + len).padEnd(len, '0')
}

export interface ContributionCreatePayload {
  languageId:    string
  languageName:  string
  text:          string
  translation?:  string
  audioUrl?:     string
  s3Key?:        string
  context?:      string
  usage?:        'formal' | 'informal' | 'ceremonial' | 'everyday' | 'proverb'
  prompt?:       string  // the original prompt that generated this phrase
  contributorId: string
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    console.warn('[API /contribution/create] Invalid JSON body received')
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { languageId, text, contributorId } = body
  console.info(`[API /contribution/create] Processing contribution for languageId: ${languageId}`)

  if (!languageId || typeof languageId !== 'string') {
    console.warn('[API /contribution/create] Validation failed: missing languageId')
    return NextResponse.json({ error: 'languageId is required' }, { status: 400 })
  }

  if (!text || typeof text !== 'string' || (text as string).trim().length < 1) {
    console.warn('[API /contribution/create] Validation failed: missing text content')
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const id  = nanoid()
  const sk  = `CONTRIBUTION#${now}#${id}`

  const item = {
    // Primary key
    PK:           `LANGUAGE#${languageId}`,
    SK:           sk,
    // GSI for global chronological feed
    GSI1PK:       'FEED',
    GSI1SK:       now,
    // Content
    id,
    languageId:   (languageId as string).trim(),
    languageName: typeof body.languageName === 'string' ? (body.languageName as string).trim() : languageId,
    text:         (text as string).trim(),
    translation:  typeof body.translation === 'string' ? (body.translation as string).trim() : undefined,
    audioUrl:     typeof body.audioUrl === 'string'    ? body.audioUrl as string : undefined,
    s3Key:        typeof body.s3Key === 'string'       ? body.s3Key as string : undefined,
    context:      typeof body.context === 'string'     ? (body.context as string).trim() : undefined,
    usage:        typeof body.usage === 'string'       ? body.usage as string : undefined,
    prompt:       typeof body.prompt === 'string'      ? (body.prompt as string).trim() : undefined,
    contributorId: typeof contributorId === 'string'   ? contributorId as string : 'anonymous',
    type:         'phrase',
    verified:     false,
    createdAt:    now,
  }

  const db = getDb()

  try {
    const startTime = Date.now()
    await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
    const durationMs = Date.now() - startTime

    console.info(`[API /contribution/create] Successfully saved contribution`, {
      contributionId: id,
      sk,
      durationMs,
      table: TABLE_NAME
    })

    return NextResponse.json({ success: true, contributionId: id, sk }, { status: 201 })
  } catch (e) {
    console.error(`[API /contribution/create] DynamoDB PutCommand failed for ${id}:`, e)
    return NextResponse.json({ error: 'Failed to save contribution. Please try again.' }, { status: 500 })
  }
}
