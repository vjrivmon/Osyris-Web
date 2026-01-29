import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Grupo Scout Osyris',
    short_name: 'Osyris',
    description: 'Grupo Scout Osyris: educación integral para jóvenes de 5 a 19 años en Valencia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a5632',
    icons: [
      {
        src: '/images/logo-osyris.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/logo-osyris.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
