import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cinematch PWA',
    short_name: 'Cinematch',
    description: 'Encuentra y empareja tus películas favoritas con una interfaz glassmorphic premium al estilo iOS.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#07070a',
    theme_color: '#07070a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
