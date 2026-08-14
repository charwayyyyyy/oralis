import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { getLanguageById, getLanguageContributions } from '@/lib/services/languages'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const { id } = await params

  try {
    const language = await getLanguageById(id, true)
    if (!language) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    const contributions = await getLanguageContributions(id, 100, true)

    return NextResponse.json({
      success: true,
      language,
      contributions,
    })
  } catch (err) {
    console.error(`[API /api/admin/languages/${id}] Error:`, err)
    return NextResponse.json({ error: 'Failed to fetch language details' }, { status: 500 })
  }
}
