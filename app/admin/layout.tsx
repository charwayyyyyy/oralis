import React from 'react'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, verifyAdminSession } from '@/lib/auth/admin'
import AdminLayoutClient from '@/components/admin/admin-layout-client'

export const metadata: Metadata = {
  title: 'Oralis Living Cultural Atlas — Administration & Moderation',
  description: 'Control panel for reviewing, moderating, and curating endangered language submissions and oral history records.',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Verify session on the server
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  const session = await verifyAdminSession(token)

  // If not logged in, we let the client shell handle login page redirection
  return <AdminLayoutClient initialSession={session}>{children}</AdminLayoutClient>
}
