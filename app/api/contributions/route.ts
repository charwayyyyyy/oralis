/**
 * app/api/contributions/route.ts
 *
 * POST /api/contributions
 * Validates the request body and writes to DynamoDB.
 * Server-side only — AWS credentials never reach the browser.
 */

import { NextRequest, NextResponse } from 'next/server'
import { putContribution, type ContributionPayload } from '@/lib/services/contributions'

export const runtime = 'nodejs'

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return err('Invalid JSON body')
  }

  // ── Validation ────────────────────────────────────────────────
  const { languageId, languageName, type, title, context } = body

  if (!languageId || typeof languageId !== 'string')
    return err('languageId is required')
  if (!languageName || typeof languageName !== 'string')
    return err('languageName is required')
  if (!type || !['vocabulary', 'story', 'audio', 'cultural-context'].includes(type as string))
    return err('type must be vocabulary | story | audio | cultural-context')
  if (!title || typeof title !== 'string' || (title as string).trim().length < 2)
    return err('title is required (min 2 chars)')
  if (!context || typeof context !== 'string' || (context as string).trim().length < 10)
    return err('context is required (min 10 chars)')

  const payload: ContributionPayload = {
    languageId:        (languageId as string).trim(),
    languageName:      (languageName as string).trim(),
    type:              type as ContributionPayload['type'],
    title:             (title as string).trim(),
    body:              typeof body.body === 'string' ? (body.body as string).trim() : undefined,
    context:           (context as string).trim(),
    source:            typeof body.source === 'string' ? (body.source as string).trim() : undefined,
    location:          typeof body.location === 'string' ? (body.location as string).trim() : undefined,
    contributorName:   typeof body.contributorName === 'string' ? (body.contributorName as string).trim() : undefined,
    contributorEmail:  typeof body.contributorEmail === 'string' ? (body.contributorEmail as string).trim().toLowerCase() : undefined,
    audioS3Key:        typeof body.audioS3Key === 'string' ? body.audioS3Key as string : undefined,
    audioBucket:       typeof body.audioBucket === 'string' ? body.audioBucket as string : undefined,
  }

  // ── Write to DynamoDB ─────────────────────────────────────────
  try {
    const id = await putContribution(payload)
    return NextResponse.json({ success: true, contributionId: id }, { status: 201 })
  } catch (e) {
    console.error('[API /contributions] DynamoDB error:', e)
    return NextResponse.json({ error: 'Failed to save contribution. Please try again.' }, { status: 500 })
  }
}
