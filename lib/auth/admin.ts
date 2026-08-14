import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const ADMIN_COOKIE_NAME = 'oralis_admin_session'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Giu08869-bv47RYEik'
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.CLERK_SECRET_KEY || 'oralis-master-secret-key-2026-auth-prod'

export interface AdminSession {
  sub: string
  role: 'admin'
  authMethod: 'password' | 'github'
  username?: string
  iat: number
  exp: number
  jti: string
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return Buffer.from(str, 'base64').toString('utf8')
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signAdminSession(payload: Omit<AdminSession, 'iat' | 'exp' | 'jti'>, expiresInSeconds = 86400): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: AdminSession = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    jti: crypto.randomUUID(),
  }

  const payloadJson = JSON.stringify(fullPayload)
  const payloadB64 = base64UrlEncode(payloadJson)
  
  const key = await getCryptoKey()
  const enc = new TextEncoder()
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64))
  const signatureB64 = Buffer.from(signatureBuffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${payloadB64}.${signatureB64}`
}

export async function verifyAdminSession(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadB64, signatureB64] = parts

  try {
    const key = await getCryptoKey()
    const enc = new TextEncoder()
    
    // Normalize signature buffer
    const sigArray = new Uint8Array(
      Buffer.from(signatureB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
    )

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigArray,
      enc.encode(payloadB64)
    )

    if (!isValid) return null

    const payloadJson = base64UrlDecode(payloadB64)
    const session: AdminSession = JSON.parse(payloadJson)

    const now = Math.floor(Date.now() / 1000)
    if (session.exp && session.exp < now) {
      return null
    }

    if (session.role !== 'admin') {
      return null
    }

    return session
  } catch (err) {
    console.warn('[Admin Auth] Token verification failed:', err)
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
    return await verifyAdminSession(token)
  } catch {
    return null
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('UNAUTHORIZED_ADMIN')
  }
  return session
}

export function handleAdminApiAuthError(error: unknown) {
  if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }
  console.error('[Admin API] Server error:', error)
  return NextResponse.json(
    { error: 'Internal server error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
