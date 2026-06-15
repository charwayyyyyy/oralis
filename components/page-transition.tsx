'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

// Depth map: deeper pages = higher number (used for zoom direction)
function getDepth(path: string): number {
  if (path === '/') return 0
  if (path === '/explore') return 1
  if (path === '/insights') return 1
  if (path === '/contribute') return 1
  if (path === '/profile') return 1
  if (path.startsWith('/language/')) return 2
  return 1
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const prevPathRef = useRef(pathname)
  const prevDepthRef = useRef(getDepth(pathname))

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      const newDepth = getDepth(pathname)
      prevPathRef.current = pathname
      prevDepthRef.current = newDepth

      setIsTransitioning(true)
      // Quick fade then update
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setIsTransitioning(false)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setDisplayChildren(children)
    }
  }, [pathname, children])

  return (
    <div
      className="min-h-screen"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'scale(0.985)' : 'scale(1)',
        filter: isTransitioning ? 'blur(2px)' : 'blur(0)',
        transition: 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease',
      }}
    >
      {displayChildren}
    </div>
  )
}
