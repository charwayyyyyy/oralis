import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oralis — Living Cultural Preservation Platform',
    short_name: 'Oralis',
    description: 'Living atlas of endangered languages, community pronunciations, and oral memory.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A1230',
    theme_color: '#0A1230',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/oralis-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/oralis-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'culture', 'reference', 'books'],
  }
}
