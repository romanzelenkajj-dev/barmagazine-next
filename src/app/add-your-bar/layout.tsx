import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Your Bar | BarMagazine',
  description: 'Submit your bar to the BarMagazine directory. Free listing for bars worldwide.',
  alternates: { canonical: 'https://barmagazine.com/add-your-bar' },
};

export default function AddYourBarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
