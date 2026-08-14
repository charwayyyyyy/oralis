import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { moderateLanguageAction } from '@/lib/services/languages'
import { LanguageModerationSchema } from '@/lib/validations'

export const runtime = 'nodejs'

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Props) {
  let session
  try {
    session = await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const { id } = await params

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = LanguageModerationSchema.safeParse(raw)
  if (!parsed.success) {
    const err = parsed.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0 
      ? issues.map((e: any) => e.message).join(', ') 
      : (err?.message || 'Validation failed')
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  const { action, reason, expectedVersion } = parsed.data

  try {
    const updated = await moderateLanguageAction({
      languageId: id,
      action,
      reviewerId: session.sub,
      reason,
      expectedVersion,
    })

    return NextResponse.json({
      success: true,
      message: `Language "${id}" state updated to ${action}.`,
      language: updated,
    })
  } catch (err) {
    console.error(`[API /api/admin/languages/${id}/moderation] Error:`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update language moderation state' },
      { status: 500 }
    )
  }
}
