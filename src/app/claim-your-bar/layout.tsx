import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim & Upgrade Your Bar — BarMagazine',
  description: 'Claim your bar listing on BarMagazine. Choose from Listed (Free), Featured, or Featured + Social tiers to boost your visibility.',
  robots: { index: false, follow: false },
};

export default function ClaimYourBarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
