import * as dotenv from 'dotenv'
import * as path   from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { getDb, TABLE_NAME } from '../lib/aws/dynamodb'
import { ScanCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

async function run() {
  console.log('Starting data remediation...')
  const db = getDb()

  // 1. Scan to find all languages
  console.log('Scanning for languages...')
  const scanResult = await db.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
      ExpressionAttributeValues: {
        ':sk': 'META',
        ':pkPrefix': 'LANGUAGE#',
      },
    })
  )

  const languages = scanResult.Items || []
  console.log(`Found ${languages.length} languages.`)

  // 2. Query all contributions
  console.log('Querying all contributions from FEED...')
  let lastEvaluatedKey: Record<string, any> | undefined = undefined
  const allContributions: any[] = []
  
  do {
    const queryResult: any = await db.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
          ':pk': 'FEED',
        },
        ExclusiveStartKey: lastEvaluatedKey,
      })
    )
    if (queryResult.Items) {
      allContributions.push(...queryResult.Items)
    }
    lastEvaluatedKey = queryResult.LastEvaluatedKey
  } while (lastEvaluatedKey)

  console.log(`Found ${allContributions.length} total contributions.`)

  // 3. Tally contributions by language
  const tally: Record<string, { audioCount: number; storiesArchived: number }> = {}
  languages.forEach((l) => {
    tally[l.id] = { audioCount: 0, storiesArchived: 0 }
  })

  allContributions.forEach((c) => {
    if (!tally[c.languageId]) {
      tally[c.languageId] = { audioCount: 0, storiesArchived: 0 }
    }
    if (c.type === 'story') {
      tally[c.languageId].storiesArchived += 1
    } else {
      tally[c.languageId].audioCount += 1
    }
  })

  console.log('Calculated tallies:', tally)

  // 4. Update all languages with true counts
  console.log('Updating languages in DynamoDB...')
  for (const lang of languages) {
    const langId = lang.id
    const actualAudioCount = tally[langId]?.audioCount || 0
    const actualStoriesArchived = tally[langId]?.storiesArchived || 0

    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `LANGUAGE#${langId}`,
          SK: 'META',
        },
        UpdateExpression: 'SET audioCount = :a, storiesArchived = :s, contributors = :c',
        ExpressionAttributeValues: {
          ':a': actualAudioCount,
          ':s': actualStoriesArchived,
          ':c': actualAudioCount > 0 ? 1 : 0, // simple heuristic
        },
      })
    )
    console.log(`Updated ${langId}: audio=${actualAudioCount}, stories=${actualStoriesArchived}`)
  }

  console.log('Remediation complete!')
}

run().catch((err) => {
  console.error('Failed to run remediation:', err)
  process.exit(1)
})
