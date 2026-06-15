/**
 * app/api/language/create/route.ts
 *
 * POST /api/language/create
 * Creates a new language record in DynamoDB.
 * Called by the contribution wizard Step 1.
 */

import { NextRequest, NextResponse } from 'next/server'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    console.warn('[API /language/create] Invalid JSON body received')
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, nativeName, region } = body
  console.info(`[API /language/create] Processing request for language: ${name}`)

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    console.warn(`[API /language/create] Validation failed: invalid name "${name}"`)
    return NextResponse.json({ error: 'Language name is required (min 2 characters)' }, { status: 400 })
  }

  if (!region || typeof region !== 'string' || region.trim().length < 2) {
    console.warn(`[API /language/create] Validation failed: invalid region "${region}"`)
    return NextResponse.json({ error: 'Region is required' }, { status: 400 })
  }

  const id       = slugify(name as string)
  const now      = new Date().toISOString()
  const db       = getDb()

  const item = {
    PK:               `LANGUAGE#${id}`,
    SK:               'META',
    id,
    name:             (name as string).trim(),
    nativeName:       typeof nativeName === 'string' ? (nativeName as string).trim() : '',
    region:           (region as string).trim(),
    status:           'PENDING_REVIEW',
    vitalityScore:    0,
    speakers:         0,
    audioCount:       0,
    storiesArchived:  0,
    contributors:     1,
    createdAt:        now,
    updatedAt:        now,
    // GSI for global feed
    GSI1PK:           'ALL_LANGUAGES',
    GSI1SK:           now,
  }

  try {
    const startTime = Date.now()
    await db.send(
      new PutCommand({
        TableName:           TABLE_NAME,
        Item:                item,
        ConditionExpression: 'attribute_not_exists(PK)', // prevent overwrite
      }),
    )
    const durationMs = Date.now() - startTime

    console.info(`[API /language/create] Successfully created language`, {
      languageId: id,
      durationMs,
      table: TABLE_NAME
    })

    return NextResponse.json({ success: true, languageId: id, language: item }, { status: 201 })
  } catch (e: unknown) {
    if ((e as { name?: string }).name === 'ConditionalCheckFailedException') {
      console.info(`[API /language/create] Duplicate registration bypassed for language: ${id}`)
      // Language already exists — return it as a "conflict" but allow proceeding
      return NextResponse.json(
        { success: true, languageId: id, conflict: true, message: `Language "${id}" already exists. You can still add contributions.` },
        { status: 200 },
      )
    }
    console.error(`[API /language/create] DynamoDB PutCommand failed for ${id}:`, e)
    return NextResponse.json({ error: 'Failed to create language. Please try again.' }, { status: 500 })
  }
}
