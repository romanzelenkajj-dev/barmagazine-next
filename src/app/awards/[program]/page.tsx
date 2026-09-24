import { firstSentence } from '@/lib/first-sentence';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { programBySlug, getProgramYears, getLiveAwardPrograms } from '@/lib/award-hubs';
import type { HonoredBar } from '@/lib/award-hubs';
import { hubEditions, buildHubPanels, defaultSelection, yearsFor, COLLAPSED_CARDS } from '@/lib/award-hub-model';
import { placeLine } from '@/lib/city-location';
import { DirectoryBarCard } from '@/components/DirectoryBarCard';
import { AwardHubSwitcher, type SwitcherPanel } from '@/components/AwardHubSwitcher';

/**
 * /awards/[program] — award hub pages built from the accolades data.
 *
 * One page per award program (The 50 Best Bars family, Spirited Awards,
 * Bartenders' Choice, James Beard), every honored bar in the directory,
 * each linking to its profile. One list at a time (task 121): the page
 * carries every edition and year as a panel, the switcher shows one, the
 * default being the world list in its most recent year. A program with no
 * honored bars is not generated, so a hub can never ship empty.
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
  // The old name once, for search (task 121); the editions named so a
  // regional query finds the hub too.
  const description = program.slug === 'worlds-50-best'
    ? `${barCount} bars in the BarMagazine directory hold a place on The 50 Best Bars, formerly The World's 50 Best Bars, or its Asia, Europe and North America editions, ${yearSpan}. Verified from official results, one list at a time, with a profile for every bar.`
    : `${barCount} bars in the BarMagazine directory hold ${program.name} recognition, ${yearSpan}. Verified from official results, one list at a time, with a profile for every bar.`;
  const url = `${SITE_URL}/awards/${program.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: `${title} | BarMagazine`, description, type: 'website', url, siteName: 'BarMagazine' },
  };
}

/**
 * An honoured bar as the rest of the site draws it. The rank rides inside
 * the card as a pill on the photo (task 112); a category, where the block
 * has no single label, rides inside the cell as a kicker.
 */
function AwardCard({ bar, kicker }: { bar: HonoredBar; kicker: string | null }) {
  const rank = bar.entry.kind === 'ranked' ? bar.entry.rank : null;
  return (
    <div className="awards-card">
      {kicker && <p className="awards-card-kicker">{kicker}</p>}
      <DirectoryBarCard bar={bar} locationLine={placeLine(bar)} rankPill={rank != null ? `No. ${rank}` : null} />
    </div>
  );
}

export default async function AwardProgramPage({ params }: { params: { program: string } }) {
  const program = programBySlug(params.program);
  if (!program) notFound();

  const years = await getProgramYears(program);
  if (years.length === 0) notFound();

  const otherPrograms = (await getLiveAwardPrograms()).filter(p => p.program.slug !== program.slug);

  const editions = hubEditions(program);
  const panels = buildHubPanels(years, editions);
  const initial = defaultSelection(panels, editions);
  if (!initial) notFound();

  // The switcher gets the editions that have records, with their years, and
  // every panel with its cards already rendered; it only shows and hides.
  const switcherEditions = editions
    .map(e => ({ slug: e.slug, label: e.label, name: e.name, years: yearsFor(panels, e.slug) }))
    .filter(e => e.years.length > 0);
  const switcherPanels: SwitcherPanel[] = panels.map(p => ({
    edition: p.edition,
    year: p.year,
    // The count line counts placings only (Roman, 2026-09-23): on a ranked
    // list a special-award record must not make 100 read as 101. A category
    // program, which has no placings, counts its distinct bars.
    total: (() => {
      const ranked = p.blocks.filter(b => b.id === '1-50' || b.id === '51-100');
      return ranked.length
        ? ranked.reduce((n, b) => n + b.cells.length, 0)
        : new Set(p.blocks.flatMap(b => b.cells.map(c => c.bar.slug))).size;
    })(),
    blocks: p.blocks.map(b => {
      const cards = b.cells.map(c => <AwardCard key={`${c.bar.slug}-${b.id}`} bar={c.bar} kicker={c.kicker} />);
      return {
        id: b.id,
        label: b.label,
        total: b.cells.length,
        head: cards.slice(0, COLLAPSED_CARDS),
        rest: cards.slice(COLLAPSED_CARDS),
      };
    }),
  }));

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
          {/* The standing integrity block is gone from the hubs (Roman,
              2026-09-21). Bartenders' Choice keeps the point as one clause
              inside the intro, because that is the hub where a reader meets
              the word "Featured" on the cards themselves. `.awards-integrity`
              stays in the CSS for /awards, the index. */}
          <p className="best-bars-intro">
            {firstSentence(program.tagline)}
            {program.slug === 'bartenders-choice'
              && ' The award is editorial; Featured listings play no part in it.'}
          </p>
        </header>

        <AwardHubSwitcher
          editions={switcherEditions}
          panels={switcherPanels}
          defaultEdition={initial.edition}
          defaultYear={initial.year}
        />

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
