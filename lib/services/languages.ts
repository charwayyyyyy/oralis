/**
 * lib/services/languages.ts
 *
 * DynamoDB service for Language records.
 * Server-side only — never import in 'use client' components.
 *
 * Single-table design:
 *   PK = LANGUAGE#<id>   SK = META        → language metadata
 *   PK = LANGUAGE#<id>   SK = CONTRIBUTION#... → contributions (queried separately)
 */

import {
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import type { Language, Contribution } from '@/lib/data'

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

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Scan the table for all language metadata records.
 * Filter: SK = "META" and PK begins_with "LANGUAGE#"
 *
 * For production at scale, replace with a GSI query on GSI1PK="ALL_LANGUAGES".
 */
export async function getAllLanguages(): Promise<Language[]> {
  const db = getDb()

  const result = await db.send(
    new ScanCommand({
      TableName:        TABLE_NAME,
      FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
      ExpressionAttributeValues: {
        ':sk':       'META',
        ':pkPrefix': 'LANGUAGE#',
      },
    }),
  )

  return ((result.Items ?? []) as Language[]).sort(
    (a, b) => a.vitalityScore - b.vitalityScore, // most at risk first
  )
}

/**
 * Fetch a single language by its ID slug (e.g. "ainu").
 */
export async function getLanguageById(id: string): Promise<Language | null> {
  const db = getDb()

  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `LANGUAGE#${id}`,
        SK: 'META',
      },
    }),
  )

  return (result.Item as Language) ?? null
}

/**
 * Fetch all contributions for a given language.
 * SK begins_with "CONTRIBUTION#" — sorted chronologically (newest last).
 */
export async function getLanguageContributions(
  languageId: string,
  limit = 50,
): Promise<Contribution[]> {
  const db = getDb()

  const result = await db.send(
    new QueryCommand({
      TableName:              TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk':       `LANGUAGE#${languageId}`,
        ':skPrefix': 'CONTRIBUTION#',
      },
      ScanIndexForward: false, // newest first
      Limit:            limit,
    }),
  )

  return (result.Items ?? []) as Contribution[]
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Upsert a language record.
 * Used by the seeding script and (eventually) the curator approval flow.
 */
export async function putLanguage(lang: Language): Promise<void> {
  const db = getDb()

  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `LANGUAGE#${lang.id}`,
        SK: 'META',
        // GSI attributes for future continent-based queries
        GSI1PK: lang.continent || 'ALL_LANGUAGES',
        GSI1SK: lang.vitalityScore,
        // Spread the full language object
        ...lang,
      },
    }),
  )
}

/**
 * Batch write all languages (used by seeding script).
 * DynamoDB BatchWrite supports up to 25 items per call.
 */
export async function batchPutLanguages(languages: Language[]): Promise<void> {
  const db    = getDb()
  const CHUNK = 25

  for (let i = 0; i < languages.length; i += CHUNK) {
    const chunk = languages.slice(i, i + CHUNK)

    await db.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: chunk.map((lang) => ({
            PutRequest: {
              Item: {
                PK:     `LANGUAGE#${lang.id}`,
                SK:     'META',
                GSI1PK: lang.continent || 'ALL_LANGUAGES',
                GSI1SK: lang.vitalityScore,
                ...lang,
              },
            },
          })),
        },
      }),
    )
  }
}

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
