import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { getPosts, getFeaturedImageUrl } from '@/lib/wordpress';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = 'https://barmagazine.com';

export async function generateMetadata(): Promise<Metadata> {
  let heroImg: string | null = null;
  try {
    const result = await getPosts(1, 1);
    heroImg = result.data?.[0] ? getFeaturedImageUrl(result.data[0], 'full') : null;
  } catch {
    // fallback to static OG image
  }

  const ogImage = heroImg || `${SITE_URL}/og-image.png`;

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
        <GoogleAnalytics />
        <Nav />
        <div className="nav-spacer" />
        <div className="container">
          {children}
          <Footer />
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}
