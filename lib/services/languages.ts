/**
 * lib/services/languages.ts
 *
 * DynamoDB service for Language records.
 * Server-side only — never import in 'use client' components.
 *
 * Single-table design:
 *   PK = LANG#<id>   SK = META        → language metadata
 *   PK = LANG#<id>   SK = CONTRIB#... → contributions (queried separately)
 *   PK = LANG#<id>   SK = AUDIO#...   → audio metadata
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

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Scan the table for all language metadata records.
 * Filter: SK = "META" and PK begins_with "LANG#"
 *
 * For production at scale, replace with a GSI query.
 */
export async function getAllLanguages(): Promise<Language[]> {
  const db = getDb()

  const result = await db.send(
    new ScanCommand({
      TableName:        TABLE_NAME,
      FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
      ExpressionAttributeValues: {
        ':sk':       'META',
        ':pkPrefix': 'LANG#',
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
        PK: `LANG#${id}`,
        SK: 'META',
      },
    }),
  )

  return (result.Item as Language) ?? null
}

/**
 * Fetch all contributions for a given language.
 * SK begins_with "CONTRIB#" — sorted chronologically (newest last).
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
        ':pk':       `LANG#${languageId}`,
        ':skPrefix': 'CONTRIB#',
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
        PK: `LANG#${lang.id}`,
        SK: 'META',
        // GSI attributes for future continent-based queries
        GSI1PK: lang.continent,
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
                PK:     `LANG#${lang.id}`,
                SK:     'META',
                GSI1PK: lang.continent,
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
