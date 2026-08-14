/**
 * app/api/report/create/route.ts
 *
 * POST /api/report/create
 * Public endpoint to report a contribution or language for administrative review.
 */

import { NextRequest, NextResponse } from 'next/server'
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { rateLimit } from '@/lib/rate-limit'
import { ContentReportCreateSchema } from '@/lib/validations'
import { logAuditEvent } from '@/lib/services/languages'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 5, 300_000) // max 5 reports per 5 minutes
  if (limited) return limited

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ContentReportCreateSchema.safeParse(raw)
  if (!parsed.success) {
    const err = parsed.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0 
      ? issues.map((e: any) => e.message).join(', ') 
      : (err?.message || 'Validation failed')
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  const { targetType, targetId, targetPK, targetSK, targetTitle, languageId, reason, explanation } = parsed.data
  const reportId = crypto.randomUUID()
  const now = new Date().toISOString()
  const db = getDb()

  const reportItem = {
    PK: `REPORT#${reportId}`,
    SK: 'META',
    GSI1PK: 'REPORTS_OPEN',
    GSI1SK: now,
    id: reportId,
    targetType,
    targetId,
    targetPK,
    targetSK,
    targetTitle: targetTitle ?? '',
    languageId: languageId ?? '',
    reason,
    explanation: explanation ?? '',
    status: 'OPEN',
    createdAt: now,
  }

  try {
    // 1. Save the report item
    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: reportItem,
      })
    )

    // 2. If target is contribution, increment reportCount
    if (targetType === 'contribution' && targetPK && targetSK) {
      try {
        await db.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: targetPK, SK: targetSK },
            UpdateExpression: 'ADD reportCount :inc',
            ExpressionAttributeValues: { ':inc': 1 },
          })
        )
      } catch (cntErr) {
        console.warn('[API /report/create] Target update non-fatal warning:', cntErr)
      }
    }

    // 3. Write audit log
    await logAuditEvent({
      action: 'SUBMIT_REPORT',
      entityType: 'report',
      entityId: reportId,
      entityKey: { PK: reportItem.PK, SK: reportItem.SK },
      actorId: 'anonymous:reporter',
      actorRole: 'public',
      newState: { targetId, targetType, reason, status: 'OPEN' },
      reason: `User report: ${reason}`,
    })

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Thank you for maintaining archive integrity. Your report has been submitted to the moderation team.',
    }, { status: 201 })
  } catch (err) {
    console.error('[API /report/create] Error:', err)
    return NextResponse.json({ error: 'Failed to submit report. Please try again.' }, { status: 500 })
  }
}
