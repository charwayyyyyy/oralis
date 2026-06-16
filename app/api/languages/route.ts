/**
 * app/api/languages/route.ts
 *
 * GET  /api/languages          → returns all languages from DynamoDB
 * POST /api/languages          → registers a new language (pending review)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllLanguages, putLanguageRegistration, type LanguageRegistrationPayload } from '@/lib/services/languages'

export const runtime = 'nodejs'

// ── GET — fetch all languages ─────────────────────────────────────────────────
export async function GET() {
  try {
    const languages = await getAllLanguages()
    return NextResponse.json({ languages }, { status: 200 })
  } catch (e) {
    console.error('[API GET /languages] DynamoDB error:', e)
    return NextResponse.json({ error: 'Failed to fetch languages.' }, { status: 500 })
  }
}

// ── POST — new language registration ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const required: (keyof LanguageRegistrationPayload)[] = [
    'contributorName',
    'contributorEmail',
    'contributorRelationship',
    'contributorLocation',
    'languageName',
    'country',
    'continent',
    'estimatedSpeakers',
    'vitalityStatus',
    'description',
    'consent',
  ]

  for (const field of required) {
    const val = body[field]
    if (val === undefined || val === null || val === '' || val === false) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      )
    }
  }

  // Email format check
  const email = body.contributorEmail as string
  if (!/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Description minimum length
  const desc = (body.description as string).trim()
  if (desc.length < 60) {
    return NextResponse.json(
      { error: 'Description must be at least 60 characters' },
      { status: 400 },
    )
  }

  const payload: LanguageRegistrationPayload = {
    contributorName:         (body.contributorName as string).trim(),
    contributorEmail:        email.trim().toLowerCase(),
    contributorRole:         (body.contributorRole as string ?? '').trim(),
    contributorLocation:     (body.contributorLocation as string).trim(),
    contributorRelationship: (body.contributorRelationship as string).trim(),
    contributorBio:          (body.contributorBio as string ?? '').trim(),
    languageName:            (body.languageName as string).trim(),
    nativeName:              (body.nativeName as string ?? '').trim(),
    isoCode:                 (body.isoCode as string ?? '').trim().toLowerCase(),
    country:                 (body.country as string).trim(),
    region:                  (body.region as string ?? '').trim(),
    continent:               (body.continent as string).trim(),
    languageFamily:          (body.languageFamily as string ?? '').trim(),
    estimatedSpeakers:       (body.estimatedSpeakers as string).trim(),
    vitalityStatus:          (body.vitalityStatus as string).trim(),
    description:             desc,
    tags:                    (body.tags as string ?? '').trim(),
    sources:                 (body.sources as string ?? '').trim(),
    consent:                 true,
  }

  try {
    await putLanguageRegistration(payload)
    return NextResponse.json(
      {
        success: true,
        message: `Language registration for "${payload.languageName}" received. You'll hear from us at ${payload.contributorEmail} within 5–7 days.`,
      },
      { status: 201 },
    )
  } catch (e) {
    console.error('[API POST /languages] DynamoDB error:', e)
    return NextResponse.json(
      { error: 'Failed to submit registration. Please try again.' },
      { status: 500 },
    )
  }
}
