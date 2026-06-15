/**
 * app/api/upload-url/route.ts
 *
 * POST /api/upload-url
 *
 * Generates a pre-signed S3 PUT URL for direct browser-to-S3 audio upload.
 * The browser uploads directly to S3 (bypasses our server) — efficient for large files.
 *
 * Flow:
 *   1. Browser POSTs { languageId, fileName, contentType, contributorId } here
 *   2. Server validates and returns { uploadUrl, s3Key }
 *   3. Browser PUTs the file directly to S3 using uploadUrl
 *   4. Browser POSTs to /api/contributions with s3Key to store metadata
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPresignedUploadUrl } from '@/lib/aws/s3'

export const runtime = 'nodejs'

const ALLOWED_TYPES = new Set([
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
  'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/m4a',
  'audio/ogg', 'audio/webm',
])

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { languageId, fileName, contentType, contributorId } = body

  if (!languageId || typeof languageId !== 'string')
    return NextResponse.json({ error: 'languageId is required' }, { status: 400 })

  if (!fileName || typeof fileName !== 'string')
    return NextResponse.json({ error: 'fileName is required' }, { status: 400 })

  if (!contentType || typeof contentType !== 'string')
    return NextResponse.json({ error: 'contentType is required' }, { status: 400 })

  if (!ALLOWED_TYPES.has((contentType as string).toLowerCase())) {
    return NextResponse.json(
      { error: `Unsupported file type: ${contentType}. Upload MP3, WAV, FLAC, M4A, or OGG.` },
      { status: 400 },
    )
  }

  // Use a safe default contributor ID if not provided
  const safeContributorId =
    typeof contributorId === 'string' && contributorId.trim().length > 0
      ? contributorId.trim()
      : 'anonymous'

  try {
    const result = await getPresignedUploadUrl({
      languageId:    (languageId as string).trim(),
      contributorId: safeContributorId,
      fileName:      (fileName as string).trim(),
      contentType:   (contentType as string).trim().toLowerCase(),
    })

    return NextResponse.json(
      {
        uploadUrl: result.uploadUrl,
        s3Key:     result.s3Key,
        bucket:    result.bucket,
        expiresIn: 300, // seconds
      },
      { status: 200 },
    )
  } catch (e) {
    console.error('[API /upload-url] S3 presign error:', e)
    const msg = e instanceof Error ? e.message : 'Failed to generate upload URL'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
