'use client'

import Link from 'next/link'
import Image from 'next/image'
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Oralis — Home">
            <Image
              src="/oralis-logo.png"
              alt="Oralis"
              width={120}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
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
        <div className="px-10 pb-10 border-t border-ivory/10 pt-6">
          <Image src="/oralis-logo.png" alt="Oralis" width={100} height={40} className="h-8 w-auto brightness-0 invert opacity-40" />
        </div>
      </div>
    </>
  )
}
