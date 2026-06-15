'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '@/lib/data'

const navLinks = [
  { href: '/explore',    label: 'Discover',    depth: 'Regional Discovery' },
  { href: '/contribute', label: 'Preserve',    depth: 'Contribution Ritual' },
  { href: '/insights',   label: 'Observatory', depth: 'Global Observatory' },
]

function getAtlasDepth(pathname: string) {
  if (pathname === '/') return { level: 'World View' }
  if (pathname === '/explore') return { level: 'Regional Discovery' }
  if (pathname === '/insights') return { level: 'Global Observatory' }
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
  const [menuOpen, setMenuOpen] = useState(false)

  const isHome = pathname === '/'
  const depth = getAtlasDepth(pathname)

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      {/* Nav is always glass-heavy and always visible — no scroll logic */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-border/20">
        <nav
          className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between"
          style={{ height: '72px' }}
        >
          {/* Logo lockup */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Oralis — World View">
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

          {/* Depth level indicator — subtle, left of logo */}
          {!isHome && (
            <div className="hidden lg:flex items-center gap-2 ml-6">
              <span className="font-ui text-[10px] tracking-[0.2em] uppercase text-gold/50">
                {depth.level}
              </span>
            </div>
          )}

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-ui text-sm tracking-wide transition-colors relative group',
                  pathname === link.href
                    ? 'text-navy font-medium'
                    : 'text-stone hover:text-navy'
                )}
              >
                {link.label}
                <span className={cn(
                  'absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300',
                  pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                )} />
              </Link>
            ))}

            {/* CTA — always navy */}
            <Link
              href="/contribute"
              className="font-ui text-sm px-5 py-2.5 transition-all tracking-wide rounded-lg glass-navy-heavy text-ivory hover:bg-navy"
            >
              Leave a Memory
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  'block h-px bg-navy transition-all duration-300',
                  i === 0 && menuOpen ? 'w-6 rotate-45 translate-y-2'  : 'w-6',
                  i === 1 && menuOpen ? 'w-0 opacity-0'                 : 'w-5',
                  i === 2 && menuOpen ? 'w-6 -rotate-45 -translate-y-2': 'w-6',
                )}
              />
            ))}
          </button>
        </nav>
      </header>

      {/* Mobile overlay — glassmorphism */}
      <div
        className={cn(
          'fixed inset-0 z-40 glass-navy-heavy flex flex-col transition-transform duration-500 md:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex-1 flex flex-col justify-center px-10 gap-8 pt-24">
          <div className="mb-4">
            <span className="font-ui text-[10px] text-ivory/25 tracking-[0.3em] uppercase">Navigate the Atlas</span>
          </div>

          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-display text-4xl font-bold tracking-tight transition-all',
                pathname === link.href ? 'text-gold' : 'text-ivory/50 hover:text-ivory'
              )}
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}
            >
              <span className="block">{link.label}</span>
              <span className="block font-ui text-xs font-normal tracking-widest uppercase text-ivory/20 mt-1">
                {link.depth}
              </span>
            </Link>
          ))}
          <Link
            href="/contribute"
            className="mt-4 font-ui text-sm px-6 py-3 glass-gold text-gold tracking-wide inline-block w-fit font-medium rounded-lg hover:bg-gold/15 transition-colors"
          >
            Leave a Memory
          </Link>
        </div>
        <div className="px-10 pb-10 border-t border-ivory/10 pt-6 flex items-center gap-3">
          <span className="relative grid place-items-center h-10 w-14 rounded-lg overflow-hidden bg-ivory border border-gold/40">
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
          <span className="font-display text-lg font-bold text-ivory/60">Oralis</span>
        </div>
      </div>
    </>
  )
}
