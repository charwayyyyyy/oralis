import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora, Inter, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/page-transition'

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
  weight: ['400', '500', '600'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Oralis — A Living Atlas of Human Cultural Memory',
  description:
    'Navigate humanity\'s linguistic heritage. 2,847 endangered languages, 186,200 hours of oral memory. A living cultural atlas built with communities, for all humanity.',
  keywords: ['endangered languages', 'cultural preservation', 'oral traditions', 'indigenous languages', 'linguistic heritage', 'cultural atlas'],
  authors: [{ name: 'Oralis' }],
  openGraph: {
    title: 'Oralis — A Living Atlas of Human Cultural Memory',
    description: 'Every language carries a world of knowledge.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0A1230',
  width: 'device-width',
  initialScale: 1,
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
      <body className="antialiased font-body">
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
}
