'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/explore',    label: 'Explore'    },
  { href: '/contribute', label: 'Contribute' },
  { href: '/insights',   label: 'Observatory' },
  { href: '/profile',    label: 'Profile'    },
]

export default function Navigation() {
  const pathname   = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Determine if we're on the home page (hero is navy, so nav should start transparent-white)
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const navBg = scrolled
    ? 'bg-ivory/95 backdrop-blur-md border-b border-border shadow-sm'
    : isHome
      ? 'bg-transparent'
      : 'bg-ivory/95 backdrop-blur-md border-b border-border'

  const linkColor = scrolled || !isHome ? 'text-stone hover:text-navy' : 'text-ivory/70 hover:text-ivory'
  const activeLinkColor = scrolled || !isHome ? 'text-navy font-medium' : 'text-ivory font-medium'

  return (
    <>
      <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500', navBg)}>
        <nav
          className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between"
          style={{ height: '72px' }}
        >
          {/* Logo lockup */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Oralis — Home">
            {/* Framed archival-seal badge with cropped speaking-face + script icon */}
            <span
              className={cn(
                'relative grid place-items-center h-12 w-[4.25rem] rounded-md overflow-hidden transition-all duration-500',
                'bg-ivory border border-gold/50 shadow-sm',
                'ring-1 ring-inset ring-navy/5 group-hover:border-gold',
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
              {/* corner accents */}
              <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-1.5 w-1.5 border-l border-t border-gold/70" />
              <span aria-hidden="true" className="pointer-events-none absolute right-1 bottom-1 h-1.5 w-1.5 border-r border-b border-gold/70" />
            </span>
            <span className="flex flex-col leading-none">
              <span
                className={cn(
                  'font-display text-2xl font-bold tracking-tight transition-colors',
                  scrolled || !isHome ? 'text-navy' : 'text-ivory',
                )}
              >
                Oralis
              </span>
              <span
                className={cn(
                  'font-ui text-[10px] tracking-[0.25em] uppercase mt-0.5 transition-colors',
                  scrolled || !isHome ? 'text-stone/70' : 'text-ivory/50',
                )}
              >
                Cultural Memory
              </span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-ui text-sm tracking-wide transition-colors relative group',
                  pathname === link.href ? activeLinkColor : linkColor
                )}
              >
                {link.label}
                <span className={cn(
                  'absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300',
                  pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                )} />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/contribute"
              className={cn(
                'font-ui text-sm px-5 py-2.5 transition-all tracking-wide border',
                scrolled || !isHome
                  ? 'bg-navy text-ivory border-navy hover:bg-navy-deep'
                  : 'bg-ivory/10 text-ivory border-ivory/30 hover:bg-ivory/20'
              )}
            >
              Contribute
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
                  'block h-px transition-all duration-300',
                  scrolled || !isHome ? 'bg-navy' : 'bg-ivory',
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
        className={cn(
          'fixed inset-0 z-40 bg-navy flex flex-col transition-transform duration-500 md:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex-1 flex flex-col justify-center px-10 gap-10 pt-24">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-display text-4xl font-bold tracking-tight transition-colors',
                pathname === link.href ? 'text-gold' : 'text-ivory/50 hover:text-ivory'
              )}
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contribute"
            className="mt-4 font-ui text-sm px-6 py-3 bg-gold text-ink tracking-wide inline-block w-fit font-medium"
          >
            Contribute to the Archive
          </Link>
        </div>
        <div className="px-10 pb-10 border-t border-ivory/10 pt-6 flex items-center gap-3">
          <span className="relative grid place-items-center h-10 w-14 rounded overflow-hidden bg-ivory border border-gold/40">
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
