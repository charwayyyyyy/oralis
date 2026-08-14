/**
 * lib/services/languages.ts
 *
 * Unified DynamoDB Service for Languages, Contributions, Moderation, and Audit Logs.
 * Server-side only  never import into client components.
 */

import {
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { revalidatePath } from 'next/cache'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { getS3, S3_BUCKET } from '@/lib/aws/s3'
import type {
  Language,
  Contribution,
  ModerationStatus,
  AuditLogEntry,
  ContentReport,
  AnalyticsTotals,
} from '@/lib/data'
import { LANGUAGES } from '@/lib/data'
import type {
  LanguageSubmitInput,
  LanguageMetadataUpdateInput,
} from '@/lib/validations'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// --- AUDIT LOGGING HELPER -------------------------------------------
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const db = getDb()
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const monthKey = now.slice(0, 7) // YYYY-MM

  try {
    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `AUDIT#${monthKey}`,
          SK: `${now}#${id}`,
          GSI1PK: 'AUDIT_LOG',
          GSI1SK: now,
          id,
          timestamp: now,
          ...entry,
        },
      })
    )
  } catch (err) {
    console.error('[Audit Log] Failed to write audit log entry:', err, entry)
  }
}

// --- UNIFIED LANGUAGE SUBMISSION ------------------------------------
export async function submitLanguageCanonical(payload: LanguageSubmitInput): Promise<{
  success: boolean
  languageId: string
  isExisting: boolean
  message?: string
  language?: Partial<Language>
}> {
  const db = getDb()
  const id = slugify(payload.name)
  const now = new Date().toISOString()

  if (!id) {
    throw new Error('Invalid language name resulted in an empty identifier.')
  }

  // Parse speakers number safely
  let speakerCount = 0
  if (typeof payload.estimatedSpeakers === 'number') {
    speakerCount = payload.estimatedSpeakers
  } else if (typeof payload.estimatedSpeakers === 'string') {
    const parsed = parseInt(payload.estimatedSpeakers.replace(/[^0-9]/g, ''), 10)
    speakerCount = isNaN(parsed) ? 0 : parsed
  }

  const tagsArray = Array.isArray(payload.tags)
    ? payload.tags
    : typeof payload.tags === 'string'
      ? payload.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

  const item: Language = {
    PK: `LANGUAGE#${id}`,
    SK: 'META',
    id,
    name: payload.name.trim(),
    nativeName: payload.nativeName?.trim() ?? '',
    region: payload.region.trim(),
    country: payload.country?.trim() ?? '',
    continent: payload.continent?.trim() ?? 'Global',
    family: payload.languageFamily?.trim() ?? '',
    iso: payload.isoCode?.trim().toLowerCase() ?? '',
    speakers: speakerCount,
    status: payload.vitalityStatus?.trim() ?? 'endangered',
    vitalityStatus: (payload.vitalityStatus?.trim() as any) ?? 'endangered',
    vitalityScore: 0,
    audioCount: 0,
    storiesArchived: 0,
    contributors: 1,
    description: payload.description?.trim() ?? '',
    tags: tagsArray,
    sources: payload.sources?.trim() ?? '',
    consent: payload.consent ?? true,
    contributorName: payload.contributorName?.trim() ?? 'Anonymous Contributor',
    contributorEmail: payload.contributorEmail?.trim().toLowerCase() ?? '',
    contributorRole: payload.contributorRole?.trim() ?? '',
    contributorLocation: payload.contributorLocation?.trim() ?? '',
    contributorRelationship: payload.contributorRelationship?.trim() ?? '',
    contributorBio: payload.contributorBio?.trim() ?? '',
    moderationStatus: 'PENDING',
    visibility: 'ADMIN_ONLY',
    moderationVersion: 1,
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
    schemaVersion: 2,
    // GSI1 for administrative & index queries
    GSI1PK: 'ALL_LANGUAGES',
    GSI1SK: now,
  } as any

  try {
    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item as any,
        ConditionExpression: 'attribute_not_exists(PK)',
      })
    )

    await logAuditEvent({
      action: 'SUBMIT_LANGUAGE',
      entityType: 'language',
      entityId: id,
      entityKey: { PK: `LANGUAGE#${id}`, SK: 'META' },
      actorId: payload.contributorEmail || 'anonymous',
      actorRole: 'contributor',
      newState: { name: item.name, region: item.region, moderationStatus: 'PENDING' },
      reason: 'New community language submission',
    })

    return {
      success: true,
      languageId: id,
      isExisting: false,
      message: `Language "${payload.name}" submitted successfully for preservation review.`,
      language: item,
    }
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'ConditionalCheckFailedException') {
      // Language already exists
      const existing = await getLanguageById(id, true)
      return {
        success: true,
        languageId: id,
        isExisting: true,
        message: `Language "${payload.name}" is already registered. You can attach recordings directly to it.`,
        language: existing ?? item,
      }
    }
    console.error('[Service languages.submitLanguageCanonical] PutCommand error:', err)
    throw err
  }
}

// --- PUBLIC READ QUERIES (STRICTLY APPROVED ONLY) -------------------
export async function getAllLanguages(): Promise<Language[]> {
  const db = getDb()

  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
        ExpressionAttributeValues: {
          ':sk': 'META',
          ':pkPrefix': 'LANGUAGE#',
        },
      })
    )

    const items = (result.Items ?? []) as Language[]
    
    // Filter strictly for approved languages in public views
    // If moderationStatus is missing, check if it is one of the original seeded languages
    const approved = items.filter((lang) => {
      if (lang.moderationStatus === 'APPROVED') return true
      if (!lang.moderationStatus && (lang.status !== 'PENDING_REVIEW' && lang.status !== 'pending')) {
        return true
      }
      return false
    })

    if (approved.length === 0) {
      return LANGUAGES
    }

    return approved.sort((a, b) => (a.vitalityScore ?? 0) - (b.vitalityScore ?? 0))
  } catch (err) {
    console.warn('[getAllLanguages] DynamoDB unavailable, returning static fallback:', err)
    return LANGUAGES
  }
}

export async function getLanguageById(id: string, allowAdmin = false): Promise<Language | null> {
  const db = getDb()

  try {
    const result = await db.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `LANGUAGE#${id}`,
          SK: 'META',
        },
      })
    )

    const item = (result.Item as Language) ?? null
    if (!item) {
      const fallback = LANGUAGES.find((l) => l.id === id) ?? null
      return fallback
    }

    if (!allowAdmin) {
      const isApproved =
        item.moderationStatus === 'APPROVED' ||
        (!item.moderationStatus && item.status !== 'PENDING_REVIEW' && item.status !== 'pending')
      if (!isApproved) return null
    }

    return item
  } catch (err) {
    console.warn('[getLanguageById] Error fetching language:', err)
    return LANGUAGES.find((l) => l.id === id) ?? null
  }
}

export async function getLanguageContributions(
  languageId: string,
  limit = 50,
  allowAdmin = false
): Promise<Contribution[]> {
  const db = getDb()

  try {
    const result = await db.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `LANGUAGE#${languageId}`,
          ':skPrefix': 'CONTRIBUTION#',
        },
        ScanIndexForward: false,
        Limit: limit,
      })
    )

    const items = (result.Items ?? []) as Contribution[]

    if (!allowAdmin) {
      // Filter strictly approved for public readers
      return items.filter((c) => c.moderationStatus === 'APPROVED' || c.verified === true)
    }

    return items
  } catch (err) {
    console.error('[getLanguageContributions] Query error:', err)
    return []
  }
}

// --- ADMIN QUERIES & MODERATION ACTIONS ------------------------------
export async function getAdminLanguagesList(params: {
  status?: string
  search?: string
  limit?: number
  cursor?: string
}): Promise<{ items: Language[]; nextCursor: string | null; totalEstimated: number }> {
  const db = getDb()
  const { status = 'ALL', search, limit = 50, cursor } = params

  let exclusiveStartKey: Record<string, unknown> | undefined
  if (cursor) {
    try {
      exclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
    } catch {
      // ignore
    }
  }

  const result = await db.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
      ExpressionAttributeValues: {
        ':sk': 'META',
        ':pkPrefix': 'LANGUAGE#',
      },
      ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
    })
  )

  let items = (result.Items ?? []) as Language[]

  // Normalize moderationStatus for any un-migrated items
  items = items.map((item) => {
    if (!item.moderationStatus) {
      if (item.status === 'PENDING_REVIEW' || item.status === 'pending') {
        item.moderationStatus = 'PENDING'
      } else {
        item.moderationStatus = 'APPROVED'
      }
    }
    return item
  })

  // Filter by status if requested
  if (status && status !== 'ALL') {
    items = items.filter((i) => (i.moderationStatus || '').toUpperCase() === status.toUpperCase())
  }

  // Filter by search query
  if (search && search.trim()) {
    const q = search.toLowerCase().trim()
    items = items.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.nativeName?.toLowerCase().includes(q) ||
        i.region?.toLowerCase().includes(q) ||
        i.country?.toLowerCase().includes(q) ||
        i.id?.toLowerCase().includes(q)
    )
  }

  const nextCursor = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
    : null

  return {
    items,
    nextCursor,
    totalEstimated: result.ScannedCount ?? items.length,
  }
}

export async function moderateLanguageAction(params: {
  languageId: string
  action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE' | 'RESTORE'
  reviewerId: string
  reason?: string
  expectedVersion?: number
}): Promise<Language> {
  const { languageId, action, reviewerId, reason = '', expectedVersion } = params
  const db = getDb()
  const now = new Date().toISOString()

  const current = await getLanguageById(languageId, true)
  if (!current) {
    throw new Error(`Language "${languageId}" not found.`)
  }

  let nextStatus: ModerationStatus = 'PENDING'
  let nextVisibility: 'PUBLIC' | 'ADMIN_ONLY' = 'ADMIN_ONLY'

  switch (action) {
    case 'APPROVE':
      nextStatus = 'APPROVED'
      nextVisibility = 'PUBLIC'
      break
    case 'REJECT':
      nextStatus = 'REJECTED'
      nextVisibility = 'ADMIN_ONLY'
      break
    case 'HIDE':
      nextStatus = 'HIDDEN'
      nextVisibility = 'ADMIN_ONLY'
      break
    case 'ARCHIVE':
      nextStatus = 'ARCHIVED'
      nextVisibility = 'ADMIN_ONLY'
      break
    case 'RESTORE':
      nextStatus = 'APPROVED'
      nextVisibility = 'PUBLIC'
      break
  }

  const newVersion = (current.moderationVersion ?? 1) + 1

  await db.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `LANGUAGE#${languageId}`,
        SK: 'META',
      },
      UpdateExpression: `
        SET moderationStatus = :status,
            visibility = :vis,
            moderationVersion = :ver,
            reviewedAt = :now,
            reviewedBy = :rev,
            reviewReason = :reason,
            updatedAt = :now
      `,
      ExpressionAttributeValues: {
        ':status': nextStatus,
        ':vis': nextVisibility,
        ':ver': newVersion,
        ':now': now,
        ':rev': reviewerId,
        ':reason': reason,
      },
    })
  )

  await logAuditEvent({
    action: `LANGUAGE_${action}`,
    entityType: 'language',
    entityId: languageId,
    entityKey: { PK: `LANGUAGE#${languageId}`, SK: 'META' },
    actorId: reviewerId,
    actorRole: 'admin',
    previousState: {
      moderationStatus: current.moderationStatus,
      visibility: current.visibility,
      moderationVersion: current.moderationVersion,
    },
    newState: {
      moderationStatus: nextStatus,
      visibility: nextVisibility,
      moderationVersion: newVersion,
    },
    reason,
  })

  // Revalidate frontend caches
  try {
    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/observatory')
    revalidatePath(`/language/${languageId}`)
    revalidatePath(`/observatory/${languageId}`)
  } catch (err) {
    console.warn('[moderateLanguageAction] Cache revalidation warning:', err)
  }

  return {
    ...current,
    moderationStatus: nextStatus,
    visibility: nextVisibility,
    moderationVersion: newVersion,
    reviewedAt: now,
    reviewedBy: reviewerId,
    reviewReason: reason,
  }
}

export async function updateLanguageMetadataFactual(params: {
  languageId: string
  updates: LanguageMetadataUpdateInput
  reviewerId: string
}): Promise<Language> {
  const { languageId, updates, reviewerId } = params
  const db = getDb()
  const now = new Date().toISOString()

  const current = await getLanguageById(languageId, true)
  if (!current) {
    throw new Error(`Language "${languageId}" not found.`)
  }

  const { reason, ...cleanUpdates } = updates

  await db.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `LANGUAGE#${languageId}`, SK: 'META' },
      UpdateExpression: `
        SET editedMetadata = :edits,
            adminNotes = :notes,
            updatedAt = :now,
            #n = :name,
            nativeName = :natName,
            region = :reg,
            country = :cntry,
            speakers = :spk,
            description = :desc
      `,
      ExpressionAttributeNames: {
        '#n': 'name',
      },
      ExpressionAttributeValues: {
        ':edits': cleanUpdates,
        ':notes': updates.adminNotes ?? current.adminNotes ?? '',
        ':now': now,
        ':name': updates.name ?? current.name,
        ':natName': updates.nativeName ?? current.nativeName ?? '',
        ':reg': updates.region ?? current.region,
        ':cntry': updates.country ?? current.country ?? '',
        ':spk': updates.speakers ?? current.speakers ?? 0,
        ':desc': updates.description ?? current.description ?? '',
      },
    })
  )

  await logAuditEvent({
    action: 'LANGUAGE_METADATA_UPDATE',
    entityType: 'metadata',
    entityId: languageId,
    entityKey: { PK: `LANGUAGE#${languageId}`, SK: 'META' },
    actorId: reviewerId,
    actorRole: 'admin',
    previousState: {
      name: current.name,
      region: current.region,
      speakers: current.speakers,
    },
    newState: cleanUpdates,
    reason,
  })

  try {
    revalidatePath(`/language/${languageId}`)
    revalidatePath(`/observatory/${languageId}`)
    revalidatePath('/explore')
  } catch {
    // ignore
  }

  const updated = await getLanguageById(languageId, true)
  return updated!
}

// --- CONTRIBUTION MODERATION & DELETION -----------------------------
export async function moderateContributionAction(params: {
  PK: string
  SK: string
  action: 'APPROVE' | 'REJECT' | 'HIDE' | 'ARCHIVE' | 'RESTORE'
  reviewerId: string
  reason?: string
  expectedVersion?: number
}): Promise<Contribution> {
  const { PK, SK, action, reviewerId, reason = '', expectedVersion } = params
  const db = getDb()
  const now = new Date().toISOString()

  const { Item: currentItem } = await db.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } })
  )

  if (!currentItem) {
    throw new Error('Contribution not found.')
  }

  const current = currentItem as Contribution
  const prevStatus = current.moderationStatus || (current.verified ? 'APPROVED' : 'PENDING')

  let nextStatus: ModerationStatus = 'PENDING'
  let nextVisibility: 'PUBLIC' | 'ADMIN_ONLY' = 'ADMIN_ONLY'
  let nextVerified = false

  switch (action) {
    case 'APPROVE':
      nextStatus = 'APPROVED'
      nextVisibility = 'PUBLIC'
      nextVerified = true
      break
    case 'REJECT':
      nextStatus = 'REJECTED'
      nextVisibility = 'ADMIN_ONLY'
      nextVerified = false
      break
    case 'HIDE':
      nextStatus = 'HIDDEN'
      nextVisibility = 'ADMIN_ONLY'
      nextVerified = false
      break
    case 'ARCHIVE':
      nextStatus = 'ARCHIVED'
      nextVisibility = 'ADMIN_ONLY'
      nextVerified = false
      break
    case 'RESTORE':
      nextStatus = 'APPROVED'
      nextVisibility = 'PUBLIC'
      nextVerified = true
      break
  }

  const newVersion = (current.moderationVersion ?? 1) + 1

  // 1. Update contribution
  await db.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: `
        SET moderationStatus = :status,
            visibility = :vis,
            verified = :verif,
            moderationVersion = :ver,
            reviewedAt = :now,
            reviewedBy = :rev,
            reviewReason = :reason,
            updatedAt = :now
      `,
      ExpressionAttributeValues: {
        ':status': nextStatus,
        ':vis': nextVisibility,
        ':verif': nextVerified,
        ':ver': newVersion,
        ':now': now,
        ':rev': reviewerId,
        ':reason': reason,
      },
    })
  )

  // 2. Adjust parent language counters atomically if status transitioned to/from APPROVED
  const languageId = (current.languageId as string) ?? PK.replace('LANGUAGE#', '')
  const isStory = current.type === 'story'
  const countField = isStory ? 'storiesArchived' : 'audioCount'

  if (prevStatus !== 'APPROVED' && nextStatus === 'APPROVED') {
    // Increment approved counts
    try {
      await db.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `LANGUAGE#${languageId}`, SK: 'META' },
          UpdateExpression: 'ADD #cf :inc, #cb :inc SET #lastUpdate = :now',
          ExpressionAttributeNames: {
            '#cf': countField,
            '#cb': 'contributors',
            '#lastUpdate': 'lastContribution',
          },
          ExpressionAttributeValues: { ':inc': 1, ':now': now },
        })
      )
    } catch (cntErr) {
      console.warn('[moderateContributionAction] Counter update failed:', cntErr)
    }
  } else if (prevStatus === 'APPROVED' && nextStatus !== 'APPROVED') {
    // Decrement approved counts
    try {
      await db.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `LANGUAGE#${languageId}`, SK: 'META' },
          UpdateExpression: 'ADD #cf :dec',
          ConditionExpression: '#cf > :zero',
          ExpressionAttributeNames: { '#cf': countField },
          ExpressionAttributeValues: { ':dec': -1, ':zero': 0 },
        })
      )
    } catch (cntErr) {
      console.warn('[moderateContributionAction] Counter decrement failed:', cntErr)
    }
  }

  // 3. Write audit log
  await logAuditEvent({
    action: `CONTRIBUTION_${action}`,
    entityType: 'contribution',
    entityId: current.id || SK,
    entityKey: { PK, SK },
    actorId: reviewerId,
    actorRole: 'admin',
    previousState: {
      moderationStatus: prevStatus,
      verified: current.verified,
    },
    newState: {
      moderationStatus: nextStatus,
      verified: nextVerified,
    },
    reason,
  })

  // Revalidate frontend
  try {
    revalidatePath('/')
    revalidatePath('/observatory')
    revalidatePath(`/observatory/${languageId}`)
    revalidatePath(`/language/${languageId}`)
  } catch {
    // ignore
  }

  return {
    ...current,
    moderationStatus: nextStatus,
    visibility: nextVisibility,
    verified: nextVerified,
    moderationVersion: newVersion,
    reviewedAt: now,
    reviewedBy: reviewerId,
  }
}

export async function permanentlyDeleteContribution(params: {
  PK: string
  SK: string
  reviewerId: string
  reason: string
}): Promise<{ success: boolean; message: string }> {
  const { PK, SK, reviewerId, reason } = params
  const db = getDb()

  const { Item: currentItem } = await db.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } })
  )

  if (!currentItem) {
    throw new Error('Contribution not found.')
  }

  const current = currentItem as Contribution
  const languageId = current.languageId || PK.replace('LANGUAGE#', '')

  // 1. Mark DELETION_PENDING
  await db.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: 'SET moderationStatus = :del, visibility = :vis',
      ExpressionAttributeValues: {
        ':del': 'DELETION_PENDING',
        ':vis': 'ADMIN_ONLY',
      },
    })
  )

  // 2. Delete S3 object if present
  const s3Key = current.audioS3Key || current.s3Key
  if (s3Key) {
    try {
      await getS3().send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: s3Key,
        })
      )
      console.info(`[permanentlyDeleteContribution] Deleted S3 audio: ${s3Key}`)
    } catch (s3Err) {
      console.error(`[permanentlyDeleteContribution] Failed to delete S3 key "${s3Key}":`, s3Err)
    }
  }

  // 3. Decrement counters if it was approved
  if (current.moderationStatus === 'APPROVED' || current.verified) {
    const isStory = current.type === 'story'
    const countField = isStory ? 'storiesArchived' : 'audioCount'
    try {
      await db.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `LANGUAGE#${languageId}`, SK: 'META' },
          UpdateExpression: 'ADD #cf :dec',
          ConditionExpression: '#cf > :zero',
          ExpressionAttributeNames: { '#cf': countField },
          ExpressionAttributeValues: { ':dec': -1, ':zero': 0 },
        })
      )
    } catch (cntErr) {
      console.warn('[permanentlyDeleteContribution] Counter decrement warning:', cntErr)
    }
  }

  // 4. Delete item from DynamoDB
  await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK, SK } }))

  // 5. Audit log
  await logAuditEvent({
    action: 'CONTRIBUTION_PERMANENT_DELETE',
    entityType: 'contribution',
    entityId: current.id || SK,
    entityKey: { PK, SK },
    actorId: reviewerId,
    actorRole: 'admin',
    previousState: {
      title: current.title,
      languageId,
      s3Key,
    },
    reason,
  })

  // Revalidate frontend
  try {
    revalidatePath('/')
    revalidatePath('/observatory')
    revalidatePath(`/observatory/${languageId}`)
    revalidatePath(`/language/${languageId}`)
  } catch {
    // ignore
  }

  return { success: true, message: 'Contribution and associated audio permanently deleted.' }
}
