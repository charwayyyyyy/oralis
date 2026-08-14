'use client'

import React from 'react'
import { getStatusConfig } from '@/lib/status-config'
import { CheckCircle2, Clock, XCircle, EyeOff, Archive, AlertTriangle, AlertCircle, Check } from 'lucide-react'

interface Props {
  status: string | undefined | null
  className?: string
  showIcon?: boolean
}

export default function AdminStatusBadge({ status, className = '', showIcon = true }: Props) {
  const config = getStatusConfig(status)
  const upper = (status || 'PENDING').toUpperCase()

  const getIcon = () => {
    switch (upper) {
      case 'APPROVED':
        return <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      case 'PENDING':
        return <Clock className="w-3 h-3 text-amber-600" />
      case 'REJECTED':
        return <XCircle className="w-3 h-3 text-rose-600" />
      case 'HIDDEN':
        return <EyeOff className="w-3 h-3 text-stone-500" />
      case 'ARCHIVED':
        return <Archive className="w-3 h-3 text-stone-500" />
      case 'DELETION_PENDING':
        return <AlertTriangle className="w-3 h-3 text-red-700" />
      case 'OPEN':
        return <AlertCircle className="w-3 h-3 text-orange-600" />
      case 'RESOLVED':
        return <Check className="w-3 h-3 text-teal-600" />
      default:
        return null
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-ui font-semibold border ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
      title={config.description}
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && getIcon()}
      <span>{config.label}</span>
    </span>
  )
}
