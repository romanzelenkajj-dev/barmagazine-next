import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { NearMeBar } from '@/components/NearMeBar';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { Analytics } from '@vercel/analytics/react';
import { getDirectoryStats } from '@/lib/bar-count';


const inter = Inter({ subsets: ['latin'] });

const SITE_URL = 'https://barmagazine.com';

export async function generateMetadata(): Promise<Metadata> {
  // Always use the static OG image hosted on barmagazine.com to avoid staging domain in meta tags
  const ogImage = `${SITE_URL}/og-image.png`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: 'BarMagazine | Best Bars, Cocktails & Spirits',
      template: '%s | BarMagazine',
    },
    description: 'Global bar news, cocktail culture, and spirits industry trends. Discover the world\'s best bars, latest cocktail recipes, and industry insights.',
    alternates: {
      canonical: SITE_URL,
    },
    icons: {
      icon: [
        { url: '/favicon-32x32.png?v=20260320', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png?v=20260320', sizes: '16x16', type: 'image/png' },
      ],
      shortcut: '/favicon.ico?v=20260320',
      apple: '/apple-touch-icon.png?v=20260320',
    },
    openGraph: {
      title: 'BarMagazine',
      description: 'Global bar news, cocktail culture, and spirits industry trends.',
      type: 'website',
      locale: 'en_US',
      siteName: 'BarMagazine',
      url: SITE_URL,
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'BarMagazine' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'BarMagazine',
      description: 'Global bar news, cocktail culture, and spirits industry trends.',
      images: [ogImage],
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { barsRounded, cities } = await getDirectoryStats();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'BarMagazine',
              url: 'https://barmagazine.com',
              description: 'Global bar news, cocktail culture, and spirits industry trends.',
              publisher: {
                '@type': 'Organization',
                name: 'BarMagazine',
                url: 'https://barmagazine.com',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://barmagazine.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://barmagazine.com/#organization',
              name: 'BarMagazine',
              url: 'https://barmagazine.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://barmagazine.com/og-image.png',
                width: 1200,
                height: 630,
              },
              description: 'Global bar news, cocktail culture, and spirits industry trends. Discover the world\'s best bars, latest cocktail recipes, and industry insights.',
              sameAs: [
                'https://www.facebook.com/BARMAGAZINEcom',
                'https://www.instagram.com/barmagazine',
                'https://www.linkedin.com/company/barmagazine',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'office@barmagazine.com',
                contactType: 'customer service',
              },
            }),
          }}
        />
        {/*
          Gate analytics to PRODUCTION deployments only. VERCEL_ENV is
          'production' | 'preview' | 'development'; on preview deploys and local
          `next dev` this is not 'production', so no GA scripts reach the HTML at
          all. The component itself adds the second half of the rule — it only
          fires on the canonical host (barmagazine.com) — so a production build
          served on a *.vercel.app alias still stays out of analytics (and is
          308-redirected to the apex by middleware regardless).
        */}
        {process.env.VERCEL_ENV === 'production' && <GoogleAnalytics />}
        {/* Vercel Web Analytics: bot-filtered by design, our clean second
            measurement source next to GA (which the Singapore bot inflates).
            The component no-ops unless analytics is enabled on the project. */}
        <Analytics />
        <Nav />
        <div className="nav-spacer" />
        <div className="container">
          {children}
          <Footer />
        </div>
        <CookieConsent />
        <NearMeBar barCount={barsRounded} cityCount={cities} />
      </body>
    </html>
  );
}
