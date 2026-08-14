/**
 * app/api/language/create/route.ts
 *
 * POST /api/language/create
 * Creates a new pending language record using the canonical language submission service.
 * Used by the contribution wizard Step 1.
 */

import { NextRequest, NextResponse } from 'next/server'
import { submitLanguageCanonical } from '@/lib/services/languages'
import { LanguageSubmitSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 10, 60_000)
  if (limited) return limited

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    console.warn('[API /language/create] Invalid JSON body received')
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
        conflict: result.isExisting,
        message: result.message,
        language: result.language,
      },
      { status: result.isExisting ? 200 : 201 }
    )
  } catch (e: unknown) {
    console.error('[API /language/create] Failed to submit language:', e)
    return NextResponse.json(
      { error: 'Failed to create language. Please try again.' },
      { status: 500 }
    )
  }
}
