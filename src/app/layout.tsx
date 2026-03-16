import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bar Magazine | Best Bars, Cocktails & Spirits',
  description: 'Global bar news, cocktail culture, and spirits industry trends. Discover the world\'s best bars, latest cocktail recipes, and industry insights.',
  openGraph: {
    title: 'Bar Magazine',
    description: 'Global bar news, cocktail culture, and spirits industry trends.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Bar Magazine',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
