/**
 * app/language/[id]/page.tsx
 *
 * Server Component — fetches language data from DynamoDB.
 * generateStaticParams fetches all IDs at build time for SSG.
 * Falls back to static data if DynamoDB is unavailable.
 */

import { notFound }   from 'next/navigation'
import LanguageDetailClient from '@/components/language/language-detail-client'
import { getLanguageById, getAllLanguages } from '@/lib/services/languages'
import { LANGUAGES } from '@/lib/data'

export const revalidate = 3600

// Generate static paths from DynamoDB at build time (falls back to local data)
export async function generateStaticParams() {
  try {
    const languages = await getAllLanguages()
    if (languages.length > 0) {
      return languages.map((l) => ({ id: l.id }))
    }
  } catch {
    // DynamoDB not yet configured — use static fallback
  }
  return LANGUAGES.map((l) => ({ id: l.id }))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function LanguageDetailPage({ params }: Props) {
  const { id } = await params

  // Try DynamoDB first, fall back to static data
  let lang = null
  try {
    lang = await getLanguageById(id)
  } catch {
    lang = LANGUAGES.find((l) => l.id === id) ?? null
  }

  // If still not found, try static fallback before 404
  if (!lang) {
    lang = LANGUAGES.find((l) => l.id === id) ?? null
  }

  if (!lang) notFound()

  return (
    <>
<LanguageDetailClient lang={lang} />
</>
  )
}
