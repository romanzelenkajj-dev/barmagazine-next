import type { Metadata } from 'next';

const SITE_URL = 'https://barmagazine.com';

export const metadata: Metadata = {
  title: 'Add Your Bar | BarMagazine',
  description: 'Submit your bar to the BarMagazine directory. Free listing for bars worldwide.',
  alternates: { canonical: `${SITE_URL}/add-your-bar` },
  openGraph: {
    title: 'Add Your Bar | BarMagazine',
    description: 'Submit your bar to the global bar directory. Free listing available.',
    url: `${SITE_URL}/add-your-bar`,
    images: [{ url: `${SITE_URL}/og-claim.jpg`, width: 1200, height: 630, alt: 'Add Your Bar to BarMagazine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Add Your Bar | BarMagazine',
    images: [`${SITE_URL}/og-claim.jpg`],
  },
};

export default function AddYourBarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
