'use client'

import { useEffect, useState } from 'react'

export interface ToastProps {
  message: string
  type?: 'success' | 'info' | 'error'
  duration?: number
  onClose?: () => void
}

export default function Toast({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 animate-fade-up max-w-sm"
    >
      <div className={`ios-capsule px-5 py-3 shadow-xl ${
        type === 'success' ? 'glass-navy-heavy text-gold border-gold/40' :
        type === 'error' ? 'glass-dark text-red-400 border-red-500/40' :
        'glass-heavy text-navy border-border'
      }`}>
        <span className="w-2 h-2 rounded-full shrink-0 animate-pulse"
          style={{ backgroundColor: type === 'error' ? '#ef4444' : '#C8A96B' }}
          aria-hidden="true"
        />
        <span className="font-ui text-xs font-medium leading-tight">{message}</span>
        <button
          onClick={() => { setVisible(false); onClose?.() }}
          className="ml-2 text-stone/50 hover:text-stone font-bold p-1"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}
