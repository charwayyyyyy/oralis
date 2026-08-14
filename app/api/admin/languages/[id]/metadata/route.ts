import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { updateLanguageMetadataFactual } from '@/lib/services/languages'
import { LanguageMetadataUpdateSchema } from '@/lib/validations'

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

  const parsed = LanguageMetadataUpdateSchema.safeParse(raw)
  if (!parsed.success) {
    const err = parsed.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0 
      ? issues.map((e: any) => e.message).join(', ') 
      : (err?.message || 'Validation failed')
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  try {
    const updated = await updateLanguageMetadataFactual({
      languageId: id,
      updates: parsed.data,
      reviewerId: session.sub,
    })

    return NextResponse.json({
      success: true,
      message: `Metadata for language "${id}" updated successfully.`,
      language: updated,
    })
  } catch (err) {
    console.error(`[API /api/admin/languages/${id}/metadata] Error:`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update language metadata' },
      { status: 500 }
    )
  }
}
