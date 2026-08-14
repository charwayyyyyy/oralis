import { NextResponse } from 'next/server'
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { revalidatePath } from 'next/cache'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { logAuditEvent } from '@/lib/services/languages'
import { isPubliclyVisibleContribution, CONTRIBUTION_SK_PREFIX } from '@/lib/contracts/contribution'

export const runtime = 'nodejs'

export async function POST() {
  let session
  try {
    session = await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const db = getDb()
  const startTime = Date.now()

  try {
    // 1. Scan all languages (handling pagination)
    let languages: any[] = []
    let lastEvaluatedLangKey: Record<string, any> | undefined = undefined
    do {
      const scanParams: any = {
        TableName: TABLE_NAME,
        FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
        ExpressionAttributeValues: {
          ':sk': 'META',
          ':pkPrefix': 'LANGUAGE#',
        },
      }
      if (lastEvaluatedLangKey) {
        scanParams.ExclusiveStartKey = lastEvaluatedLangKey
      }
      const langRes: any = await db.send(new ScanCommand(scanParams))
      if (langRes.Items) {
        languages = languages.concat(langRes.Items)
      }
      lastEvaluatedLangKey = langRes.LastEvaluatedKey
    } while (lastEvaluatedLangKey)

    // 2. Scan all contributions (handling pagination)
    let contributions: any[] = []
    let lastEvaluatedContribKey: Record<string, any> | undefined = undefined
    do {
      const scanParams: any = {
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':skPrefix': CONTRIBUTION_SK_PREFIX,
        },
      }
      if (lastEvaluatedContribKey) {
        scanParams.ExclusiveStartKey = lastEvaluatedContribKey
      }
      const contribRes: any = await db.send(new ScanCommand(scanParams))
      if (contribRes.Items) {
        contributions = contributions.concat(contribRes.Items)
      }
      lastEvaluatedContribKey = contribRes.LastEvaluatedKey
    } while (lastEvaluatedContribKey)

    // 3. Tally approved contributions per language using centralized visibility predicate
    const tallies: Record<string, { audioCount: number; storiesArchived: number; contributors: Set<string> }> = {}
    languages.forEach((l) => {
      tallies[l.id] = { audioCount: 0, storiesArchived: 0, contributors: new Set() }
    })

    contributions.forEach((c) => {
      const isApproved = isPubliclyVisibleContribution(c)
      const langId = c.languageId || (typeof c.PK === 'string' ? c.PK.replace('LANGUAGE#', '') : '')
      if (isApproved && tallies[langId]) {
        if (c.type === 'story') {
          tallies[langId].storiesArchived++
        } else {
          tallies[langId].audioCount++
        }
        if (c.contributorName) {
          tallies[langId].contributors.add(c.contributorName.toLowerCase().trim())
        }
      }
    })

    // 4. Update language counts
    const updates: any[] = []
    for (const lang of languages) {
      const t = tallies[lang.id] || { audioCount: 0, storiesArchived: 0, contributors: new Set() }
      const newAudio = t.audioCount
      const newStories = t.storiesArchived
      const newContribs = Math.max(t.contributors.size, newAudio > 0 || newStories > 0 ? 1 : 0)

      await db.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `LANGUAGE#${lang.id}`, SK: 'META' },
          UpdateExpression: 'SET audioCount = :a, storiesArchived = :s, contributors = :c, updatedAt = :now',
          ExpressionAttributeValues: {
            ':a': newAudio,
            ':s': newStories,
            ':c': newContribs,
            ':now': new Date().toISOString(),
          },
        })
      )

      updates.push({
        languageId: lang.id,
        name: lang.name,
        previous: { audio: lang.audioCount, stories: lang.storiesArchived, contributors: lang.contributors },
        reconciled: { audio: newAudio, stories: newStories, contributors: newContribs },
      })
    }

    // 5. Audit log
    await logAuditEvent({
      action: 'PLATFORM_RECONCILIATION',
      entityType: 'reconciliation',
      entityId: 'global',
      entityKey: { PK: 'ANALYTICS', SK: 'TOTALS' },
      actorId: session.sub,
      actorRole: 'admin',
      newState: { languagesUpdated: languages.length, totalContributions: contributions.length },
      reason: 'Administrator triggered full database reconciliation',
    })

    try {
      revalidatePath('/')
      revalidatePath('/explore')
      revalidatePath('/observatory')
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: `Reconciliation complete. ${languages.length} language records verified and synchronized.`,
      durationMs: Date.now() - startTime,
      updates,
    })
  } catch (err) {
    console.error('[API /api/admin/reconcile] Error:', err)
    return NextResponse.json({ error: 'Failed to run data reconciliation' }, { status: 500 })
  }
}
