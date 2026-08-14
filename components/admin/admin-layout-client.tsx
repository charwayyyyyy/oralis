'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Globe,
  Mic,
  Flag,
  BarChart3,
  History,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
} from 'lucide-react'
import AdminSyncIndicator from './admin-sync-indicator'
import { ToastProvider, useAdminToast } from './toast-context'
import type { AdminSession } from '@/lib/auth/admin'
import type { SyncState, AdminOverviewResponse } from '@/lib/admin-types'

interface Props {
  initialSession: AdminSession | null
  children: React.ReactNode
}

export const AdminContext = React.createContext<{
  refreshKey: number
  triggerRefresh: () => void
  syncState: SyncState
  lastRefreshed: string | null
  queryDurationMs?: number
  isRefreshing: boolean
  badgeCounts: {
    pendingLanguages: number
    pendingContributions: number
    openReports: number
  }
}>({
  refreshKey: 0,
  triggerRefresh: () => {},
  syncState: 'UP_TO_DATE',
  lastRefreshed: null,
  isRefreshing: false,
  badgeCounts: {
    pendingLanguages: 0,
    pendingContributions: 0,
    openReports: 0,
  },
})

export const useAdmin = () => React.useContext(AdminContext)

export default function AdminLayoutClient({ initialSession, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const [syncState, setSyncState] = useState<SyncState>('UP_TO_DATE')
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null)
  const [queryDurationMs, setQueryDurationMs] = useState<number | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [badgeCounts, setBadgeCounts] = useState({
    pendingLanguages: 0,
    pendingContributions: 0,
    openReports: 0,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const backoffDelayRef = useRef(10000)

  const isLoginPage = pathname === '/admin/login'

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const fetchSummary = useCallback(async (isManual = false) => {
    if (isLoginPage) return
    if (typeof window !== 'undefined' && (!navigator.onLine || document.hidden)) {
      if (!navigator.onLine) setSyncState('OFFLINE')
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      if (isManual) setIsRefreshing(true)
      else setSyncState('UPDATING')

      const res = await fetch('/api/admin/overview', {
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      })

      if (res.status === 401) {
        router.push('/admin/login')
        return
      }

      if (!res.ok) throw new Error('Failed to synchronize admin overview')

      const data: AdminOverviewResponse = await res.json()
      if (data?.stats) {
        setBadgeCounts({
          pendingLanguages: data.stats.pendingLanguages || 0,
          pendingContributions: data.stats.pendingContributions || 0,
          openReports: data.stats.openReports || 0,
        })
        setLastRefreshed(data.stats.lastRefreshed)
        setQueryDurationMs(data.stats.queryDurationMs)
        setSyncState('UP_TO_DATE')
        backoffDelayRef.current = 10000 // Reset backoff
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.warn('[Admin Layout] Sync check failed:', err)
      setSyncState(navigator.onLine ? 'FAILED' : 'OFFLINE')
      backoffDelayRef.current = Math.min(backoffDelayRef.current * 1.5, 60000)
    } finally {
      setIsRefreshing(false)
    }
  }, [isLoginPage, router])

  useEffect(() => {
    if (!initialSession && !isLoginPage) {
      router.push('/admin/login')
      return
    }

    fetchSummary(true)

    let timer: NodeJS.Timeout
    const scheduleNext = () => {
      timer = setTimeout(() => {
        if (!document.hidden && navigator.onLine) {
          fetchSummary().finally(() => scheduleNext())
        } else {
          scheduleNext()
        }
      }, backoffDelayRef.current)
    }
    scheduleNext()

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSummary()
      }
    }

    const handleOnline = () => {
      setSyncState('UP_TO_DATE')
      fetchSummary(true)
    }
    const handleOffline = () => setSyncState('OFFLINE')

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) abortControllerRef.current.abort()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [initialSession, isLoginPage, fetchSummary, router, refreshKey])

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoggingOut(false)
    }
  }

  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, badge: 0 },
    { href: '/admin/languages', label: 'Languages', icon: Globe, badge: badgeCounts.pendingLanguages },
    { href: '/admin/contributions', label: 'Contributions', icon: Mic, badge: badgeCounts.pendingContributions },
    { href: '/admin/reports', label: 'Reports', icon: Flag, badge: badgeCounts.openReports },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, badge: 0 },
    { href: '/admin/audit', label: 'Audit Log', icon: History, badge: 0 },
  ]

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Moderation Overview'
    if (pathname.startsWith('/admin/languages')) return 'Language Registry'
    if (pathname.startsWith('/admin/contributions')) return 'Contribution Moderation'
    if (pathname.startsWith('/admin/reports')) return 'Community Reports'
    if (pathname.startsWith('/admin/analytics')) return 'Archival Telemetry'
    if (pathname.startsWith('/admin/audit')) return 'Audit Trail'
    return 'Curator Console'
  }

  return (
    <ToastProvider>
      <AdminContext.Provider
        value={{
          refreshKey,
          triggerRefresh,
          syncState,
          lastRefreshed,
          queryDurationMs,
          isRefreshing,
          badgeCounts,
        }}
      >
        <div className="min-h-screen bg-[#FAF8F5] text-navy flex font-body antialiased selection:bg-gold/30 selection:text-navy">
          {/* ========================================================================= */}
          {/* DESKTOP LEFT SIDEBAR                                                      */}
          {/* ========================================================================= */}
          <aside
            className={`hidden lg:flex flex-col shrink-0 bg-white border-r border-stone-200/80 transition-all duration-200 z-30 ${
              sidebarCollapsed ? 'w-20' : 'w-64'
            }`}
            aria-label="Admin Navigation Sidebar"
          >
            {/* Brand Lockup */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3 group focus:outline-none">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-navy-abyss/5 border border-gold/40 flex items-center justify-center shrink-0">
                  <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-gold" />
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-gold" />
                  <Image
                    src="/icon.png"
                    alt="Oralis Logo"
                    width={28}
                    height={28}
                    className="object-contain p-0.5 group-hover:scale-105 transition-transform"
                  />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <span className="font-display font-bold text-base text-navy tracking-tight block">Oralis</span>
                    <span className="font-ui text-[10px] text-stone-500 uppercase tracking-widest block -mt-0.5 font-semibold">
                      Curator Console
                    </span>
                  </div>
                )}
              </Link>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 text-stone-400 hover:text-navy hover:bg-stone-100 rounded-lg transition-colors"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto" aria-label="Admin Sections">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-ui transition-all group ${
                      isActive
                        ? 'bg-navy text-gold font-bold shadow-sm'
                        : 'text-stone-600 hover:text-navy hover:bg-stone-100 font-medium'
                    } ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold' : 'text-stone-400 group-hover:text-navy'}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                          isActive ? 'bg-gold text-navy' : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {sidebarCollapsed && item.badge > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Sidebar Utility */}
            <div className="p-3 border-t border-stone-100 space-y-1">
              <Link
                href="/"
                target="_blank"
                className={`flex items-center gap-3 px-3 py-2 text-xs font-ui text-stone-500 hover:text-navy hover:bg-stone-100 rounded-xl transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title="View Public Cultural Atlas"
              >
                <ExternalLink className="w-4 h-4 shrink-0 text-stone-400" />
                {!sidebarCollapsed && <span>Public Atlas</span>}
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-ui text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title="Sign out of Curator Console"
              >
                <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                {!sidebarCollapsed && <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>}
              </button>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* MAIN CONTENT WRAPPER                                                      */}
          {/* ========================================================================= */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            {/* Top Desktop & Mobile Utility Bar */}
            <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
              {/* Left Title / Breadcrumb */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-stone-600 hover:text-navy hover:bg-stone-100 rounded-lg"
                  aria-label="Open mobile menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-display font-bold text-lg sm:text-xl text-navy tracking-tight truncate">
                    {getPageTitle()}
                  </h1>
                </div>
              </div>

              {/* Right Status & Actions */}
              <div className="flex items-center gap-3">
                <AdminSyncIndicator
                  syncState={syncState}
                  lastRefreshed={lastRefreshed}
                  queryDurationMs={queryDurationMs}
                  onManualRefresh={() => fetchSummary(true)}
                  isRefreshing={isRefreshing}
                />

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-ui text-navy transition-colors focus:outline-none focus:border-gold"
                    aria-label="Administrator profile menu"
                  >
                    <div className="w-6 h-6 rounded-full bg-navy text-gold flex items-center justify-center font-semibold text-[11px]">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="hidden sm:inline font-semibold">Administrator</span>
                  </button>

                  {profileMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 text-xs font-ui font-medium animate-in fade-in duration-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-stone-100 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Session</span>
                        <span className="font-semibold text-navy block truncate mt-0.5">
                          {initialSession?.username || 'Curator Console'}
                        </span>
                      </div>
                      <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-navy hover:bg-stone-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                        <span>Public Atlas</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-1 text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-navy-abyss/60 backdrop-blur-sm flex">
                <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl font-body">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-navy-abyss/5 border border-gold/40 flex items-center justify-center">
                          <Image src="/icon.png" alt="Logo" width={22} height={22} className="object-contain" />
                        </div>
                        <span className="font-display font-bold text-base text-navy">Oralis Admin</span>
                      </div>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1.5 text-stone-400 hover:text-navy rounded-lg"
                        aria-label="Close menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <nav className="space-y-1.5" aria-label="Mobile Navigation">
                      {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-ui transition-all ${
                              isActive ? 'bg-navy text-gold font-bold' : 'text-stone-700 hover:bg-stone-50 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-stone-400'}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </nav>
                  </div>

                  <div className="pt-4 border-t border-stone-100 space-y-2">
                    <Link
                      href="/"
                      target="_blank"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-ui text-stone-600 hover:text-navy rounded-xl"
                    >
                      <ExternalLink className="w-4 h-4 text-stone-400" />
                      <span>View Public Atlas</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-ui text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
              </div>
            )}

            {/* Page Content Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
              {children}
            </main>

            {/* Mobile Fixed Bottom Bar (320px–768px) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 flex items-center justify-around">
              {navItems.slice(0, 5).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[48px] min-h-[44px] ${
                      isActive ? 'text-navy font-bold' : 'text-stone-500 hover:text-navy'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-gold' : ''}`} />
                    <span className="text-[10px] font-ui tracking-tight mt-0.5">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </AdminContext.Provider>
    </ToastProvider>
  )
}
