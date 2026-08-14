'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Globe,
  Mic,
  Flag,
  BarChart3,
  History,
  LogOut,
  ExternalLink,
  RefreshCw,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'

interface Props {
  syncStatus?: 'SYNCHRONIZED' | 'SYNCING' | 'OFFLINE' | 'ERROR'
  lastRefreshed?: string
  onManualRefresh?: () => void
  pendingLanguagesCount?: number
  pendingContributionsCount?: number
  openReportsCount?: number
}

export default function AdminNav({
  syncStatus = 'SYNCHRONIZED',
  lastRefreshed,
  onManualRefresh,
  pendingLanguagesCount = 0,
  pendingContributionsCount = 0,
  openReportsCount = 0,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch {
      window.location.href = '/'
    }
  }

  const navLinks = [
    {
      href: '/admin',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: 0,
    },
    {
      href: '/admin/languages',
      label: 'Languages',
      icon: Globe,
      badge: pendingLanguagesCount,
    },
    {
      href: '/admin/contributions',
      label: 'Contributions',
      icon: Mic,
      badge: pendingContributionsCount,
    },
    {
      href: '/admin/reports',
      label: 'Reports',
      icon: Flag,
      badge: openReportsCount,
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: 0,
    },
    {
      href: '/admin/audit',
      label: 'Audit Log',
      icon: History,
      badge: 0,
    },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy text-ivory border-b border-gold/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Lockup */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3 group focus-ring rounded-lg p-1">
              <span className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-sm shadow-inner">
                <ShieldCheck className="w-5 h-5 text-gold" />
              </span>
              <div>
                <span className="font-display font-bold text-lg text-ivory flex items-center gap-2">
                  Oralis <span className="font-ui text-[10px] tracking-widest uppercase text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">Admin</span>
                </span>
              </div>
            </Link>

            {/* Sync status pill */}
            <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-ivory/10">
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'SYNCHRONIZED'
                    ? 'bg-emerald-400 animate-pulse'
                    : syncStatus === 'SYNCING'
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-rose-400'
                }`}
                aria-hidden="true"
              />
              <span className="font-ui text-xs text-ivory/60 font-medium">
                {syncStatus === 'SYNCHRONIZED'
                  ? 'Live Synced'
                  : syncStatus === 'SYNCING'
                  ? 'Syncing...'
                  : 'Offline'}
              </span>
              {onManualRefresh && (
                <button
                  onClick={onManualRefresh}
                  className="p-1 text-ivory/40 hover:text-gold rounded transition-colors focus-ring"
                  title="Force Refresh Data"
                  aria-label="Refresh live admin data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Admin Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-ui tracking-wide transition-all ${
                    isActive
                      ? 'bg-gold text-navy font-bold shadow-sm'
                      : 'text-ivory/80 hover:text-ivory hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? 'bg-navy text-gold' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-xs text-ivory/60 hover:text-gold px-3 py-1.5 rounded-lg border border-ivory/10 hover:border-gold/30 transition-colors focus-ring"
            >
              <span>Public Atlas</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="hidden md:flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 px-3 py-1.5 rounded-lg transition-colors focus-ring"
              aria-label="Log out from administration"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-ivory/80 hover:text-ivory rounded-lg hover:bg-white/10 focus-ring"
              aria-label={mobileMenuOpen ? 'Close admin menu' : 'Open admin menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-abyss border-t border-ivory/10 px-4 pt-3 pb-6 space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-ivory/10 text-xs text-ivory/60">
              <span>Sync: {syncStatus}</span>
              {onManualRefresh && (
                <button
                  onClick={() => {
                    onManualRefresh()
                    setMobileMenuOpen(false)
                  }}
                  className="text-gold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              )}
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-ui ${
                    isActive ? 'bg-gold text-navy font-bold' : 'text-ivory/90 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            <div className="pt-4 border-t border-ivory/10 flex items-center justify-between">
              <Link
                href="/"
                target="_blank"
                className="text-xs text-ivory/60 hover:text-gold flex items-center gap-1 py-2"
              >
                <span>View Public Atlas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-200 flex items-center gap-1 py-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for 320px-768px screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-navy/95 backdrop-blur-md border-t border-gold/30 px-2 py-1.5 flex items-center justify-around">
        {navLinks.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[48px] min-h-[44px] ${
                isActive ? 'text-gold font-bold' : 'text-ivory/60 hover:text-ivory'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-ui tracking-tight mt-0.5">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </Link>
          )
        })}
      </div>
    </>
  )
}
