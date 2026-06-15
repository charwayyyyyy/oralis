/**
 * app/api/language/list/route.ts
 *
 * GET /api/language/list
 * Fetches all saved languages from DynamoDB.
 * Uses GSI1 to efficiently get all languages sorted by creation time.
 */

import { NextResponse } from 'next/server'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'
// Ensure this is dynamic so it's always up to date
export const fetchCache = 'force-no-store'

export async function GET() {
  console.info(`[API /language/list] Fetching all languages via GSI1`)

  try {
    const db = getDb()
    const startTime = Date.now()

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'ALL_LANGUAGES',
      },
      ScanIndexForward: false, // Descending (newest languages first)
    })

    const result = await db.send(command)
    const durationMs = Date.now() - startTime

    const languages = result.Items?.map((item) => ({
      id: item.id,
      name: item.name,
      nativeName: item.nativeName,
      region: item.region,
      country: item.country,
      vitalityScore: item.vitalityScore,
      speakers: item.speakers,
      createdAt: item.createdAt,
    })) || []

    console.info(`[API /language/list] Successfully fetched ${languages.length} languages`, { durationMs })

    return NextResponse.json({
      success: true,
      languages,
      count: languages.length,
    })
  } catch (error) {
    console.error(`[API /language/list] DynamoDB Query Failed:`, error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    )
  }
}
