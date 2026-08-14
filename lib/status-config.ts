/**
 * lib/status-config.ts
 * Centralized design and semantic tokens for moderation and report statuses.
 */

export interface StatusConfigItem {
  label: string
  color: string
  bgClass: string
  textClass: string
  borderClass: string
  description: string
}

export const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  PENDING: {
    label: 'Pending Review',
    color: '#D97706',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    description: 'Awaiting curator moderation before public release',
  },
  APPROVED: {
    label: 'Approved',
    color: '#059669',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
    description: 'Verified and active in the public cultural atlas',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#DC2626',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-800',
    borderClass: 'border-rose-200',
    description: 'Declined due to inaccuracies or guideline non-compliance',
  },
  HIDDEN: {
    label: 'Hidden',
    color: '#6B7280',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-700',
    borderClass: 'border-stone-200',
    description: 'Temporarily removed from public visibility',
  },
  ARCHIVED: {
    label: 'Archived',
    color: '#4B5563',
    bgClass: 'bg-stone-100',
    textClass: 'text-stone-700',
    borderClass: 'border-stone-300',
    description: 'Preserved in archive cold storage for research',
  },
  DELETION_PENDING: {
    label: 'Deletion Pending',
    color: '#991B1B',
    bgClass: 'bg-red-50',
    textClass: 'text-red-900',
    borderClass: 'border-red-300',
    description: 'Queued for permanent physical deletion from S3 and DynamoDB',
  },
  OPEN: {
    label: 'Open Concern',
    color: '#EA580C',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-200',
    description: 'Community report requiring curator evaluation',
  },
  RESOLVED: {
    label: 'Resolved',
    color: '#0D9488',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-200',
    description: 'Concern evaluated and resolved by moderation team',
  },
  DISMISSED: {
    label: 'Dismissed',
    color: '#64748B',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-200',
    description: 'Report reviewed and determined not to require action',
  },
}

export function getStatusConfig(status: string | undefined | null): StatusConfigItem {
  const upper = (status || 'PENDING').toUpperCase()
  return (
    STATUS_CONFIG[upper] || {
      label: status || 'Unknown',
      color: '#6B7280',
      bgClass: 'bg-stone-100',
      textClass: 'text-stone-700',
      borderClass: 'border-stone-200',
      description: 'Status unspecified',
    }
  )
}
