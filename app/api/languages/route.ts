/**
 * app/api/languages/route.ts
 *
 * GET  /api/languages ?" Returns all approved languages from DynamoDB.
 * POST /api/languages ?" Submits a language registration via the canonical service.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllLanguages, submitLanguageCanonical } from '@/lib/services/languages'
import { rateLimit } from '@/lib/rate-limit'
import { LanguageSubmitSchema } from '@/lib/validations'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    const languages = await getAllLanguages()
    return NextResponse.json(
      { success: true, count: languages.length, languages },
      { status: 200 },
    )
  } catch (e) {
    console.error('[API GET /languages] Error:', e)
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 10, 60_000)
  if (limited) return limited

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = LanguageSubmitSchema.safeParse(raw)
  if (!parsed.success) {
    const err = parsed.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0
      ? issues.map((e: any) => e.message).join(', ')
      : (err?.message || 'Validation failed')
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  try {
    const result = await submitLanguageCanonical(parsed.data)
    return NextResponse.json(
      {
        success: true,
        languageId: result.languageId,
        message: result.message || `Language registration for "${parsed.data.name}" received.`,
      },
      { status: 201 },
    )
  } catch (e) {
    console.error('[API POST /languages] Error:', e)
    return NextResponse.json(
      { error: 'Failed to submit registration. Please try again.' },
      { status: 500 },
    )
  }
}
