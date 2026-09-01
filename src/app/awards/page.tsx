import Link from 'next/link';
import type { Metadata } from 'next';
import { getLiveAwardPrograms } from '@/lib/award-hubs';

/** /awards — index of the award hub pages. */

export const revalidate = 3600;

const SITE_URL = 'https://barmagazine.com';

export const metadata: Metadata = {
  title: 'Bar Awards: Honored Bars in Our Directory',
  description:
    'Award recognition across the BarMagazine directory: the 50 Best lists, the Spirited Awards and more, verified from official results and linked to every honored bar.',
  alternates: { canonical: `${SITE_URL}/awards` },
  robots: { index: true, follow: true },
};

export default async function AwardsIndexPage() {
  const programs = await getLiveAwardPrograms();
  return (
    <div className="best-bars-page">
      <header className="best-bars-hero">
        <span className="best-bars-kicker">Award hubs</span>
        <h1>Bar Awards in the Directory</h1>
        <p className="best-bars-intro">
          These hubs track which bars in the BarMagazine directory hold recognition from the major
          international award programs, grouped by year and category, verified from official results.
        </p>
        <p className="awards-integrity">
          Recognition here is verified from official results and is never for sale.
        </p>
      </header>
      <ul className="awards-bar-list awards-program-list">
        {programs.map(({ program, barCount }) => (
          <li key={program.slug}>
            <Link href={`/awards/${program.slug}`} className="awards-bar-link">
              <strong>{program.name}</strong>
              <span>{barCount} honored bars</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
