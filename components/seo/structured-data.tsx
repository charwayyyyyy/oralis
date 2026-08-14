import React from 'react'

export interface WebSiteSchemaProps {
  url?: string
  name?: string
  description?: string
}

export interface OrganizationSchemaProps {
  url?: string
  name?: string
  logo?: string
}

export interface LanguageDatasetSchemaProps {
  name: string
  nativeName?: string
  description?: string
  isoCode?: string
  url: string
  region?: string
  country?: string
  continent?: string
  speakers?: number
  vitalityStatus?: string
  vitalityScore?: number
  dateModified?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oralis-psi.vercel.app'

export function WebSiteSchema({
  url = BASE_URL,
  name = 'Oralis — Every Language Carries a World',
  description = 'A living cultural atlas for preserving endangered languages, oral histories and cultural knowledge in communities’ own voices.',
}: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name: 'Oralis Platform',
      url: BASE_URL,
      logo: `${BASE_URL}/gravatar.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/explore?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function OrganizationSchema({
  url = BASE_URL,
  name = 'Oralis',
  logo = `${BASE_URL}/gravatar.png`,
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description: 'Oralis is a cultural-memory and endangered-language preservation platform built with native speaker communities.',
    knowsAbout: [
      'Endangered Languages',
      'Indigenous Cultural Preservation',
      'Linguistic Anthropology',
      'Oral Traditions',
      'Community Archiving',
    ],
    sameAs: [
      'https://github.com/charwayyyyyy/oralis',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function LanguageDatasetSchema({
  name,
  nativeName,
  description,
  isoCode,
  url,
  region,
  country,
  continent,
  speakers,
  vitalityStatus,
  vitalityScore,
  dateModified = new Date().toISOString(),
}: LanguageDatasetSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${name}${nativeName ? ` (${nativeName})` : ''} Language Archive`,
    description: description || `Preserved linguistic records, audio pronunciations, and oral histories of the ${name} language.`,
    url,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    inLanguage: isoCode || 'und',
    keywords: [
      name,
      nativeName,
      'Endangered Language',
      vitalityStatus,
      country,
      region,
      continent,
      'Oralis Cultural Atlas',
    ].filter(Boolean),
    spatialCoverage: {
      '@type': 'Place',
      name: `${region ? `${region}, ` : ''}${country || continent || 'Global'}`,
    },
    variableMeasured: [
      'Pronunciation Audio',
      'Vocabulary Definitions',
      'Cultural Context',
      'Oral Stories',
    ],
    creator: {
      '@type': 'Organization',
      name: 'Oralis Living Cultural Atlas',
      url: BASE_URL,
    },
    additionalProperty: [
      speakers !== undefined ? {
        '@type': 'PropertyValue',
        name: 'Estimated Living Speakers',
        value: speakers,
      } : null,
      vitalityScore !== undefined ? {
        '@type': 'PropertyValue',
        name: 'Vitality Score',
        value: `${vitalityScore}/100`,
      } : null,
      vitalityStatus ? {
        '@type': 'PropertyValue',
        name: 'Endangerment Status',
        value: vitalityStatus,
      } : null,
    ].filter(Boolean),
    dateModified,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
