'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/explore', label: 'Explore' },
  { href: '/contribute', label: 'Contribute' },
  { href: '/insights', label: 'Insights' },
  { href: '/profile', label: 'Profile' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-surface/95 backdrop-blur-sm border-b border-border'
            : 'bg-transparent'
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Oralis — Home"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-earth flex items-center justify-center">
                <span className="text-xs font-display font-bold text-primary-foreground tracking-widest">O</span>
              </div>
              <div className="absolute -inset-1 rounded-full border border-gold/30 group-hover:border-gold/60 transition-colors" />
            </div>
            <span
              className={cn(
                'font-display font-bold text-lg tracking-wide transition-colors',
                scrolled ? 'text-foreground' : 'text-foreground'
              )}
            >
              Oralis
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-ui text-sm tracking-wide transition-colors relative group',
                  pathname === link.href
                    ? 'text-earth font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300',
                    pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/contribute"
              className="font-ui text-sm px-5 py-2 bg-earth text-primary-foreground rounded-sm hover:bg-clay transition-colors tracking-wide"
            >
              Start Preserving
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span
              className={cn(
                'block w-6 h-px bg-foreground transition-all duration-300',
                menuOpen && 'rotate-45 translate-y-2'
              )}
            />
            <span
              className={cn(
                'block w-6 h-px bg-foreground transition-all duration-300',
                menuOpen && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'block w-6 h-px bg-foreground transition-all duration-300',
                menuOpen && '-rotate-45 -translate-y-2'
              )}
            />
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-surface flex flex-col transition-transform duration-500 md:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex-1 flex flex-col justify-center px-8 gap-8 pt-20">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-display text-4xl font-bold tracking-tight transition-colors',
                pathname === link.href ? 'text-earth' : 'text-foreground/60 hover:text-foreground'
              )}
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contribute"
            className="mt-4 font-ui text-base px-6 py-3 bg-earth text-primary-foreground rounded-sm hover:bg-clay transition-colors tracking-wide inline-block w-fit"
          >
            Start Preserving
          </Link>
        </div>
        <div className="px-8 pb-8 border-t border-border pt-6">
          <p className="font-ui text-xs text-muted-foreground tracking-widest uppercase">
            Every language carries a world of knowledge.
          </p>
        </div>
      </div>
    </>
  )
}
