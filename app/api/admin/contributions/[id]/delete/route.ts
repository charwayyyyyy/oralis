import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { permanentlyDeleteContribution } from '@/lib/services/languages'

export const runtime = 'nodejs'

interface Props {
  params: Promise<{ id: string }>
}

export async function DELETE(req: NextRequest, { params }: Props) {
  let session
  try {
    session = await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const { id } = await params

  let body: { PK?: string; SK?: string; reason?: string; confirmationText?: string } = {}
  try {
    body = await req.json()
  } catch {
    // Body optional
  }

  const { reason = 'Administrative permanent deletion' } = body

  let PK = body.PK
  let SK = body.SK

  if (!PK || !SK) {
    const db = getDb()
    const scan = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '(id = :id OR SK = :id OR contains(SK, :id)) AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':id': id,
          ':skPrefix': 'CONTRIBUTION',
        },
        Limit: 10,
      })
    )
    const found = scan.Items?.[0]
    if (!found) {
      return NextResponse.json({ error: 'Contribution record not found' }, { status: 404 })
    }
    PK = found.PK as string
    SK = found.SK as string
  }

  if (!PK || !SK) {
    return NextResponse.json({ error: 'Valid PK and SK are required for permanent deletion' }, { status: 400 })
  }

  try {
    const result = await permanentlyDeleteContribution({
      PK,
      SK,
      reviewerId: session.sub,
      reason,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error(`[API /api/admin/contributions/${id}/delete] Error:`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to permanently delete contribution' },
      { status: 500 }
    )
  }
}
