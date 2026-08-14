'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '@/lib/data'
import { ShieldCheck, Lock } from 'lucide-react'

const navLinks = [
  { href: '/explore',    label: 'Discover',    depth: 'Regional Discovery' },
  { href: '/contribute', label: 'Preserve',    depth: 'Contribution Ritual' },
  { href: '/observatory',   label: 'Observatory', depth: 'Global Observatory' },
]

function getAtlasDepth(pathname: string) {
  if (pathname === '/') return { level: 'World View' }
  if (pathname === '/explore') return { level: 'Regional Discovery' }
  if (pathname === '/observatory') return { level: 'Global Observatory' }
  if (pathname === '/contribute') return { level: 'Preservation Ritual' }
  if (pathname.startsWith('/language/')) {
    const id = pathname.split('/')[2]
    const lang = LANGUAGES.find((l) => l.id === id)
    if (lang) return { level: 'Cultural Territory' }
  }
  return { level: 'Atlas' }
}

export default function Navigation() {
  const pathname   = usePathname()
  const router     = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

  const isHome = pathname === '/'
  const depth = getAtlasDepth(pathname)

  // Secret admin keyboard shortcut (Shift + Alt + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.shiftKey && e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault()
        router.push('/admin/login')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  useEffect(() => { 
    setMenuOpen(false) 
  }, [pathname])

  // Body scroll lock and Escape key listener
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMenuOpen(false)
          triggerRef.current?.focus()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // If in admin routes, navigation is handled by AdminNav
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-border/20" role="banner">
        <nav
          className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between"
          style={{ height: '72px' }}
          aria-label="Main Navigation"
        >
          {/* Logo lockup */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group focus-ring rounded-lg p-1 -ml-1" aria-label="Oralis — World View">
              <span
                className={cn(
                  'relative grid place-items-center h-12 w-[4.25rem] rounded-lg overflow-hidden transition-all duration-500',
                  'bg-ivory/90 backdrop-blur-sm border border-gold/40 shadow-sm',
                  'ring-1 ring-inset ring-navy/5 group-hover:border-gold group-hover:shadow-md',
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: 'url(/oralis-logo.png)',
                    backgroundSize: '303% 400%',
                    backgroundPosition: '55% 22%',
                  }}
                />
                <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-1.5 w-1.5 border-l border-t border-gold/70" />
                <span aria-hidden="true" className="pointer-events-none absolute right-1 bottom-1 h-1.5 w-1.5 border-r border-b border-gold/70" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-2xl font-bold tracking-tight text-navy">
                  Oralis
                </span>
                <span className="font-ui text-[10px] tracking-[0.25em] uppercase mt-0.5 text-stone/70">
                  Cultural Atlas
                </span>
              </span>
            </Link>

            {/* Subtle Secret Curator Trigger on the depth level */}
            <Link
              href="/admin/login"
              className="hidden lg:inline-flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full text-[10px] font-ui tracking-[0.2em] uppercase text-gold/40 hover:text-gold hover:bg-gold/10 transition-all focus-ring"
              title="Curator Access (Shift+Alt+A)"
              aria-label="Curator Access"
            >
              <span>{depth.level}</span>
              <Lock className="w-2.5 h-2.5 opacity-30 hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={cn(
                  'font-ui text-sm tracking-wide transition-colors relative group focus-ring rounded-md px-2 py-1.5',
                  pathname === link.href
                    ? 'text-navy font-bold'
                    : 'text-stone hover:text-navy font-medium'
                )}
              >
                {link.label}
                <span className={cn(
                  'absolute -bottom-0 left-2 right-2 h-0.5 bg-gold transition-all duration-300',
                  pathname === link.href ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                )} />
              </Link>
            ))}

            {/* CTA */}
            <Link
              href="/contribute"
              className="ml-2 font-ui text-sm px-6 py-2.5 font-bold tracking-wide rounded-lg bg-gold text-navy hover:bg-gold-warm transition-all shadow-md focus-ring"
              aria-label="Contribute a language memory"
            >
              Leave a Memory
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={triggerRef}
            className="md:hidden flex flex-col gap-1.5 p-3 focus-ring rounded-md min-h-[44px] min-w-[44px] justify-center items-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  'block h-[2px] bg-navy transition-all duration-300',
                  i === 0 && menuOpen ? 'w-6 rotate-45 translate-y-2'  : 'w-6',
                  i === 1 && menuOpen ? 'w-0 opacity-0'                 : 'w-5',
                  i === 2 && menuOpen ? 'w-6 -rotate-45 -translate-y-2': 'w-6',
                )}
              />
            ))}
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        ref={menuRef}
        className={cn(
          'fixed inset-0 z-40 glass-navy-heavy flex flex-col transition-transform duration-500 md:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Mobile Navigation"
      >
        <div className="flex-1 flex flex-col justify-center px-10 gap-6 pt-24 overflow-y-auto atlas-scroll">
          <div className="mb-2">
            <span className="font-ui text-[10px] text-ivory/40 tracking-[0.3em] uppercase font-bold">Navigate the Atlas</span>
          </div>

          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={cn(
                'font-display text-3xl sm:text-4xl font-bold tracking-tight transition-all py-2 min-h-[44px] flex flex-col focus-ring rounded-lg px-2 -ml-2',
                pathname === link.href ? 'text-gold' : 'text-ivory/85 hover:text-ivory'
              )}
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}
            >
              <span>{link.label}</span>
              <span className="font-ui text-xs font-normal tracking-widest uppercase text-ivory/40 mt-0.5">
                {link.depth}
              </span>
            </Link>
          ))}

          {/* Secondary mobile links */}
          <div className="pt-2 flex flex-wrap gap-4 border-t border-ivory/10">
            <Link href="/profile" className="font-ui text-xs text-ivory/50 hover:text-gold py-2 min-h-[44px] flex items-center">
              Manage Token
            </Link>
            <Link href="/guidelines" className="font-ui text-xs text-ivory/50 hover:text-gold py-2 min-h-[44px] flex items-center">
              Guidelines
            </Link>
            <Link href="/terms" className="font-ui text-xs text-ivory/50 hover:text-gold py-2 min-h-[44px] flex items-center">
              Terms & Privacy
            </Link>
            {/* Subtle Secret Curator link in mobile drawer */}
            <Link href="/admin/login" className="font-ui text-xs text-ivory/30 hover:text-gold py-2 min-h-[44px] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Curator</span>
            </Link>
          </div>
          
          <div className="pt-4">
            <Link
              href="/contribute"
              className="font-ui text-base px-8 py-4 bg-gold text-navy tracking-wide inline-block w-full text-center font-bold rounded-xl shadow-lg hover:bg-gold-warm transition-colors min-h-[44px] focus-ring"
            >
              Leave a Memory
            </Link>
          </div>
        </div>
        <div className="px-10 pb-safe pt-4 mt-auto">
          <div className="border-t border-ivory/20 pt-4 flex items-center gap-4">
            <span className="relative grid place-items-center h-12 w-16 rounded-lg overflow-hidden bg-ivory border border-gold/40 shadow-sm">
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-no-repeat"
                style={{
                  backgroundImage: 'url(/oralis-logo.png)',
                  backgroundSize: '303% 400%',
                  backgroundPosition: '55% 22%',
                }}
              />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-ivory/90">Oralis</span>
              <span className="font-ui text-[10px] text-ivory/40 tracking-widest uppercase">Every language carries a world</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
