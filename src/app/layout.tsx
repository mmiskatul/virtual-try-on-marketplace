import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import '../lib/server-security';
import { QueryProvider } from '../providers/QueryProvider';
import { WebVitalReporter } from '../components/telemetry/WebVitalReporter';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://v-try.fashion';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'V-TRY | Multi-Brand AI Fashion Marketplace',
    template: '%s | V-TRY Marketplace',
  },
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
    'Designer Blazers',
  ],
  authors: [{ name: 'V-TRY Central Fashion Platform', url: siteUrl }],
  creator: 'V-TRY Platform Inc.',
  publisher: 'V-TRY Platform Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'V-TRY Multi-Brand AI Fashion Marketplace',
    title: 'V-TRY | Multi-Brand AI Virtual Try-On Fashion Marketplace',
    description:
      'Discover curated luxury fashion boutiques and try on garments virtually before purchase with deep neural flow synthesis.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'V-TRY AI Virtual Fitting Room',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'V-TRY | Multi-Brand AI Virtual Try-On Fashion Marketplace',
    description: 'Experience zero-friction fashion with AI virtual try-on across independent boutiques.',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80'],
    creator: '@VTryFashion',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = headers().get('x-nonce') ?? undefined;

  return (
    <html
      lang="en"
      className={`dark ${plusJakartaSans.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Dynamic Cryptographic Nonce for Strict CSP Verification */}
        {nonce && <meta name="csp-nonce" content={nonce} />}
      </head>
      <body
        className="min-h-screen bg-white text-gray-900 font-sans antialiased"
        data-csp-protected={nonce ? 'true' : undefined}
      >
        <QueryProvider>
          {/* Live Real User Monitoring (RUM) for Core Web Vitals */}
          <WebVitalReporter serviceName="vton-marketplace" />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
