/**
 * app/api/upload-audio/route.ts
 *
 * POST /api/upload-audio
 * Accepts multipart FormData with an audio Blob.
 * Uploads to S3 and returns the S3 key + public-accessible URL pattern.
 *
 * FormData fields:
 *   - audio:       Blob (required)
 *   - languageId:  string (required)
 *   - phraseIndex: string (optional — used for key naming)
 */

import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getS3, S3_BUCKET } from '@/lib/aws/s3'

export const runtime = 'nodejs'

const ALLOWED_MIME = new Set([
  'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg',
  'audio/wav', 'audio/x-wav', 'audio/flac',
])

const MIME_TO_EXT: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg':  'ogg',
  'audio/mp4':  'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav':  'wav',
  'audio/x-wav': 'wav',
  'audio/flac': 'flac',
}

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    console.warn('[API /upload-audio] Failed to parse FormData')
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const audioBlob    = formData.get('audio')    as File | null
  const languageId   = formData.get('languageId') as string | null
  const phraseIndex  = formData.get('phraseIndex') as string | null

  if (!audioBlob || !(audioBlob instanceof File)) {
    console.warn('[API /upload-audio] Validation failed: missing or invalid audio file')
    return NextResponse.json({ error: 'audio file is required' }, { status: 400 })
  }

  if (!languageId || typeof languageId !== 'string') {
    console.warn('[API /upload-audio] Validation failed: missing languageId')
    return NextResponse.json({ error: 'languageId is required' }, { status: 400 })
  }

  const mimeType = audioBlob.type || 'audio/webm'
  console.info(`[API /upload-audio] Processing audio upload`, { languageId, phraseIndex, mimeType, size: audioBlob.size })

  if (!ALLOWED_MIME.has(mimeType)) {
    console.warn(`[API /upload-audio] Validation failed: unsupported MIME type "${mimeType}"`)
    return NextResponse.json({ error: `Unsupported audio type: ${mimeType}` }, { status: 400 })
  }

  const ext       = MIME_TO_EXT[mimeType] ?? 'webm'
  const timestamp = Date.now()
  const idxPart   = phraseIndex ? `-p${phraseIndex}` : ''
  const s3Key     = `language/${languageId}/recordings/${timestamp}${idxPart}.${ext}`

  const arrayBuffer = await audioBlob.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)

  try {
    const startTime = Date.now()
    await getS3().send(
      new PutObjectCommand({
        Bucket:      S3_BUCKET,
        Key:         s3Key,
        Body:        buffer,
        ContentType: mimeType,
        Metadata: {
          languageId,
          phraseIndex: phraseIndex ?? 'unknown',
          uploadedAt:  new Date(timestamp).toISOString(),
        },
      }),
    )
    const durationMs = Date.now() - startTime

    // Return the S3 key — audioUrl is constructed from key for now
    // In production you'd use CloudFront or a signed GET URL
    const audioUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`

    console.info(`[API /upload-audio] Successfully uploaded audio`, {
      s3Key,
      bucket: S3_BUCKET,
      durationMs,
      sizeBytes: buffer.length
    })

    return NextResponse.json({ success: true, s3Key, audioUrl }, { status: 201 })
  } catch (e) {
    console.error(`[API /upload-audio] S3 PutObjectCommand failed for ${s3Key}:`, e)
    return NextResponse.json({ error: 'Audio upload to S3 failed. Please try again.' }, { status: 500 })
  }
}
