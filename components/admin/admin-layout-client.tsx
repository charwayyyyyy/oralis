'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminNav from './admin-nav'
import type { AdminSession } from '@/lib/auth/admin'

interface Props {
  initialSession: AdminSession | null
  children: React.ReactNode
}

export const AdminContext = React.createContext<{
  refreshKey: number
  triggerRefresh: () => void
  syncStatus: 'SYNCHRONIZED' | 'SYNCING' | 'OFFLINE' | 'ERROR'
}>({
  refreshKey: 0,
  triggerRefresh: () => {},
  syncStatus: 'SYNCHRONIZED',
})

export default function AdminLayoutClient({ initialSession, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [syncStatus, setSyncStatus] = useState<'SYNCHRONIZED' | 'SYNCING' | 'OFFLINE' | 'ERROR'>('SYNCHRONIZED')
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingLanguagesCount, setPendingLanguagesCount] = useState(0)
  const [pendingContributionsCount, setPendingContributionsCount] = useState(0)
  const [openReportsCount, setOpenReportsCount] = useState(0)

  const isLoginPage = pathname === '/admin/login'

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  // Poll for counts and badge synchronization
  const fetchBadgeCounts = useCallback(async () => {
    if (isLoginPage) return
    if (typeof window !== 'undefined' && (!navigator.onLine || document.hidden)) {
      if (!navigator.onLine) setSyncStatus('OFFLINE')
      return
    }

    try {
      setSyncStatus('SYNCING')
      const res = await fetch('/api/admin/overview', { cache: 'no-store' })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) throw new Error('Sync failed')
      const data = await res.json()
      if (data?.stats) {
        setPendingLanguagesCount(data.stats.pendingLanguages || 0)
        setPendingContributionsCount(data.stats.pendingContributions || 0)
        setOpenReportsCount(data.stats.openReports || 0)
      }
      setSyncStatus('SYNCHRONIZED')
    } catch {
      setSyncStatus(navigator.onLine ? 'ERROR' : 'OFFLINE')
    }
  }, [isLoginPage, router])

  useEffect(() => {
    if (!initialSession && !isLoginPage) {
      router.push('/admin/login')
      return
    }

    fetchBadgeCounts()

    // 10 second polling interval
    const interval = setInterval(() => {
      fetchBadgeCounts()
    }, 10000)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBadgeCounts()
      }
    }

    const handleOnline = () => {
      setSyncStatus('SYNCHRONIZED')
      fetchBadgeCounts()
    }
    const handleOffline = () => setSyncStatus('OFFLINE')

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [initialSession, isLoginPage, fetchBadgeCounts, router, refreshKey])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminContext.Provider value={{ refreshKey, triggerRefresh, syncStatus }}>
      <div className="min-h-screen bg-[#FAF8F5] text-navy flex flex-col font-body antialiased selection:bg-gold/30 selection:text-navy">
        <AdminNav
          syncStatus={syncStatus}
          pendingLanguagesCount={pendingLanguagesCount}
          pendingContributionsCount={pendingContributionsCount}
          openReportsCount={openReportsCount}
          onManualRefresh={triggerRefresh}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-12">
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  )
}
