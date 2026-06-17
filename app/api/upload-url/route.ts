/**
 * app/api/upload-url/route.ts
 *
 * POST /api/upload-url
 *
 * Generates a pre-signed S3 POST policy for direct browser-to-S3 audio upload.
 * Uses createPresignedPost (not PUT) to enforce 10 MB content-length-range server-side.
 *
 * Flow:
 *   1. Browser POSTs { languageId, fileName, contentType } here
 *   2. Server validates via Zod and returns { url, fields, s3Key }
 *   3. Browser builds a FormData, appends all fields + the file, and POSTs to url
 *   4. On success, browser POSTs to /api/contribution/create with s3Key
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPresignedPost } from '@/lib/aws/s3'
import { UploadUrlSchema } from '@/lib/validations'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let raw: unknown

  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // ── Zod validation ────────────────────────────────────────────────────────
  const result = UploadUrlSchema.safeParse(raw)
  if (!result.success) {
    const err = result.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0 
      ? issues.map((e: any) => e.message).join(', ') 
      : (err?.message || 'Validation failed')
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  const { languageId, fileName, contentType, contributorId } = result.data

  const safeContributorId =
    contributorId && contributorId.trim().length > 0 ? contributorId.trim() : 'anonymous'

  try {
    const presigned = await getPresignedPost({
      languageId:    languageId.trim(),
      contributorId: safeContributorId,
      fileName:      fileName.trim(),
      contentType:   contentType.trim().toLowerCase(),
    })

    return NextResponse.json(
      {
        url:       presigned.url,
        fields:    presigned.fields,
        s3Key:     presigned.s3Key,
        bucket:    presigned.bucket,
        maxBytes:  10485760, // 10 MB — inform the client
        expiresIn: 300,
      },
      { status: 200 },
    )
  } catch (e) {
    console.error('[API /upload-url] S3 presign error:', e)
    const msg = e instanceof Error ? e.message : 'Failed to generate upload URL'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
