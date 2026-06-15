/**
 * scripts/seed-dynamodb.ts
 *
 * One-time seeding script — writes all 8 languages from lib/data.ts
 * into DynamoDB as LANG#<id> / META items.
 *
 * Run ONCE after creating the DynamoDB table:
 *   npx ts-node --project tsconfig.json scripts/seed-dynamodb.ts
 *
 * Prerequisites:
 *   - .env.local must exist with AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 *     AWS_REGION, DYNAMODB_TABLE
 *   - DynamoDB table 'oralis-production' must exist (PK, SK both String)
 */

import * as dotenv from 'dotenv'
import * as path   from 'path'

// Load .env.local before importing any AWS modules
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { LANGUAGES } from '../lib/data'

const TABLE  = process.env.DYNAMODB_TABLE ?? 'oralis-production'
const REGION = process.env.AWS_REGION    ?? 'us-east-1'

async function seed() {
  console.log(`\n🌍  Oralis DynamoDB Seed Script`)
  console.log(`   Table:  ${TABLE}`)
  console.log(`   Region: ${REGION}`)
  console.log(`   Items:  ${LANGUAGES.length} languages\n`)

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌  AWS credentials not found in environment.')
    console.error('    Ensure .env.local contains AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.')
    process.exit(1)
  }

  const raw = new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const db = DynamoDBDocumentClient.from(raw, {
    marshallOptions: { removeUndefinedValues: true },
  })

  const CHUNK = 25 // DynamoDB BatchWrite max

  for (let i = 0; i < LANGUAGES.length; i += CHUNK) {
    const chunk = LANGUAGES.slice(i, i + CHUNK)

    const result = await db.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE]: chunk.map((lang) => ({
            PutRequest: {
              Item: {
                PK:     `LANGUAGE#${lang.id}`,
                SK:     'META',
                // GSI for global sorting
                GSI1PK: 'ALL_LANGUAGES',
                GSI1SK: new Date().toISOString(),
                // Full language object
                ...lang,
              },
            },
          })),
        },
      }),
    )

    const unprocessed = result.UnprocessedItems?.[TABLE]?.length ?? 0
    if (unprocessed > 0) {
      console.warn(`  ⚠  ${unprocessed} items were not processed. Retry them manually.`)
    }

    console.log(`  ✓  Wrote items ${i + 1}–${Math.min(i + CHUNK, LANGUAGES.length)}`)
  }

  console.log('\n✅  Seed complete.\n')
  console.log('Next steps:')
  console.log('  1. Open the DynamoDB console and verify 8 LANG#*/META items exist.')
  console.log('  2. Deploy to Vercel — the Explore page will now read from DynamoDB.')
  console.log('  3. Submit a test contribution and check the table for CONTRIB# items.\n')
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
