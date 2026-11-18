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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NODE_ENV === 'production' ? 'https://vtrystudio.com' : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'V-TRY | Multi-Brand AI Virtual Try-On Fashion Marketplace',
    template: '%s | V-TRY Marketplace',
  },
  description:
    'Discover independent clothing brands, browse editorial collections, and experience AI-powered virtual try-on before you buy.',
  keywords: [
    'Virtual Try-On',
    'AI Fashion Marketplace',
    'Multi-Brand Storefronts',
    'Online Fitting Room',
    'VITON-HD',
    'Menswear',
    'Womenswear',
    'Traditional Wear',
  ],
  authors: [{ name: 'V-TRY Central Fashion Marketplace', url: siteUrl }],
  creator: 'V-TRY Platform',
  publisher: 'V-TRY Platform',
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
    title: 'V-TRY | Fashion That Fits You Before You Buy',
    description:
      'Explore independent fashion brands and visualize garments on yourself with AI-powered virtual try-on.',
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
    title: 'V-TRY | Multi-Brand AI Fashion Marketplace',
    description: 'See how clothes from independent brands look on you before you buy.',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {nonce && <meta name="csp-nonce" content={nonce} />}
      </head>
      <body
        className="min-h-screen bg-[#FAF9F6] text-gray-900 font-sans antialiased"
        data-csp-protected={nonce ? 'true' : undefined}
      >
        <QueryProvider>
          <WebVitalReporter serviceName="vton-marketplace" />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
