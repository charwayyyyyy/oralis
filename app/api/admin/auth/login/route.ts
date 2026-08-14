import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { ADMIN_COOKIE_NAME, ADMIN_PASSWORD, signAdminSession } from '@/lib/auth/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Rate limit: max 5 login attempts per minute per IP
  const limited = rateLimit(req, 5, 60_000)
  if (limited) return limited

  try {
    const body = await req.json()
    const { password, token, githubId } = body || {}

    // Check password authentication
    if (typeof password === 'string') {
      const trimmed = password.trim()
      // Constant-time compare or direct match
      if (trimmed !== ADMIN_PASSWORD) {
        // Sleep slightly to prevent brute force timing attacks
        await new Promise((r) => setTimeout(r, 400))
        return NextResponse.json(
          { error: 'Invalid administrator credentials' },
          { status: 401 }
        )
      }

      const sessionToken = await signAdminSession({
        sub: 'oralis-admin',
        role: 'admin',
        authMethod: 'password',
      })

      const response = NextResponse.json({
        success: true,
        message: 'Admin authentication successful',
      })

      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 86400 * 7, // 7 days
      })

      return response
    }

    // Check GitHub OAuth or Token if present
    if (githubId && process.env.ADMIN_GITHUB_IDS) {
      const allowedIds = process.env.ADMIN_GITHUB_IDS.split(',').map((id) => id.trim())
      if (allowedIds.includes(String(githubId).trim())) {
        const sessionToken = await signAdminSession({
          sub: `github:${githubId}`,
          role: 'admin',
          authMethod: 'github',
        })

        const response = NextResponse.json({
          success: true,
          message: 'GitHub Admin authentication successful',
        })

        response.cookies.set({
          name: ADMIN_COOKIE_NAME,
          value: sessionToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 86400 * 7,
        })

        return response
      }
    }

    return NextResponse.json(
      { error: 'Invalid or missing authentication credentials' },
      { status: 400 }
    )
  } catch (err) {
    console.error('[Admin Login API] Error:', err)
    return NextResponse.json(
      { error: 'Authentication service error' },
      { status: 500 }
    )
  }
}
