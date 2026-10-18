import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { HeroSection } from '../components/modules/HeroSection';
import { Footer } from '../components/layout/Footer';
import { MarketplaceClient } from './MarketplaceClient';
import { INITIAL_PRODUCTS, INITIAL_BRANDS } from '../lib/mock_data';

export const runtime = 'edge';
export const preferredRegion = 'auto';

export const metadata: Metadata = {
  title: 'V-TRY | Multi-Brand AI Virtual Try-On Fashion Marketplace',
  description:
    'Experience high-fidelity AI virtual fitting room across luxury fashion brands. Discover designer slip dresses, structural blazers, and luxury silks with real-time neural drape simulation.',
  keywords: [
    'Virtual Try-On',
    'AI Fashion',
    'Online Fitting Room',
    'Haute Couture',
    'Luxury Apparel',
    'VITON-HD',
    'Multi-Tenant Marketplace',
    'Silk Slip Dresses',
    'Designer Blazers'
  ],
  authors: [{ name: 'V-TRY Central Marketplace' }],
  creator: 'V-TRY Platform',
  publisher: 'V-TRY Platform',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://v-try.fashion',
    siteName: 'V-TRY Central Fashion Marketplace',
    title: 'V-TRY | Multi-Brand AI Virtual Try-On Fashion Marketplace',
    description:
      'Discover curated luxury fashion boutiques and try on garments virtually before purchase with deep neural flow synthesis.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'V-TRY AI Virtual Fitting Room'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'V-TRY | Multi-Brand AI Virtual Try-On Fashion Marketplace',
    description:
      'Experience zero-friction fashion with AI virtual try-on across independent boutiques.',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80']
  }
};

export default function MarketplaceHomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://v-try.fashion';

  // Comprehensive Schema.org Structured JSON-LD Graph for Google Search (Store, WebSite, & Sitelinks Search)
  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'V-TRY | Multi-Brand AI Fashion Marketplace',
        description: 'Multi-tenant luxury apparel marketplace powered by AI virtual try-on.',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'V-TRY Fashion Inc.',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80',
        },
        sameAs: ['https://twitter.com/VTryFashion', 'https://instagram.com/vtryfashion'],
      },
      {
        '@type': 'FashionStore',
        '@id': `${siteUrl}/#store`,
        name: 'V-TRY Central Fashion Marketplace',
        description: 'Multi-tenant luxury apparel marketplace powered by AI virtual try-on.',
        url: siteUrl,
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 30,
        },
        brand: INITIAL_BRANDS.map(b => ({
          '@type': 'Brand',
          name: b.name,
          url: `${siteUrl}/storefront/${b.slug}`,
        })),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Curated Designer Apparel',
          itemListElement: INITIAL_PRODUCTS.map((p, idx) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: p.name,
              image: p.image,
              description: `${p.name} by ${p.brandName}. ${p.fabric}. Available for AI Virtual Try-On.`,
              sku: p.id,
              offers: {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
            },
            position: idx + 1,
          })),
        },
      },
    ],
  };

  const nonce = headers().get('x-nonce') ?? undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Search Engine Structured Metadata with Cryptographic Nonce */}
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      {/* Pure React Server Component: Hero Section */}
      <HeroSection />

      {/* Interactive Client Shell */}
      <MarketplaceClient />

      {/* Pure React Server Component: Footer */}
      <Footer />
    </div>
  );
}
