import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora, Inter, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/page-transition'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { WebSiteSchema, OrganizationSchema } from '@/components/seo/structured-data'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oralis.world'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Oralis — Living Atlas of Endangered Languages & Cultural Memory',
    template: '%s | Oralis',
  },
  description:
    'Every language carries a world. Oralis is a living cultural preservation platform where native speakers, families, and communities archive endangered languages, oral histories, and pronunciations in their own voices.',
  keywords: [
    'endangered languages',
    'language preservation',
    'cultural memory',
    'oral traditions',
    'indigenous languages',
    'linguistic atlas',
    'audio dictionary',
    'language revitalization',
    'UNESCO endangered languages',
    'cultural heritage',
  ],
  authors: [{ name: 'Oralis Platform', url: SITE_URL }],
  creator: 'Oralis',
  publisher: 'Oralis Cultural Preservation Platform',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Oralis — Living Cultural Preservation Platform',
    title: 'Oralis — Living Atlas of Endangered Languages & Cultural Memory',
    description:
      'Every language carries a world. Explore living voices, pronunciations, and oral histories of endangered languages across the globe.',
    images: [
      {
        url: '/oralis-logo.png',
        width: 1200,
        height: 630,
        alt: 'Oralis Endangered Languages Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oralis — Living Atlas of Endangered Languages & Cultural Memory',
    description:
      'Every language carries a world. Safeguarding humanity\'s endangered linguistic heritage with native speaker communities.',
    images: ['/oralis-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/oralis-logo.png' },
      { url: '/icon.png' },
    ],
    apple: [
      { url: '/oralis-logo.png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1230',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lora.variable} ${inter.variable} ${ibmPlexMono.variable} bg-navy-abyss`}
    >
      <head>
        <WebSiteSchema />
        <OrganizationSchema />
      </head>
      <body className="antialiased font-body flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  )
}
