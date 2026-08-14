'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ToastMessage } from '@/lib/admin-types'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

interface ToastContextType {
  toasts: ToastMessage[]
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
})

export const useAdminToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string, duration = 4500) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())
      const newToast: ToastMessage = { id, message, type, title, duration }
      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Accessible live region for toast messages */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const getIcon = () => {
            switch (toast.type) {
              case 'error':
                return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              case 'warning':
                return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              case 'info':
                return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              case 'success':
              default:
                return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            }
          }

          return (
            <div
              key={toast.id}
              className="pointer-events-auto p-3.5 bg-white border border-stone-200 rounded-xl shadow-xl flex items-start gap-3 text-navy font-body text-xs animate-in slide-in-from-bottom-2 duration-150"
            >
              {getIcon()}
              <div className="flex-1 min-w-0">
                {toast.title && <p className="font-semibold text-navy">{toast.title}</p>}
                <p className="text-stone-600 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-navy p-1 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
