/**
 * lib/aws/s3.ts
 *
 * S3Client singleton + pre-signed URL helpers.
 * Import ONLY in server-side code (API routes, Server Components).
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

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

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB — enforced by S3 policy

function createS3Client(): S3Client {
  const region = process.env.AWS_REGION ?? 'us-east-1'

  return new S3Client({
    region,
    ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
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

export interface PresignedPostResult {
  url: string
  fields: Record<string, string>
  s3Key: string
  bucket: string
}

export async function getPresignedPost(params: {
  languageId: string
  contributorId: string
  fileName: string
  contentType: string
}): Promise<PresignedPostResult> {
  const { languageId, contributorId, fileName, contentType } = params

  // Validate content type
  if (!ALLOWED_CONTENT_TYPES.has(contentType.toLowerCase())) {
    throw new Error(
      `Unsupported content type: ${contentType}. Allowed: ${[...ALLOWED_CONTENT_TYPES].join(', ')}`,
    )
  }

  // Extract and sanitise extension
  const rawExt = fileName.split('.').pop()?.toLowerCase() ?? 'mp3'
  const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : 'mp3'

  // Safe IDs (alphanumeric + hyphens only)
  const safeLang = languageId.replace(/[^a-z0-9-]/gi, '').toLowerCase()
  const safeUser = contributorId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 32)
  const timestamp = Date.now()

  const s3Key = `language/${safeLang}/${safeUser}/${timestamp}.${ext}`

  const { url, fields } = await createPresignedPost(getS3(), {
    Bucket: S3_BUCKET,
    Key: s3Key,
    Expires: 300, // 5 minutes
    Conditions: [
      // Enforce 10 MB max — S3 rejects any upload exceeding this
      ['content-length-range', 0, MAX_FILE_SIZE],
      // Lock the content-type to the declared audio type
      ['eq', '$Content-Type', contentType],
    ],
    Fields: {
      'Content-Type': contentType,
    },
  })

  return { url, fields, s3Key, bucket: S3_BUCKET }
}

/**
 * Generate a pre-signed GET URL for securely playing audio.
 * URL is valid for 1 hour (3600 seconds).
 */
export async function getPresignedDownloadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
  })

  return await getSignedUrl(getS3(), command, { expiresIn: 3600 })
}
