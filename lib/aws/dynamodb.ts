/**
 * lib/aws/dynamodb.ts
 *
 * Singleton DynamoDB DocumentClient.
 * All credentials come from process.env — never from the browser.
 * Import this ONLY in server-side code (API routes, Server Components).
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

function createClient(): DynamoDBDocumentClient {
  const region = process.env.AWS_REGION ?? 'us-east-1'

  // In production, credentials are provided via IAM role or env vars
  const raw = new DynamoDBClient({
    region,
    ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          credentials: {
            accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }
      : {}),
  })

  return DynamoDBDocumentClient.from(raw, {
    marshallOptions: {
      // Remove undefined values automatically
      removeUndefinedValues: true,
      convertEmptyValues: false,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  })
}

// Singleton — reuse across Lambda warm invocations
let client: DynamoDBDocumentClient | null = null

export function getDb(): DynamoDBDocumentClient {
  if (!client) client = createClient()
  return client
}

export const TABLE_NAME = process.env.DYNAMODB_TABLE ?? 'oralis-production'
