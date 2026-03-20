import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://barmagazine.com'),
  title: {
    default: 'BarMagazine | Best Bars, Cocktails & Spirits',
    template: '%s | BarMagazine',
  },
  description: 'Global bar news, cocktail culture, and spirits industry trends. Discover the world\'s best bars, latest cocktail recipes, and industry insights.',
  alternates: {
    canonical: 'https://barmagazine.com',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=5', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=5', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=5',
    apple: '/apple-touch-icon.png?v=5',
  },
  openGraph: {
    title: 'BarMagazine',
    description: 'Global bar news, cocktail culture, and spirits industry trends.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BarMagazine',
    url: 'https://barmagazine.com',
    images: [{ url: 'https://barmagazine.com/og-image.png', width: 1200, height: 630, alt: 'BarMagazine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BarMagazine',
    description: 'Global bar news, cocktail culture, and spirits industry trends.',
    images: ['https://barmagazine.com/og-image.png'],
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
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JBGVJDXD9E"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JBGVJDXD9E');
          `}
        </Script>
      </head>
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
        <Nav />
        <div className="nav-spacer" />
        <div className="container">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
