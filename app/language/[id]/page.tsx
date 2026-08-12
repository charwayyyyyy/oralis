/**
 * app/language/[id]/page.tsx
 *
 * Server Component — fetches language data from DynamoDB.
 * generateStaticParams fetches all IDs at build time for SSG.
 * Falls back to static data if DynamoDB is unavailable.
 * Generates dynamic Schema.org Dataset metadata for Google indexation.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LanguageDetailClient from '@/components/language/language-detail-client'
import { getLanguageById, getAllLanguages } from '@/lib/services/languages'
import { LANGUAGES, VITALITY_STATUS_LABELS } from '@/lib/data'
import { LanguageDatasetSchema } from '@/components/seo/structured-data'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oralis.world'

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  let lang = null
  try {
    lang = await getLanguageById(id)
  } catch {
    lang = LANGUAGES.find((l) => l.id === id) ?? null
  }
  if (!lang) {
    lang = LANGUAGES.find((l) => l.id === id) ?? null
  }

  if (!lang) {
    return {
      title: 'Language Archive Not Found',
      description: 'The requested language could not be found in the Oralis Living Cultural Atlas.',
    }
  }

  const statusLabel = VITALITY_STATUS_LABELS[lang.status] || 'Endangered'
  const title = `${lang.name}${lang.nativeName ? ` (${lang.nativeName})` : ''} — ${statusLabel} Language Archive`
  const description = `Explore and preserve the ${lang.name} language (${lang.region}, ${lang.country}). Listen to native pronunciations, oral memories, and cultural context on Oralis.`

  return {
    title,
    description,
    keywords: [
      lang.name,
      lang.nativeName,
      `${lang.name} language`,
      `${lang.name} audio dictionary`,
      `${lang.name} pronunciation`,
      lang.country,
      lang.region,
      lang.continent,
      statusLabel,
      'endangered language preservation',
    ].filter(Boolean) as string[],
    alternates: {
      canonical: `/language/${lang.id}`,
    },
    openGraph: {
      type: 'article',
      title: `${title} | Oralis`,
      description,
      url: `${SITE_URL}/language/${lang.id}`,
      images: [
        {
          url: '/oralis-logo.png',
          width: 1200,
          height: 630,
          alt: `${lang.name} Cultural Archive on Oralis`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Oralis`,
      description,
      images: ['/oralis-logo.png'],
    },
  }
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

  if (!lang) {
    lang = LANGUAGES.find((l) => l.id === id) ?? null
  }

  if (!lang) notFound()

  return (
    <>
      <LanguageDatasetSchema
        name={lang.name}
        nativeName={lang.nativeName}
        description={lang.description}
        url={`${SITE_URL}/language/${lang.id}`}
        region={lang.region}
        country={lang.country}
        continent={lang.continent}
        speakers={lang.speakers}
        vitalityStatus={VITALITY_STATUS_LABELS[lang.status]}
        vitalityScore={lang.vitalityScore}
        dateModified={
          lang.lastContribution && !isNaN(new Date(lang.lastContribution).getTime())
            ? new Date(lang.lastContribution).toISOString()
            : new Date().toISOString()
        }
      />
      <LanguageDetailClient lang={lang} />
    </>
  )
}
