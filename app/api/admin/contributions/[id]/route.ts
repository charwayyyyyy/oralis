import { NextRequest, NextResponse } from 'next/server'
import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { getPresignedDownloadUrl } from '@/lib/aws/s3'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const { id } = await params
  const url = new URL(req.url)
  const pkParam = url.searchParams.get('pk')
  const skParam = url.searchParams.get('sk')

  const db = getDb()

  try {
    let item: any = null

    if (pkParam && skParam) {
      const res = await db.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: pkParam, SK: skParam } }))
      item = res.Item
    } else {
      // Find by id
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
      item = scan.Items?.[0]
    }

    if (!item) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    const s3Key = item.audioS3Key || item.s3Key
    let audioUrl = item.audioUrl
    if (s3Key && !audioUrl) {
      try {
        audioUrl = await getPresignedDownloadUrl(s3Key as string)
      } catch (err) {
        console.warn('[Admin Contribution Detail] Failed to sign URL:', s3Key, err)
      }
    }

    return NextResponse.json({
      success: true,
      contribution: {
        ...item,
        audioUrl,
      },
    })
  } catch (err) {
    console.error(`[API /api/admin/contributions/${id}] Error:`, err)
    return NextResponse.json({ error: 'Failed to fetch contribution' }, { status: 500 })
  }
}
