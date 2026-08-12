import type { MetadataRoute } from 'next'
import { getAllLanguages } from '@/lib/services/languages'
import { LANGUAGES } from '@/lib/data'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oralis.world'

function parseSafeDate(val?: string): Date {
  if (!val) return new Date()
  const d = new Date(val)
  return isNaN(d.getTime()) ? new Date() : d
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 1. Core platform routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/observatory`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contribute`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/guidelines`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 2. Dynamic language profile routes
  let allLanguages = LANGUAGES
  try {
    const fetched = await getAllLanguages()
    if (fetched && fetched.length > 0) {
      allLanguages = fetched
    }
  } catch (err) {
    console.warn('[sitemap] Failed to fetch live languages, using static fallback:', err)
  }

  const languageRoutes: MetadataRoute.Sitemap = allLanguages.map((lang) => ({
    url: `${BASE_URL}/language/${lang.id}`,
    lastModified: parseSafeDate(lang.lastContribution),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...languageRoutes]
}
