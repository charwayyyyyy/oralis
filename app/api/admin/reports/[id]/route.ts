import { NextRequest, NextResponse } from 'next/server'
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { moderateContributionAction, permanentlyDeleteContribution, logAuditEvent } from '@/lib/services/languages'
import { ReportResolveSchema } from '@/lib/validations'

export const runtime = 'nodejs'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, props: Props) {
  return handleReportResolution(req, props)
}

export async function PATCH(req: NextRequest, props: Props) {
  return handleReportResolution(req, props)
}

async function handleReportResolution(req: NextRequest, { params }: Props) {
  let session
  try {
    session = await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const { id } = await params

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ReportResolveSchema.safeParse(raw)
  if (!parsed.success) {
    const err = parsed.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0 
      ? issues.map((e: any) => e.message).join(', ') 
      : (err?.message || 'Validation failed')
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  const resolvedAction = parsed.data.action || parsed.data.status || 'RESOLVED'
  const action = resolvedAction.toUpperCase()
  const notes = parsed.data.notes
  const db = getDb()
  const now = new Date().toISOString()

  try {
    const { Item: report } = await db.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { PK: `REPORT#${id}`, SK: 'META' } })
    )

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const nextStatus = (action === 'DISMISS' || action === 'DISMISSED') ? 'DISMISSED' : 'RESOLVED'

    // If target action requested:
    if (action === 'RESOLVE_AND_HIDE' && report.targetType === 'contribution' && report.targetPK && report.targetSK) {
      await moderateContributionAction({
        PK: report.targetPK,
        SK: report.targetSK,
        action: 'HIDE',
        reviewerId: session.sub,
        reason: `Report #${id} resolved: ${notes || report.reason}`,
      })
    } else if (action === 'RESOLVE_AND_DELETE' && report.targetType === 'contribution' && report.targetPK && report.targetSK) {
      await permanentlyDeleteContribution({
        PK: report.targetPK,
        SK: report.targetSK,
        reviewerId: session.sub,
        reason: `Report #${id} resolved with permanent deletion: ${notes || report.reason}`,
      })
    }

    // Update report
    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `REPORT#${id}`, SK: 'META' },
        UpdateExpression: `
          SET #s = :status,
              resolvedAt = :now,
              resolvedBy = :rev,
              resolutionAction = :act,
              resolutionNotes = :notes
        `,
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':status': nextStatus,
          ':now': now,
          ':rev': session.sub,
          ':act': action,
          ':notes': notes || '',
        },
      })
    )

    await logAuditEvent({
      action: `REPORT_${action}`,
      entityType: 'report',
      entityId: id,
      entityKey: { PK: `REPORT#${id}`, SK: 'META' },
      actorId: session.sub,
      actorRole: 'admin',
      previousState: { status: report.status },
      newState: { status: nextStatus, resolutionAction: action },
      reason: notes || `Report resolved with ${action}`,
    })

    return NextResponse.json({
      success: true,
      message: `Report ${id} marked as ${nextStatus}.`,
    })
  } catch (err) {
    console.error(`[API /api/admin/reports/${id}] Error:`, err)
    return NextResponse.json({ error: 'Failed to update report status' }, { status: 500 })
  }
}
