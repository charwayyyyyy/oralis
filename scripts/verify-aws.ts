import { config } from 'dotenv'
import { resolve } from 'path'
import { S3Client, HeadBucketCommand, GetBucketCorsCommand, GetBucketPolicyCommand, PutBucketCorsCommand, PutBucketPolicyCommand, PutPublicAccessBlockCommand } from '@aws-sdk/client-s3'
import { DynamoDBClient, DescribeTableCommand, CreateTableCommand, BillingMode } from '@aws-sdk/client-dynamodb'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const REGION = process.env.AWS_REGION || 'us-east-1'
const DYNAMO_TABLE = process.env.DYNAMODB_TABLE || 'oralis-production'
const S3_BUCKET = process.env.S3_BUCKET || 'oralis-media-prod-001'

const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY 
  ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  : undefined

if (!credentials) {
  console.error("❌ ERROR: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required in .env.local")
  process.exit(1)
}

const s3 = new S3Client({ region: REGION, credentials })
const dynamo = new DynamoDBClient({ region: REGION, credentials })

async function verifyAWS() {
  console.log(`\n🔍 Starting AWS Configuration Verification for ORALIS\n`)
  console.log(`Region: ${REGION}`)
  console.log(`DynamoDB Table: ${DYNAMO_TABLE}`)
  console.log(`S3 Bucket: ${S3_BUCKET}\n`)

  // --- S3 Check ---
  console.log(`[1] Verifying S3 Bucket...`)
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }))
    console.log(`✅ S3 Bucket '${S3_BUCKET}' exists and is accessible.`)
  } catch (error: any) {
    if (error.name === 'NotFound') {
      console.error(`❌ S3 Bucket '${S3_BUCKET}' not found in region ${REGION}.`)
    } else {
      console.error(`❌ S3 Bucket Access Error:`, error.message)
    }
    process.exit(1)
  }

  // --- DynamoDB Check ---
  console.log(`\n[2] Verifying DynamoDB Table...`)
  try {
    const tableData = await dynamo.send(new DescribeTableCommand({ TableName: DYNAMO_TABLE }))
    const table = tableData.Table
    
    console.log(`✅ Table '${DYNAMO_TABLE}' exists. Status: ${table?.TableStatus}`)
    
    const pk = table?.KeySchema?.find(k => k.KeyType === 'HASH')?.AttributeName
    const sk = table?.KeySchema?.find(k => k.KeyType === 'RANGE')?.AttributeName
    console.log(`   Primary Key: ${pk} (HASH), ${sk} (RANGE)`)
    
    if (pk !== 'PK' || sk !== 'SK') {
      console.warn(`⚠️ Warning: Expected PK=PK and SK=SK. Found PK=${pk}, SK=${sk}`)
    } else {
      console.log(`✅ Primary Key Schema is correct.`)
    }

    const gsi1 = table?.GlobalSecondaryIndexes?.find(gsi => gsi.IndexName === 'GSI1')
    if (gsi1) {
      const gsiPk = gsi1.KeySchema?.find(k => k.KeyType === 'HASH')?.AttributeName
      const gsiSk = gsi1.KeySchema?.find(k => k.KeyType === 'RANGE')?.AttributeName
      console.log(`✅ GSI1 exists. Keys: ${gsiPk} (HASH), ${gsiSk} (RANGE)`)
    } else {
      console.warn(`⚠️ Warning: GSI1 index is missing! The Feed API will not work.`)
    }

  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.error(`❌ DynamoDB Table '${DYNAMO_TABLE}' not found.`)
    } else {
      console.error(`❌ DynamoDB Error:`, error.message)
    }
    process.exit(1)
  }

  console.log(`\n✨ AWS Configuration Verification Complete. Everything looks good!`)
}

verifyAWS()
