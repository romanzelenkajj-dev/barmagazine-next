import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { programBySlug, getProgramYears, getLiveAwardPrograms, compareHonoredBars } from '@/lib/award-hubs';
import { placeLine } from '@/lib/city-location';
import { DirectoryBarCard } from '@/components/DirectoryBarCard';
import type { HonoredBar } from '@/lib/award-hubs';

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

/**
 * How many bars a section needs before its heading is worth the vertical space.
 *
 * Four is the smallest number that fills a row at the narrowest desktop grid
 * width, so a heading never again introduces a row with a hole in it.
 */
const MIN_SECTION_FOR_HEADING = 4;

/**
 * An honoured bar as the rest of the site draws it, with the reason it is on
 * this page carried INSIDE its own cell.
 *
 * The kicker used to be an <h3> above the card, which is what orphaned the
 * rows. Keeping it in the cell means it travels with the bar however the grid
 * reflows, and it is the one thing an award hub must say that a city guide
 * does not.
 */
/** A year is a sequence of these: headed sections, and runs of flowed cells. */
type AwardSection = { label: string; bars: HonoredBar[] };
type YearBlock =
  | { kind: 'section'; section: AwardSection }
  | { kind: 'flow'; cells: { bar: HonoredBar; kicker: string }[] };

function AwardCard({ bar, kicker }: { bar: HonoredBar; kicker: string | null }) {
  return (
    <div className="awards-card">
      {kicker && <p className="awards-card-kicker">{kicker}</p>}
      <DirectoryBarCard bar={bar} locationLine={placeLine(bar)} />
    </div>
  );
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
          {/* The standing integrity block is gone from the hubs (Roman,
              2026-09-21). A disclaimer set apart in its own box answered a
              question nobody had asked and gave itself the weight of the
              results it qualified. Bartenders' Choice keeps the point as one
              clause inside the intro, because that is the hub where a reader
              meets the word "Featured" on the cards themselves.

              `.awards-integrity` STAYS IN THE CSS: /awards, the index page,
              still uses it, and it is not a hub. */}
          <p className="best-bars-intro">
            {program.tagline} {barCount} bars in the BarMagazine directory hold recognition from this
            program. Every entry below is verified from the official published results and links to the
            bar&apos;s profile.
            {program.slug === 'bartenders-choice'
              && ' The award is editorial; Featured listings play no part in it.'}
          </p>
        </header>

        {years.map(group => {
          // A HEADING EARNS ITS PLACE OR IT GOES.
          //
          // The brief is "no heading over a lone card", not "no headings". On
          // Bartenders' Choice every category holds exactly one bar, so twenty
          // headings each introduced a single 288px card and the page read as a
          // query result. On the 50 Best hub a section is a real list of up to
          // a hundred ranked bars, and "Asia's 50 Best Bars" is the only thing
          // distinguishing it from the World list in the same year. So small
          // sections lose their heading and flow together, large ones keep it.
          //
          // Sections arrive from getProgramYears() already in merit order,
          // winners first. Walk them IN THAT ORDER and collapse only RUNS of
          // small ones, rather than sweeping every small section to the top of
          // the year: a program whose winner category held four bars would
          // otherwise print its nominees above its winners. No hub does that
          // today, which is exactly why it is worth closing now.
          const blocks: YearBlock[] = [];
          group.sections.forEach(section => {
            if (section.bars.length >= MIN_SECTION_FOR_HEADING) {
              blocks.push({ kind: 'section', section });
              return;
            }
            const last = blocks[blocks.length - 1];
            const cells = section.bars.map(bar => ({ bar, kicker: section.label }));
            if (last && last.kind === 'flow') last.cells.push(...cells);
            else blocks.push({ kind: 'flow', cells });
          });
          // Merging sections merges their orders too. On Bartenders' Choice
          // every category holds ONE bar, so the twenty bars that tie on merit
          // live in twenty separate sections and sorting inside each one moves
          // nothing: without this the grid still came out alphabetical by
          // category and still led with placeholder cards.
          blocks.forEach(block => {
            if (block.kind === 'flow') block.cells.sort((x, y) => compareHonoredBars(x.bar, y.bar));
          });
          return (
            <section key={group.year} className="awards-year">
              <h2>{group.year}</h2>
              {blocks.map((block, i) =>
                block.kind === 'flow' ? (
                  <div key={`flow-${i}`} className="directory-grid">
                    {block.cells.map(({ bar, kicker }) => (
                      <AwardCard key={`${bar.slug}-${kicker}`} bar={bar} kicker={kicker} />
                    ))}
                  </div>
                ) : (
                  <div key={block.section.label} className="awards-section">
                    <h3>{block.section.label}</h3>
                    <div className="directory-grid">
                      {block.section.bars.map(bar => (
                        <AwardCard
                          key={`${bar.slug}-${block.section.label}`}
                          bar={bar}
                          // The list name is already the heading above, so the
                          // kicker carries what it does not: the rank.
                          kicker={bar.entry.rank != null ? `No. ${bar.entry.rank}` : null}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </section>
          );
        })}

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
