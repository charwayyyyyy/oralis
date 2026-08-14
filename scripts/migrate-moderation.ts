import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const TABLE = process.env.DYNAMODB_TABLE || 'oralis'
const REGION = process.env.AWS_REGION || 'us-east-1'

const isExecute = process.argv.includes('--execute')

async function migrate() {
  console.log(`\n?? Oralis Moderation Schema Migration`)
  console.log(`   Table:  ${TABLE}`)
  console.log(`   Region: ${REGION}`)
  console.log(`   Mode:   ${isExecute ? '? LIVE EXECUTE' : '?? DRY RUN (pass --execute to write changes)'}\n`)

  const raw = new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const db = DynamoDBDocumentClient.from(raw, {
    marshallOptions: { removeUndefinedValues: true },
  })

  // 1. Scan Languages
  console.log('1. Scanning language records (SK = META)...')
  const langScan = await db.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
      ExpressionAttributeValues: {
        ':sk': 'META',
        ':pkPrefix': 'LANGUAGE#',
      },
    })
  )
  const languages = langScan.Items || []
  console.log(`   Found ${languages.length} language records.\n`)

  let langApprovedCount = 0
  let langPendingCount = 0

  for (const lang of languages) {
    const isPending = lang.status === 'PENDING_REVIEW' || lang.status === 'pending'
    const targetStatus = isPending ? 'PENDING' : 'APPROVED'
    const targetVisibility = isPending ? 'ADMIN_ONLY' : 'PUBLIC'

    if (isPending) langPendingCount++
    else langApprovedCount++

    console.log(`   - Language "${lang.name}" (${lang.id}): currently status="${lang.status}", moderationStatus="${lang.moderationStatus || 'none'}" -> target: ${targetStatus}`)

    if (isExecute) {
      await db.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { PK: lang.PK, SK: lang.SK },
          UpdateExpression: 'SET moderationStatus = :ms, visibility = :vis, moderationVersion = if_not_exists(moderationVersion, :ver), schemaVersion = :sv',
          ExpressionAttributeValues: {
            ':ms': targetStatus,
            ':vis': targetVisibility,
            ':ver': 1,
            ':sv': 2,
          },
        })
      )
    }
  }

  // 2. Scan Contributions
  console.log('\n2. Scanning contribution records...')
  const contribScan = await db.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':skPrefix': 'CONTRIBUTION',
      },
    })
  )
  const contributions = contribScan.Items || []
  console.log(`   Found ${contributions.length} contribution records.\n`)

  let contribPendingCount = 0
  let contribApprovedCount = 0

  for (const contrib of contributions) {
    const isApproved = contrib.verified === true
    const targetStatus = isApproved ? 'APPROVED' : 'PENDING'
    const targetVisibility = isApproved ? 'PUBLIC' : 'ADMIN_ONLY'

    if (isApproved) contribApprovedCount++
    else contribPendingCount++

    console.log(`   - Contribution "${contrib.title || contrib.id}" (${contrib.languageId}): verified=${contrib.verified}, moderationStatus="${contrib.moderationStatus || 'none'}" -> target: ${targetStatus}`)

    if (isExecute) {
      await db.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { PK: contrib.PK, SK: contrib.SK },
          UpdateExpression: 'SET moderationStatus = :ms, visibility = :vis, moderationVersion = if_not_exists(moderationVersion, :ver), schemaVersion = :sv',
          ExpressionAttributeValues: {
            ':ms': targetStatus,
            ':vis': targetVisibility,
            ':ver': 1,
            ':sv': 2,
          },
        })
      )
    }
  }

  console.log(`\n========================================`)
  console.log(`Migration Summary:`)
  console.log(`- Total Languages: ${languages.length} (${langApprovedCount} approved, ${langPendingCount} pending)`)
  console.log(`- Total Contributions: ${contributions.length} (${contribApprovedCount} approved, ${contribPendingCount} pending)`)
  console.log(`- Action Taken: ${isExecute ? 'APPLIED TO DYNAMODB ?' : 'DRY RUN ONLY (no records modified)'}`)
  console.log(`========================================\n`)
}

migrate().catch(console.error)
