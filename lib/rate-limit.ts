/**
 * lib/rate-limit.ts
 *
 * Simple in-memory IP-based rate limiter.
 * Uses a sliding window stored in a module-level Map.
 * Resets on serverless cold start — good enough for DDoS/spam protection
 * in a Vercel or Node.js environment without an external dependency.
 *
 * Usage:
 *   const limited = rateLimit(req, 5, 60_000) // 5 reqs / 60 s
 *   if (limited) return limited
 */

import { NextRequest, NextResponse } from 'next/server'

// ip → array of request timestamps (ms)
const store = new Map<string, number[]>()

// Clean up old entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, timestamps] of store.entries()) {
      const fresh = timestamps.filter((t) => now - t < 300_000)
      if (fresh.length === 0) store.delete(ip)
      else store.set(ip, fresh)
    }
  }, 300_000)
}

/**
 * @param req        The incoming Next.js request
 * @param max        Max allowed requests in the window
 * @param windowMs   Window size in milliseconds
 * @returns A 429 NextResponse if rate-limited, otherwise null
 */
export function rateLimit(
  req: NextRequest,
  max: number = 5,
  windowMs: number = 60_000,
): NextResponse | null {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const now = Date.now()
  const windowStart = now - windowMs

  const timestamps = (store.get(ip) ?? []).filter((t) => t > windowStart)
  timestamps.push(now)
  store.set(ip, timestamps)

  if (timestamps.length > max) {
    const retryAfter = Math.ceil(windowMs / 1000)
    return NextResponse.json(
      {
        error: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(max),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  return null
}
