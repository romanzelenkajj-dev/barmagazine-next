import type { Metadata } from 'next';

const SITE_URL = 'https://barmagazine.com';

export const metadata: Metadata = {
  title: 'Claim & Upgrade Your Bar',
  description: 'Claim your bar listing on BarMagazine. Choose from Listed (Free), Featured, or Featured + Social tiers to boost your visibility.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'List Your Bar',
    description: 'Get featured in the global bar directory. Free listing or premium plans available.',
    url: `${SITE_URL}/claim-your-bar`,
    images: [{ url: `${SITE_URL}/og-claim.jpg`, width: 1200, height: 630, alt: 'List Your Bar on BarMagazine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Bar',
    images: [`${SITE_URL}/og-claim.jpg`],
  },
};

export default function ClaimYourBarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
