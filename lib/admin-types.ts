/**
 * lib/admin-types.ts
 * Shared TypeScript types for the Oralis Administrative Dashboard.
 */

import type { Language, Contribution, ContentReport, AuditLogEntry } from '@/lib/data'

export type SyncState = 'UP_TO_DATE' | 'UPDATING' | 'DELAYED' | 'OFFLINE' | 'FAILED'

export interface AdminOverviewStats {
  totalLanguages: number
  pendingLanguages: number
  approvedLanguages: number
  rejectedLanguages: number
  hiddenLanguages: number
  archivedLanguages: number
  totalContributions: number
  pendingContributions: number
  approvedContributions: number
  rejectedContributions: number
  hiddenContributions: number
  archivedContributions: number
  audioContributions: number
  storyContributions: number
  vocabularyContributions: number
  culturalContextContributions: number
  uniqueContributorDevices: number
  openReports: number
  resolvedReports: number
  approvalRate: number | null
  medianReviewTimeMinutes: number | null
  databaseSyncStatus: string
  lastRefreshed: string
  queryDurationMs: number
  oldestPendingLanguageAge?: string | null
  oldestPendingContributionAge?: string | null
  oldestOpenReportAge?: string | null
}

export interface AdminOverviewResponse {
  success: boolean
  stats: AdminOverviewStats
  recentLanguages: Language[]
  recentContributions: Contribution[]
  recentAuditLogs: AuditLogEntry[]
  error?: string
}

export interface ToastMessage {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}
