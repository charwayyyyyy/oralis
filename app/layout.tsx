import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora, Inter, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Oralis — Global Cultural Memory Network',
  description:
    'Preserve endangered languages, oral traditions, and cultural memory for future generations. A living archive of humanity\'s linguistic heritage.',
  keywords: ['endangered languages', 'cultural preservation', 'oral traditions', 'indigenous languages', 'linguistic heritage'],
  authors: [{ name: 'Oralis' }],
  openGraph: {
    title: 'Oralis — Global Cultural Memory Network',
    description: 'Every language carries a world of knowledge.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F7F4EE',
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
      className={`${playfair.variable} ${lora.variable} ${inter.variable} ${ibmPlexMono.variable} bg-background`}
    >
      <body className="antialiased font-body">
        {children}
      </body>
    </html>
  )
}
