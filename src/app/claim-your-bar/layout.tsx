import type { Metadata } from 'next';

const SITE_URL = 'https://barmagazine.com';

export const metadata: Metadata = {
  title: 'Claim & Upgrade Your Bar | BarMagazine',
  description: 'Claim your bar listing on BarMagazine. Choose from Listed (Free), Featured, or Featured + Social tiers to boost your visibility.',
  alternates: { canonical: `${SITE_URL}/claim-your-bar` },
  // Deliberately OUT of the index: this is a conversion flow linked from every
  // profile, so crawlers hammer it (a JS-executing sweep put it at the top of
  // GA Realtime). It should never rank; keeping it noindex + disallowed in
  // robots.txt conserves crawl budget for the directory. The indexable sales
  // page is /feature-your-bar.
  robots: { index: false, follow: true },
  openGraph: {
    title: 'List Your Bar on BarMagazine',
    description: 'Get featured in the global bar directory. Free listing or premium plans available.',
    url: `${SITE_URL}/claim-your-bar`,
    images: [{ url: `${SITE_URL}/og-claim.jpg`, width: 1200, height: 630, alt: 'List Your Bar on BarMagazine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Bar on BarMagazine',
    images: [`${SITE_URL}/og-claim.jpg`],
  },
};

export default function ClaimYourBarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
