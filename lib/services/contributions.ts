/**
 * lib/services/contributions.ts
 *
 * DynamoDB service for Contribution records and Language Registrations.
 * Server-side only.
 *
 * Single-table design:
 *   Contribution write:
 *     PK = LANG#<languageId>  SK = CONTRIB#<ISO>#<id>  → language partition
 *     PK = USER#<email>       SK = CONTRIB#<ISO>#<id>  → user partition
 *     (written as a TransactWrite for atomicity)
 *
 *   New language registration:
 *     PK = NEWLANG#<ISO>      SK = REG#<email>
 */

import {
  TransactWriteCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import type { Contribution } from '@/lib/data'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContributionPayload {
  languageId:         string
  languageName:       string
  type:               'vocabulary' | 'story' | 'audio' | 'cultural-context'
  title:              string
  body?:              string
  context:            string
  source?:            string
  location?:          string
  contributorName?:   string
  contributorEmail?:  string
  audioS3Key?:        string   // set if audio was uploaded
  audioBucket?:       string
}

export interface LanguageRegistrationPayload {
  contributorName:         string
  contributorEmail:        string
  contributorRole:         string
  contributorLocation:     string
  contributorRelationship: string
  contributorBio:          string
  languageName:            string
  nativeName:              string
  isoCode:                 string
  country:                 string
  region:                  string
  continent:               string
  languageFamily:          string
  estimatedSpeakers:       string
  vitalityStatus:          string
  description:             string
  tags:                    string
  sources:                 string
  consent:                 boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simple nano-ID without external dependency */
function nanoid(len = 12): string {
  return Math.random().toString(36).slice(2, 2 + len).padEnd(len, '0')
}

// ─── Contributions ────────────────────────────────────────────────────────────

/**
 * Write a contribution atomically to BOTH the language partition
 * AND the user partition using DynamoDB TransactWrite.
 * Returns the generated contribution ID.
 */
export async function putContribution(payload: ContributionPayload): Promise<string> {
  const db  = getDb()
  const id  = nanoid()
  const iso = new Date().toISOString()
  const sk  = `CONTRIB#${iso}#${id}`

  const item = {
    id,
    sk,
    languageId:        payload.languageId,
    languageName:      payload.languageName,
    type:              payload.type,
    title:             payload.title,
    body:              payload.body,
    context:           payload.context,
    source:            payload.source,
    location:          payload.location,
    contributorName:   payload.contributorName,
    contributorEmail:  payload.contributorEmail,
    audioS3Key:        payload.audioS3Key,
    audioBucket:       payload.audioBucket,
    verified:          false,
    createdAt:         iso,
  }

  const transactItems = [
    // Write 1 — language partition
    {
      Put: {
        TableName: TABLE_NAME,
        Item: {
          PK: `LANG#${payload.languageId}`,
          SK: sk,
          ...item,
        },
      },
    },
  ]

  // Write 2 — user partition (only if email provided)
  if (payload.contributorEmail) {
    transactItems.push({
      Put: {
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${payload.contributorEmail.toLowerCase()}`,
          SK: sk,
          ...item,
        },
      },
    })
  }

  await db.send(new TransactWriteCommand({ TransactItems: transactItems }))

  return id
}

/**
 * Query all contributions made by a user (email).
 */
export async function getUserContributions(
  email: string,
  limit = 50,
): Promise<Contribution[]> {
  const db = getDb()

  const result = await db.send(
    new QueryCommand({
      TableName:              TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk':       `USER#${email.toLowerCase()}`,
        ':skPrefix': 'CONTRIB#',
      },
      ScanIndexForward: false, // newest first
      Limit:            limit,
    }),
  )

  return (result.Items ?? []) as Contribution[]
}

// ─── Language Registration ────────────────────────────────────────────────────

/**
 * Store a new language registration in the review queue.
 * PK = NEWLANG#<ISO>  SK = REG#<email>
 */
export async function putLanguageRegistration(
  payload: LanguageRegistrationPayload,
): Promise<void> {
  const db  = getDb()
  const iso = new Date().toISOString()

  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK:        `NEWLANG#${iso}`,
        SK:        `REG#${payload.contributorEmail.toLowerCase()}`,
        status:    'PENDING_REVIEW',
        createdAt: iso,
        ...payload,
      },
    }),
  )
}
