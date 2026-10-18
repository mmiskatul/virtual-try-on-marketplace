import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'V-TRY | Multi-Brand AI Virtual Try-On Fashion Marketplace',
    short_name: 'V-TRY Fashion',
    description: 'Discover luxury apparel across designer brands and try on clothes virtually before purchasing.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#9333ea',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
