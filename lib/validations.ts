import { z } from 'zod'

// --- Contribution Creation ------------------------------------------
export const ContributionCreateSchema = z.object({
  languageId:      z.string().min(1, 'languageId is required').max(100),
  languageName:    z.string().max(200).optional(),
  contentType:     z.enum(['vocabulary', 'story', 'audio', 'cultural-context', 'phrase']).optional(),
  title:           z.string().min(1, 'Title is required').max(200, 'Title too long'),
  body:            z.string().max(10000, 'Content too long').optional(),
  context:         z.string().min(1, 'Cultural context is required').max(5000, 'Context too long'),
  source:          z.string().max(500).optional(),
  location:        z.string().max(300).optional(),
  audioS3Key:      z.string().max(500).optional(),
  contributorName: z.string().min(1, 'Your name is required').max(100, 'Name too long'),
})

export type ContributionCreateInput = z.infer<typeof ContributionCreateSchema>

// --- Upload URL Request ---------------------------------------------
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
  'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/m4a',
  'audio/ogg', 'audio/webm',
] as const

export const UploadUrlSchema = z.object({
  languageId:   z.string().min(1, 'languageId is required').max(100),
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

// --- Delete Token Request -------------------------------------------
export const DeleteByTokenSchema = z.object({
  PK:    z.string().min(1),
  SK:    z.string().min(1),
  token: z.string().uuid('Invalid delete token'),
})

export type DeleteByTokenInput = z.infer<typeof DeleteByTokenSchema>

// --- Unified Language Submission Schema ------------------------------
export const LanguageSubmitSchema = z.object({
  name:                    z.string().min(2, 'Language name must be at least 2 characters').max(100),
  nativeName:              z.string().max(100).optional().default(''),
  isoCode:                 z.string().max(10).optional().default(''),
  country:                 z.string().max(100).optional().default(''),
  region:                  z.string().min(2, 'Region is required').max(100),
  continent:               z.string().max(50).optional().default('Global'),
  languageFamily:          z.string().max(100).optional().default(''),
  estimatedSpeakers:       z.union([z.number(), z.string()]).optional().default('0'),
  vitalityStatus:          z.string().optional().default('endangered'),
  description:             z.string().max(2000).optional().default(''),
  tags:                    z.union([z.array(z.string()), z.string()]).optional().default([]),
  sources:                 z.string().max(1000).optional().default(''),
  consent:                 z.boolean().optional().default(true),
  contributorName:         z.string().max(100).optional().default('Anonymous Contributor'),
  contributorEmail:        z.string().email('Invalid email address').optional().or(z.literal('')),
  contributorRole:         z.string().max(100).optional().default(''),
  contributorLocation:     z.string().max(100).optional().default(''),
  contributorRelationship: z.string().max(100).optional().default(''),
  contributorBio:          z.string().max(1000).optional().default(''),
})

export type LanguageSubmitInput = z.infer<typeof LanguageSubmitSchema>

// --- Language Moderation Action Schema ------------------------------
export const LanguageModerationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'HIDE', 'ARCHIVE', 'RESTORE']),
  reason: z.string().max(500).optional(),
  expectedVersion: z.number().optional(),
})

export type LanguageModerationInput = z.infer<typeof LanguageModerationSchema>

// --- Language Metadata Correction Schema ----------------------------
export const LanguageMetadataUpdateSchema = z.object({
  name:              z.string().min(2).max(100).optional(),
  nativeName:        z.string().max(100).optional(),
  region:            z.string().min(2).max(100).optional(),
  country:           z.string().max(100).optional(),
  continent:         z.string().max(50).optional(),
  family:            z.string().max(100).optional(),
  iso:               z.string().max(10).optional(),
  speakers:          z.number().nonnegative().optional(),
  vitalityStatus:    z.enum(['safe', 'vulnerable', 'endangered', 'critically-endangered', 'dormant']).optional(),
  vitalityScore:     z.number().min(0).max(100).optional(),
  description:       z.string().max(2000).optional(),
  tags:              z.array(z.string()).optional(),
  adminNotes:        z.string().max(1000).optional(),
  reason:            z.string().min(1, 'Reason for metadata update is required').max(500),
})

export type LanguageMetadataUpdateInput = z.infer<typeof LanguageMetadataUpdateSchema>

// --- Contribution Moderation Action Schema ---------------------------
export const ContributionModerationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'HIDE', 'ARCHIVE', 'RESTORE']),
  reason: z.string().max(500).optional(),
  expectedVersion: z.number().optional(),
})

export type ContributionModerationInput = z.infer<typeof ContributionModerationSchema>

// --- Public Content Reporting Schema --------------------------------
export const ContentReportCreateSchema = z.object({
  targetType:  z.enum(['contribution', 'language']),
  targetId:    z.string().min(1, 'targetId is required'),
  targetPK:    z.string().min(1, 'targetPK is required'),
  targetSK:    z.string().min(1, 'targetSK is required'),
  targetTitle: z.string().max(200).optional(),
  languageId:  z.string().max(100).optional(),
  reason:      z.enum([
    'incorrect-info',
    'no-consent',
    'offensive',
    'spam',
    'duplicate',
    'audio-mismatch',
    'other',
  ]),
  explanation: z.string().max(1000, 'Explanation too long').optional(),
})

export type ContentReportCreateInput = z.infer<typeof ContentReportCreateSchema>

// --- Report Resolution Schema ---------------------------------------
export const ReportResolveSchema = z.object({
  action: z.enum(['RESOLVE_AND_HIDE', 'RESOLVE_AND_DELETE', 'DISMISS', 'RESOLVED', 'DISMISSED']).optional(),
  status: z.enum(['RESOLVED', 'DISMISSED', 'RESOLVE_AND_HIDE', 'RESOLVE_AND_DELETE', 'DISMISS']).optional(),
  notes:  z.string().max(500).optional(),
}).refine((data) => Boolean(data.action || data.status), {
  message: 'Either action or status must be provided',
})

export type ReportResolveInput = z.infer<typeof ReportResolveSchema>

// --- Admin Query Filter Schema --------------------------------------
export const AdminQueryFilterSchema = z.object({
  status:     z.enum(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'ARCHIVED']).optional().default('ALL'),
  search:     z.string().max(100).optional(),
  region:     z.string().max(100).optional(),
  type:       z.string().max(50).optional(),
  hasAudio:   z.enum(['true', 'false', 'all']).optional().default('all'),
  reportedOnly: z.enum(['true', 'false']).optional().default('false'),
  limit:      z.coerce.number().min(1).max(100).optional().default(20),
  cursor:     z.string().optional(),
  sortBy:     z.enum(['newest', 'oldest', 'priority']).optional().default('newest'),
})

export type AdminQueryFilterInput = z.infer<typeof AdminQueryFilterSchema>
