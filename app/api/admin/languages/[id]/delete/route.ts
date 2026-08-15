import { NextRequest, NextResponse } from 'next/server'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { getLanguageById, getLanguageContributions, permanentlyDeleteContribution, logAuditEvent } from '@/lib/services/languages'

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

  let body: { reason?: string; cascade?: boolean; confirmationText?: string } = {}
  try {
    body = await req.json()
  } catch {
    // Body optional or empty
  }

  const { reason = 'Administrative deletion', cascade = true } = body

  const db = getDb()

  try {
    const language = await getLanguageById(id, true)
    if (!language) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    const contributions = await getLanguageContributions(id, 200, true)

    if (contributions.length > 0 && !cascade) {
      return NextResponse.json(
        {
          error: `This language contains ${contributions.length} recorded contribution(s). Consider archiving it instead, or enable explicit cascade deletion.`,
          attachedContributionsCount: contributions.length,
        },
        { status: 400 }
      )
    }

    // If cascade confirmed, delete attached contributions and their S3 files
    for (const contrib of contributions) {
      await permanentlyDeleteContribution({
        PK: `LANGUAGE#${id}`,
        SK: contrib.SK || (contrib as any).id,
        reviewerId: session.sub,
        reason: `Cascade deletion with language "${id}"`,
      })
    }

    // Delete the language item
    await db.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `LANGUAGE#${id}`,
          SK: 'META',
        },
      })
    )

    await logAuditEvent({
      action: 'LANGUAGE_PERMANENT_DELETE',
      entityType: 'language',
      entityId: id,
      entityKey: { PK: `LANGUAGE#${id}`, SK: 'META' },
      actorId: session.sub,
      actorRole: 'admin',
      previousState: { name: language.name, region: language.region, contributionsDeleted: contributions.length },
      reason,
    })

    return NextResponse.json({
      success: true,
      message: `Language "${language.name}" (${id}) and ${contributions.length} attached contribution(s) permanently deleted.`,
    })
  } catch (err) {
    console.error(`[API /api/admin/languages/${id}/delete] Error:`, err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete language' },
      { status: 500 }
    )
  }
}
