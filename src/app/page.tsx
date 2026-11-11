import type { Metadata } from 'next';
import { MarketplaceClient } from './MarketplaceClient';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../data/catalogSeed';

export const metadata: Metadata = {
  title: 'V-TRY | Fashion That Fits You Before You Buy',
  description:
    'Discover independent fashion brands, browse editorial collections, and experience AI-powered virtual try-on before you buy.',
};

export default function MarketplaceHomePage() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'V-TRY Multi-Brand Fashion Marketplace',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/discover?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FashionStore',
        '@id': `${siteUrl}/#store`,
        name: 'V-TRY Central Fashion Marketplace',
        url: siteUrl,
        brand: INITIAL_BRANDS.map((b) => ({
          '@type': 'Brand',
          name: b.name,
          url: `${siteUrl}/brands/${b.slug}`,
        })),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Published Fashion Catalog',
          itemListElement: INITIAL_PRODUCTS.slice(0, 12).map((p, idx) => ({
            '@type': 'Offer',
            position: idx + 1,
            itemOffered: {
              '@type': 'Product',
              name: p.name,
              image: p.image,
              description: p.description,
              offers: {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: 'USD',
              },
            },
          })),
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />
      <MarketplaceClient />
    </>
  );
}
