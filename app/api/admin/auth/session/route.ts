import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      sub: session.sub,
      role: session.role,
      authMethod: session.authMethod,
      username: session.username || 'Administrator',
    },
  })
}
