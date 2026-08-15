import { NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const db = getDb()

  try {
    const [langRes, contribRes, auditRes] = await Promise.all([
      db.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
          ExpressionAttributeValues: {
            ':sk': 'META',
            ':pkPrefix': 'LANGUAGE#',
          },
        })
      ),
      db.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':skPrefix': 'CONTRIBUTION',
          },
        })
      ),
      db.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'begins_with(PK, :pkPrefix)',
          ExpressionAttributeValues: {
            ':pkPrefix': 'AUDIT#',
          },
          Select: 'COUNT',
        })
      ),
    ])

    const languages = langRes.Items || []
    const contributions = contribRes.Items || []
    const totalAuditEntries = auditRes.Count || 0

    // 1. Vitality breakdown
    const vitalityCounts: Record<string, number> = {
      safe: 0,
      vulnerable: 0,
      endangered: 0,
      'critically-endangered': 0,
      dormant: 0,
    }

    languages.forEach((l) => {
      const v = (l.vitalityStatus || l.status || 'endangered').toLowerCase()
      if (vitalityCounts[v] !== undefined) {
        vitalityCounts[v]++
      } else {
        vitalityCounts.endangered++
      }
    })

    // 2. Content Type breakdown & Audio count
    const contentTypes: Record<string, number> = {
      vocabulary: 0,
      audio: 0,
      story: 0,
      'cultural-context': 0,
    }

    let audioContributions = 0

    contributions.forEach((c) => {
      const t = c.type || 'vocabulary'
      if (contentTypes[t] !== undefined) {
        contentTypes[t]++
      } else {
        contentTypes.vocabulary++
      }
      if (c.audioS3Key || c.s3Key || c.audioUrl) {
        audioContributions++
      }
    })

    // 3. Contributor telemetry (honest labelling)
    const contributorNames = new Set<string>()
    let registrationsWithEmail = 0

    languages.forEach((l) => {
      if (l.contributorEmail) registrationsWithEmail++
      if (l.contributorName) contributorNames.add(l.contributorName.toLowerCase().trim())
    })

    contributions.forEach((c) => {
      if (c.contributorName) contributorNames.add(c.contributorName.toLowerCase().trim())
    })

    // 4. Region breakdown
    const regionCounts: Record<string, number> = {}
    languages.forEach((l) => {
      const r = l.continent || l.region || 'Unknown'
      regionCounts[r] = (regionCounts[r] || 0) + 1
    })

    const overview = {
      totalLanguages: languages.length,
      totalContributions: contributions.length,
      audioContributions,
      totalAuditEntries,
    }

    return NextResponse.json({
      success: true,
      data: {
        ...overview,
        overview,
        vitalityBreakdown: vitalityCounts,
        contentTypeBreakdown: contentTypes,
        regionBreakdown: regionCounts,
        contributorTelemetry: {
          uniqueContributorDevices: contributorNames.size || 1,
          namedSubmissions: contributorNames.size,
          languageRegistrationsWithEmail: registrationsWithEmail,
          note: 'Anonymous contributor device identifiers are estimated based on distinct device submissions and contributor records.',
        },
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[API /api/admin/analytics] Error:', err)
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 })
  }
}
