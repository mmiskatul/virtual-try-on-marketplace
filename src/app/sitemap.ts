import { MetadataRoute } from 'next';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../lib/mock_data';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://v-try.fashion';
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Dynamic brand store filter routes
  INITIAL_BRANDS.forEach((brand) => {
    routes.push({
      url: `${siteUrl}/?brand=${brand.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  return routes;
}
