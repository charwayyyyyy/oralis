import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { moderateContributionAction } from '@/lib/services/languages'
import { ContributionModerationSchema } from '@/lib/validations'

export const runtime = 'nodejs'

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Props) {
  let session
  try {
    session = await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const { id } = await params

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ContributionModerationSchema.safeParse(body)
  if (!parsed.success) {
    const err = parsed.error as any
    const issues = err?.issues || err?.errors || []
    const messages = issues.length > 0 
      ? issues.map((e: any) => e.message).join(', ') 
      : (err?.message || 'Validation failed')
    return NextResponse.json({ error: messages }, { status: 400 })
  }

  let PK = body.PK
  let SK = body.SK

  // If PK and SK not provided, find by id
  if (!PK || !SK) {
    const db = getDb()
    const scan = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'id = :id AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':id': id,
          ':skPrefix': 'CONTRIBUTION',
        },
        Limit: 1,
      })
    )
    const found = scan.Items?.[0]
    if (!found) {
      return NextResponse.json({ error: 'Contribution record not found' }, { status: 404 })
    }
    PK = found.PK
    SK = found.SK
  }

  const { action, reason, expectedVersion } = parsed.data

  try {
    const updated = await moderateContributionAction({
      PK,
      SK,
      action,
      reviewerId: session.sub,
      reason,
      expectedVersion,
    })

    return NextResponse.json({
      success: true,
      message: `Contribution state updated to ${action}.`,
      contribution: updated,
    })
  } catch (err) {
    console.error(`[API /api/admin/contributions/${id}/moderation] Error:`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update contribution moderation state' },
      { status: 500 }
    )
  }
}
