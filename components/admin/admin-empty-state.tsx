'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface Props {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export default function AdminEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: Props) {
  return (
    <div
      className={`min-h-[130px] flex flex-col items-center justify-center p-6 text-center bg-stone-50/50 border border-stone-200/60 rounded-2xl ${className}`}
    >
      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
        {icon || <CheckCircle2 className="w-4 h-4" />}
      </div>
      <h4 className="font-display font-bold text-sm text-navy">{title}</h4>
      <p className="text-xs font-ui text-stone-500 max-w-sm mt-0.5">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-3">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 text-xs font-ui font-semibold text-gold hover:text-navy transition-colors"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1 text-xs font-ui font-semibold text-gold hover:text-navy transition-colors"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
