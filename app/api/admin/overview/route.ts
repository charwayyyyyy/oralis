import { NextResponse } from 'next/server'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from '@/lib/aws/dynamodb'
import { requireAdmin, handleAdminApiAuthError } from '@/lib/auth/admin'
import { CONTRIBUTION_SK_PREFIX } from '@/lib/contracts/contribution'
import type { AdminOverviewResponse } from '@/lib/admin-types'

export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

function formatAge(dateString?: string): string | null {
  if (!dateString) return null
  const created = new Date(dateString).getTime()
  if (isNaN(created)) return null
  const now = Date.now()
  const diffHours = Math.floor((now - created) / (1000 * 60 * 60))
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin()
  } catch (err) {
    return handleAdminApiAuthError(err)
  }

  const db = getDb()
  const startTime = Date.now()

  try {
    // 1. Scan for all languages
    const langScan = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'SK = :sk AND begins_with(PK, :pkPrefix)',
        ExpressionAttributeValues: {
          ':sk': 'META',
          ':pkPrefix': 'LANGUAGE#',
        },
      })
    )
    const languages = langScan.Items || []

    // 2. Scan for all contributions
    const contribScan = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':skPrefix': CONTRIBUTION_SK_PREFIX,
        },
      })
    )
    const contributions = contribScan.Items || []

    // 3. Scan for reports
    const reportScan = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pkPrefix)',
        ExpressionAttributeValues: {
          ':pkPrefix': 'REPORT#',
        },
      })
    )
    const reports = reportScan.Items || []

    // 4. Fetch recent audit records
    const auditScan = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pkPrefix)',
        ExpressionAttributeValues: {
          ':pkPrefix': 'AUDIT#',
        },
        Limit: 20,
      })
    )
    const auditLogs = (auditScan.Items || []).sort(
      (a, b) => new Date(b.timestamp || b.SK || 0).getTime() - new Date(a.timestamp || a.SK || 0).getTime()
    )

    // Language counts
    let pendingLanguages = 0
    let approvedLanguages = 0
    let rejectedLanguages = 0
    let hiddenLanguages = 0
    let archivedLanguages = 0

    let oldestPendingLangDate: string | null = null

    languages.forEach((l) => {
      const status = l.moderationStatus || (l.status === 'PENDING_REVIEW' ? 'PENDING' : 'APPROVED')
      if (status === 'PENDING') {
        pendingLanguages++
        const date = l.submittedAt || l.createdAt
        if (date && (!oldestPendingLangDate || new Date(date) < new Date(oldestPendingLangDate))) {
          oldestPendingLangDate = date
        }
      } else if (status === 'APPROVED') {
        approvedLanguages++
      } else if (status === 'REJECTED') {
        rejectedLanguages++
      } else if (status === 'HIDDEN') {
        hiddenLanguages++
      } else if (status === 'ARCHIVED') {
        archivedLanguages++
      }
    })

    // Contribution counts & review times
    let pendingContributions = 0
    let approvedContributions = 0
    let rejectedContributions = 0
    let hiddenContributions = 0
    let archivedContributions = 0
    let audioContributions = 0
    let storyContributions = 0
    let vocabularyContributions = 0
    let culturalContextContributions = 0

    let oldestPendingContribDate: string | null = null
    const uniqueContributors = new Set<string>()
    const reviewTimesMinutes: number[] = []

    contributions.forEach((c) => {
      const status = c.moderationStatus || (c.verified ? 'APPROVED' : 'PENDING')
      if (status === 'PENDING') {
        pendingContributions++
        const date = c.submittedAt || c.createdAt
        if (date && (!oldestPendingContribDate || new Date(date) < new Date(oldestPendingContribDate))) {
          oldestPendingContribDate = date
        }
      } else if (status === 'APPROVED') {
        approvedContributions++
      } else if (status === 'REJECTED') {
        rejectedContributions++
      } else if (status === 'HIDDEN') {
        hiddenContributions++
      } else if (status === 'ARCHIVED') {
        archivedContributions++
      }

      if (c.audioS3Key || c.s3Key) audioContributions++
      if (c.type === 'story') storyContributions++
      else if (c.type === 'vocabulary') vocabularyContributions++
      else if (c.type === 'cultural-context') culturalContextContributions++

      if (c.contributorName && typeof c.contributorName === 'string') {
        const trimmed = c.contributorName.trim()
        if (trimmed && trimmed.toLowerCase() !== 'anonymous') {
          uniqueContributors.add(trimmed.toLowerCase())
        }
      }

      // Calculate actual review time if recorded
      if (c.createdAt && c.reviewedAt) {
        const diff = new Date(c.reviewedAt).getTime() - new Date(c.createdAt).getTime()
        if (diff > 0 && !isNaN(diff)) {
          reviewTimesMinutes.push(diff / (1000 * 60))
        }
      }
    })

    // Open reports
    let openReports = 0
    let resolvedReports = 0
    let oldestOpenReportDate: string | null = null

    reports.forEach((r) => {
      if (r.status === 'OPEN') {
        openReports++
        const date = r.createdAt || r.timestamp
        if (date && (!oldestOpenReportDate || new Date(date) < new Date(oldestOpenReportDate))) {
          oldestOpenReportDate = date
        }
      } else {
        resolvedReports++
      }
    })

    // Computed metrics
    const totalReviewed = approvedContributions + rejectedContributions
    const approvalRate = totalReviewed > 0 ? Math.round((approvedContributions / totalReviewed) * 100) : null

    let medianReviewTimeMinutes: number | null = null
    if (reviewTimesMinutes.length > 0) {
      reviewTimesMinutes.sort((a, b) => a - b)
      const mid = Math.floor(reviewTimesMinutes.length / 2)
      medianReviewTimeMinutes =
        reviewTimesMinutes.length % 2 !== 0
          ? Math.round(reviewTimesMinutes[mid])
          : Math.round((reviewTimesMinutes[mid - 1] + reviewTimesMinutes[mid]) / 2)
    }

    // Recent items
    const recentLanguages = [...languages]
      .sort((a, b) => new Date(b.createdAt || b.submittedAt || 0).getTime() - new Date(a.createdAt || a.submittedAt || 0).getTime())
      .slice(0, 5)

    const recentContributions = [...contributions]
      .sort((a, b) => new Date(b.createdAt || b.submittedAt || 0).getTime() - new Date(a.createdAt || a.submittedAt || 0).getTime())
      .slice(0, 5)

    const response: AdminOverviewResponse = {
      success: true,
      stats: {
        totalLanguages: languages.length,
        pendingLanguages,
        approvedLanguages,
        rejectedLanguages,
        hiddenLanguages,
        archivedLanguages,
        totalContributions: contributions.length,
        pendingContributions,
        approvedContributions,
        rejectedContributions,
        hiddenContributions,
        archivedContributions,
        audioContributions,
        storyContributions,
        vocabularyContributions,
        culturalContextContributions,
        uniqueContributorDevices: uniqueContributors.size,
        openReports,
        resolvedReports,
        approvalRate,
        medianReviewTimeMinutes,
        databaseSyncStatus: 'SYNCHRONIZED',
        lastRefreshed: new Date().toISOString(),
        queryDurationMs: Date.now() - startTime,
        oldestPendingLanguageAge: formatAge(oldestPendingLangDate || undefined),
        oldestPendingContributionAge: formatAge(oldestPendingContribDate || undefined),
        oldestOpenReportAge: formatAge(oldestOpenReportDate || undefined),
      },
      recentLanguages: recentLanguages as any,
      recentContributions: recentContributions as any,
      recentAuditLogs: auditLogs as any,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[API /api/admin/overview] Query error:', err)
    return NextResponse.json({ error: 'Failed to load administrative overview' }, { status: 500 })
  }
}
