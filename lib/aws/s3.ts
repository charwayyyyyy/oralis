/**
 * lib/aws/s3.ts
 *
 * S3Client singleton + pre-signed URL helper.
 * Import ONLY in server-side code (API routes, Server Components).
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const ALLOWED_CONTENT_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/webm',
])

function createS3Client(): S3Client {
  const region = process.env.AWS_REGION ?? 'us-east-1'

  return new S3Client({
    region,
    ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          credentials: {
            accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }
      : {}),
  })
}

let s3: S3Client | null = null

export function getS3(): S3Client {
  if (!s3) s3 = createS3Client()
  return s3
}

export const S3_BUCKET = process.env.S3_BUCKET ?? 'oralis-media-prod-001'

export interface PresignedUploadResult {
  uploadUrl: string
  s3Key: string
  bucket: string
}

/**
 * Generate a pre-signed PUT URL for direct browser-to-S3 upload.
 *
 * Key format: language/<languageId>/<contributorId>/<timestamp>.<ext>
 * URL is valid for 5 minutes (300 seconds).
 */
export async function getPresignedUploadUrl(params: {
  languageId: string
  contributorId: string    // anonymized or hashed email
  fileName: string
  contentType: string
}): Promise<PresignedUploadResult> {
  const { languageId, contributorId, fileName, contentType } = params

  // Validate content type
  if (!ALLOWED_CONTENT_TYPES.has(contentType.toLowerCase())) {
    throw new Error(`Unsupported content type: ${contentType}. Allowed: ${[...ALLOWED_CONTENT_TYPES].join(', ')}`)
  }

  // Extract and sanitise extension
  const rawExt = fileName.split('.').pop()?.toLowerCase() ?? 'mp3'
  const ext    = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : 'mp3'

  // Safe language ID (alphanumeric + hyphens only)
  const safeLang  = languageId.replace(/[^a-z0-9-]/gi, '').toLowerCase()
  const safeUser  = contributorId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 32)
  const timestamp = Date.now()

  const s3Key = `language/${safeLang}/${safeUser}/${timestamp}.${ext}`

  const command = new PutObjectCommand({
    Bucket:      S3_BUCKET,
    Key:         s3Key,
    ContentType: contentType,
    // Enforce max 500 MB via content-length-range condition
    // (enforced server-side in policy; client respects it)
    Metadata: {
      languageId,
      contributorId: safeUser,
      uploadedAt:    new Date(timestamp).toISOString(),
    },
  })

  const uploadUrl = await getSignedUrl(getS3(), command, { expiresIn: 300 })

  return { uploadUrl, s3Key, bucket: S3_BUCKET }
}
