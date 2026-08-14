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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oralis-psi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Oralis — Every Language Carries a World',
    template: '%s | Oralis',
  },
  description:
    'A living cultural atlas for preserving endangered languages, oral histories and cultural knowledge in communities’ own voices.',
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
    siteName: 'Oralis',
    title: 'Oralis — Every Language Carries a World',
    description:
      'A living cultural atlas for preserving endangered languages, oral histories and cultural knowledge in communities’ own voices.',
    images: [
      {
        url: '/socialshare.png',
        width: 1200,
        height: 630,
        alt: 'Oralis — a living cultural atlas for endangered languages',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oralis — Every Language Carries a World',
    description:
      'A living cultural atlas for preserving endangered languages, oral histories and cultural knowledge in communities’ own voices.',
    images: ['/socialshare.png'],
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
      suppressHydrationWarning
      className={`${playfair.variable} ${lora.variable} ${inter.variable} ${ibmPlexMono.variable} bg-navy-abyss`}
    >
      <head>
        <WebSiteSchema />
        <OrganizationSchema />
      </head>
      <body suppressHydrationWarning className="antialiased font-body flex flex-col min-h-screen">
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
