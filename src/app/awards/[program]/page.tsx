import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { programBySlug, getProgramYears, getLiveAwardPrograms } from '@/lib/award-hubs';

/**
 * /awards/[program] — award hub pages built from the accolades data.
 *
 * One page per award program (World's 50 Best family, Spirited Awards,
 * Bartenders' Choice), listing every honored bar in the directory grouped
 * by year and category, each linking to its profile. These are reference
 * pages for journalists; the integrity line is part of the content.
 * A program with no honored bars is not generated, so a hub can never
 * ship empty.
 */

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = 'https://barmagazine.com';

export async function generateStaticParams() {
  const live = await getLiveAwardPrograms();
  return live.map(({ program }) => ({ program: program.slug }));
}

export async function generateMetadata({ params }: { params: { program: string } }): Promise<Metadata> {
  const program = programBySlug(params.program);
  if (!program) return {};
  const years = await getProgramYears(program);
  if (years.length === 0) return {};
  const barCount = new Set(years.flatMap(y => y.sections.flatMap(s => s.bars.map(b => b.slug)))).size;
  const yearSpan =
    years.length > 1 ? `${years[years.length - 1].year} to ${years[0].year}` : String(years[0].year);
  const title = `${program.name}: Honored Bars in Our Directory`;
  const description = `${barCount} bars in the BarMagazine directory hold ${program.name} recognition, ${yearSpan}. Verified from official results, grouped by year, with a profile for every bar.`;
  const url = `${SITE_URL}/awards/${program.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: `${title} | BarMagazine`, description, type: 'website', url, siteName: 'BarMagazine' },
  };
}

export default async function AwardProgramPage({ params }: { params: { program: string } }) {
  const program = programBySlug(params.program);
  if (!program) notFound();

  const years = await getProgramYears(program);
  if (years.length === 0) notFound();

  const barCount = new Set(years.flatMap(y => y.sections.flatMap(s => s.bars.map(b => b.slug)))).size;
  const otherPrograms = (await getLiveAwardPrograms()).filter(p => p.program.slug !== program.slug);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Awards', item: `${SITE_URL}/awards` },
      { '@type': 'ListItem', position: 3, name: program.name, item: `${SITE_URL}/awards/${program.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="best-bars-page">
        <header className="best-bars-hero">
          <span className="best-bars-kicker">Award hub</span>
          <h1>{program.name}</h1>
          <p className="best-bars-intro">
            {program.tagline} {barCount} bars in the BarMagazine directory hold recognition from this
            program. Every entry below is verified from the official published results and links to the
            bar&apos;s profile.
          </p>
          <p className="awards-integrity">
            Recognition on this page is verified from official results and is never for sale. Paid
            listings on BarMagazine cannot buy an award badge, a ranking, or a place here.
          </p>
        </header>

        {years.map(group => (
          <section key={group.year} className="awards-year">
            <h2>{group.year}</h2>
            {group.sections.map(section => (
              <div key={section.label} className="awards-section">
                <h3>{section.label}</h3>
                <ul className="awards-bar-list">
                  {section.bars.map(bar => (
                    <li key={`${bar.slug}-${section.label}`}>
                      <Link href={`/bars/${bar.slug}`} className="awards-bar-link">
                        <strong>{bar.name}</strong>
                        <span>
                          {bar.city}, {bar.country}
                          {bar.entry.rank != null ? ` (No. ${bar.entry.rank})` : ''}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}

        {otherPrograms.length > 0 && (
          <div className="best-bars-cities">
            <h2>Other award programs</h2>
            <div className="best-bars-cities-grid">
              {otherPrograms.map(({ program: p }) => (
                <Link key={p.slug} href={`/awards/${p.slug}`} className="best-bars-city-link">
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
