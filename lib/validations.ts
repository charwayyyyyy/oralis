/**
 * lib/validations.ts
 *
 * Zod schemas for all API route inputs.
 * Import and call .safeParse() in each route handler.
 */

import { z } from 'zod'

// ── Contribution Creation ─────────────────────────────────────────────────────
export const ContributionCreateSchema = z.object({
  languageId:      z.string().min(1, 'languageId is required'),
  languageName:    z.string().optional(),
  contentType:     z.enum(['vocabulary', 'story', 'audio', 'cultural-context']).optional(),
  title:           z.string().min(1, 'Title is required').max(200, 'Title too long'),
  body:            z.string().max(10000, 'Content too long').optional(),
  context:         z.string().min(1, 'Cultural context is required').max(5000, 'Context too long'),
  source:          z.string().max(500).optional(),
  location:        z.string().max(300).optional(),
  audioS3Key:      z.string().max(500).optional(),
  contributorName: z.string().min(1, 'Your name is required').max(100, 'Name too long'),
})

export type ContributionCreateInput = z.infer<typeof ContributionCreateSchema>

// ── Upload URL Request ────────────────────────────────────────────────────────
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
  'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/m4a',
  'audio/ogg', 'audio/webm',
] as const

export const UploadUrlSchema = z.object({
  languageId:   z.string().min(1, 'languageId is required'),
  fileName:     z.string().min(1, 'fileName is required').max(255),
  contentType:  z
    .string()
    .refine(
      (v) => {
        const baseType = v.split(';')[0].trim().toLowerCase()
        return ALLOWED_AUDIO_TYPES.includes(baseType as typeof ALLOWED_AUDIO_TYPES[number])
      },
      { message: 'Only audio files are allowed (MP3, WAV, FLAC, M4A, OGG, WebM)' },
    ),
  contributorId: z.string().max(64).optional(),
})

export type UploadUrlInput = z.infer<typeof UploadUrlSchema>

// ── Delete Token Request ──────────────────────────────────────────────────────
export const DeleteByTokenSchema = z.object({
  PK:    z.string().min(1),
  SK:    z.string().min(1),
  token: z.string().uuid('Invalid delete token'),
})

export type DeleteByTokenInput = z.infer<typeof DeleteByTokenSchema>
