/**
 * lib/contracts/contribution.ts
 *
 * Centralized data contract for Oralis Contributions.
 * Standardizes sort-key prefixes, public visibility predicates,
 * canonical writers, and public DTO serialization.
 */

import type { Contribution, ModerationStatus } from '@/lib/data'

export type VisibilityState = 'PUBLIC' | 'ADMIN_ONLY'

export const CONTRIBUTION_SK_PREFIX = 'CONTRIBUTION'
export const CANONICAL_CONTRIBUTION_PREFIX = 'CONTRIBUTION:'
export const LEGACY_CONTRIBUTION_PREFIX = 'CONTRIBUTION#'

/**
 * Builds a canonical DynamoDB sort key for a new contribution.
 * Format: CONTRIBUTION:<ISO timestamp>#<id>
 */
export function formatContributionSK(timestamp: string, id: string): string {
  return `${CANONICAL_CONTRIBUTION_PREFIX}${timestamp}#${id}`
}

/**
 * Validates whether a DynamoDB sort key matches a known contribution pattern.
 * Supports both modern colon-separated and legacy hash-separated keys.
 */
export function isContributionSK(sk: unknown): boolean {
  if (typeof sk !== 'string') return false
  return sk.startsWith(CANONICAL_CONTRIBUTION_PREFIX) || sk.startsWith(LEGACY_CONTRIBUTION_PREFIX)
}

/**
 * Extracts the unique contribution ID and timestamp from a sort key if possible.
 */
export function parseContributionSK(sk: string): { timestamp?: string; id?: string } {
  if (!isContributionSK(sk)) return {}
  const remainder = sk.slice(13) // 'CONTRIBUTION:' or 'CONTRIBUTION#' is 13 chars
  const parts = remainder.split('#')
  if (parts.length >= 2) {
    return { timestamp: parts[0], id: parts.slice(1).join('#') }
  }
  return { id: remainder }
}

/**
 * Centralized predicate for determining if a contribution is publicly visible.
 *
 * Rules:
 * 1. Current Schema: moderationStatus === 'APPROVED' and visibility === 'PUBLIC'.
 * 2. Explicit Non-Public: Statuses of 'REJECTED', 'HIDDEN', 'ARCHIVED', 'PENDING',
 *    or 'DELETION_PENDING' MUST NEVER be public, even if a stale `verified: true` exists.
 * 3. Legacy Schema (no moderationStatus): public if `verified === true` and visibility !== 'ADMIN_ONLY'.
 */
export function isPubliclyVisibleContribution(
  item: Partial<Contribution> | Record<string, unknown> | null | undefined
): boolean {
  if (!item) return false

  const rec = item as Record<string, unknown>
  const moderationStatus = (rec.moderationStatus as string | undefined)?.toUpperCase() as ModerationStatus | undefined
  const visibility = (rec.visibility as string | undefined)?.toUpperCase() as VisibilityState | undefined
  const verified = rec.verified === true

  // Explicit non-public states
  const nonPublicStatuses: string[] = ['REJECTED', 'HIDDEN', 'ARCHIVED', 'PENDING', 'DELETION_PENDING']
  if (moderationStatus && nonPublicStatuses.includes(moderationStatus)) {
    return false
  }

  // Modern schema check
  if (moderationStatus === 'APPROVED') {
    if (visibility === 'ADMIN_ONLY') return false
    return true
  }

  // Legacy record fallback (when moderationStatus is undefined)
  if (!moderationStatus) {
    if (verified && visibility !== 'ADMIN_ONLY') {
      return true
    }
  }

  return false
}

/**
 * Public Contribution DTO - strictly allow-listed fields for public consumption.
 * Prevents exposing delete tokens, internal PK/SK, moderation audit metadata,
 * or private contributor details.
 */
export interface PublicContributionDTO {
  id: string
  languageId: string
  languageName: string
  type: string
  title: string
  body?: string
  context: string
  source?: string
  location?: string
  contributorName: string
  audioUrl?: string | null
  createdAt: string
  submittedAt?: string
  usage?: string
}

/**
 * Serializes an internal contribution item into a safe public DTO.
 */
export function serializePublicContribution(
  item: Partial<Contribution> | Record<string, unknown>,
  signedAudioUrl?: string | null
): PublicContributionDTO {
  const rec = item as Record<string, unknown>
  const resolvedId = (rec.id as string) || (typeof rec.SK === 'string' ? parseContributionSK(rec.SK).id : '') || ''
  const resolvedLanguageId =
    (rec.languageId as string) ||
    (typeof rec.PK === 'string' ? rec.PK.replace('LANGUAGE#', '') : '') ||
    ''

  const resolvedAudioUrl =
    signedAudioUrl !== undefined
      ? signedAudioUrl
      : typeof rec.audioUrl === 'string'
        ? rec.audioUrl
        : null

  const dto: PublicContributionDTO = {
    id: resolvedId,
    languageId: resolvedLanguageId,
    languageName: (rec.languageName as string) || resolvedLanguageId,
    type: (rec.type as string) || 'vocabulary',
    title: (rec.title as string) || '',
    context: (rec.context as string) || '',
    contributorName: (rec.contributorName as string) || 'Anonymous Contributor',
    audioUrl: resolvedAudioUrl,
    createdAt: (rec.createdAt as string) || (rec.submittedAt as string) || new Date().toISOString(),
  }

  if (rec.body && typeof rec.body === 'string' && rec.body.trim()) {
    dto.body = rec.body.trim()
  }

  if (rec.source && typeof rec.source === 'string' && rec.source.trim()) {
    dto.source = rec.source.trim()
  }

  if (rec.location && typeof rec.location === 'string' && rec.location.trim()) {
    dto.location = rec.location.trim()
  }

  if (rec.submittedAt && typeof rec.submittedAt === 'string') {
    dto.submittedAt = rec.submittedAt
  }

  if (rec.usage && typeof rec.usage === 'string') {
    dto.usage = rec.usage
  }

  return dto
}
