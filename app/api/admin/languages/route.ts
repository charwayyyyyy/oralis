import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { getAdminLanguagesList } from '@/lib/services/languages'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status') || 'ALL'
  const search = url.searchParams.get('search') || undefined
  const limit = parseInt(url.searchParams.get('limit') || '50', 10)
  const cursor = url.searchParams.get('cursor') || undefined

  try {
    const result = await getAdminLanguagesList({ status, search, limit, cursor })
    return NextResponse.json({
      success: true,
      items: result.items,
      nextCursor: result.nextCursor,
      totalEstimated: result.totalEstimated,
    })
  } catch (err) {
    console.error('[API /api/admin/languages] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch languages list' }, { status: 500 })
  }
}
