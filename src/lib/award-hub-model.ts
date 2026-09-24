import { compareHonoredBars, type AwardProgram, type HonoredBar, type YearGroup } from './honored-bars';
import { displayOrg } from './accolades';

/**
 * The award hub's navigation model (task 121): one list at a time.
 *
 * A hub used to stack every edition and year on one page, so the 50 Best
 * hub opened on "2026 Asia's 50 Best Bars" and the world list sat fifty
 * cards down. Now the page is a set of PANELS, one per edition and year, and
 * a switcher shows one. The 50 Best hub has four editions (the world list
 * and its Asia, Europe and North America lists); every other program is one
 * edition with its years.
 *
 * Inside a panel the bars sit in BLOCKS. A ranked list is one block, or two
 * when it runs past No. 50 ("No. 1 to 50" and "No. 51 to 100"), so the
 * extended list can collapse on its own. A category program keeps one block
 * per category, winners first, as getProgramYears() orders them.
 */

export interface HubEdition {
  /** The ?edition= value. */
  slug: string;
  /** The pill text. */
  label: string;
  /** The list's current official name, for the aria-label. */
  name: string;
  /** The name the list carried before the 2026 rebrand, for earlier years. */
  legacyName?: string;
  orgKeys: string[];
}

export const FIFTY_BEST_EDITIONS: HubEdition[] = [
  // Pills name the region only; the brand is in the page title (Roman).
  // Only the world list was renamed; the regional lists keep their
  // possessive names in every year (Roman, 2026-09-23).
  { slug: 'world', label: 'World', name: 'The 50 Best Bars', legacyName: "World's 50 Best Bars", orgKeys: ['w50b'] },
  { slug: 'asia', label: 'Asia', name: "Asia's 50 Best Bars", orgKeys: ['a50b'] },
  { slug: 'europe', label: 'Europe', name: "Europe's 50 Best Bars", orgKeys: ['e50b'] },
  { slug: 'north-america', label: 'North America', name: "North America's 50 Best Bars", orgKeys: ['na50b'] },
];

export function hubEditions(program: AwardProgram): HubEdition[] {
  if (program.slug === 'worlds-50-best') return FIFTY_BEST_EDITIONS;
  return [{ slug: program.slug, label: program.name, name: program.name, orgKeys: program.orgKeys }];
}

export interface HubCell<T> {
  bar: T;
  /** The category, carried inside the card when the block has no single label. */
  kicker: string | null;
}

export interface HubBlock<T> {
  /** Stable id for the URL hash ("1-50", "51-100", or the category slug). */
  id: string;
  label: string;
  cells: HubCell<T>[];
}

/**
 * How many bars a category needs before its own header row is worth the
 * space; smaller categories flow together with the category on the card.
 * Four fills a row at the narrowest desktop grid width.
 */
const MIN_SECTION_FOR_HEADING = 4;

export interface HubPanel<T> {
  edition: string;
  year: number;
  /** The list's name for that year plus the year: "The 50 Best Bars 2026",
      "The World's 50 Best Bars 2025", "Asia's 50 Best Bars 2026". */
  title: string;
  blocks: HubBlock<T>[];
}

/** The official name of an edition's list in a given year (the 2026 rebrand applies). */
export function listTitle(edition: HubEdition, year: number): string {
  return `${displayOrg({ org: edition.legacyName ?? edition.name, org_key: edition.orgKeys[0], year })} ${year}`;
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function buildHubPanels(years: YearGroup[], editions: HubEdition[]): HubPanel<HonoredBar>[] {
  const panels: HubPanel<HonoredBar>[] = [];
  for (const edition of editions) {
    const keys = new Set(edition.orgKeys);
    for (const group of years) {
      const sections = group.sections
        .map(s => ({ ...s, bars: s.bars.filter(b => keys.has(b.entry.org_key)) }))
        .filter(s => s.bars.length > 0);
      if (sections.length === 0) continue;
      // Ranked placings first, split at No. 50; then whatever else the
      // edition holds that year (a special award recorded as a winner, a
      // nomination), as category blocks. An edition can carry both: the
      // 2025 world list has a winner-kind record next to its hundred
      // placings, and treating the panel as one kind put the whole list
      // under a category heading.
      const blocks: HubBlock<HonoredBar>[] = [];
      const ranked = sections.flatMap(s => s.bars.filter(b => b.entry.kind === 'ranked' && b.entry.rank != null));
      if (ranked.length) {
        const sorted = ranked.slice().sort((a, b) => (a.entry.rank ?? 0) - (b.entry.rank ?? 0) || a.name.localeCompare(b.name));
        const top = sorted.filter(b => (b.entry.rank ?? 0) <= 50).map(bar => ({ bar, kicker: null }));
        const extended = sorted.filter(b => (b.entry.rank ?? 0) > 50).map(bar => ({ bar, kicker: null }));
        if (top.length) blocks.push({ id: '1-50', label: 'No. 1 to 50', cells: top });
        if (extended.length) blocks.push({ id: '51-100', label: 'No. 51 to 100', cells: extended });
      }
      const categorySections = sections
        .map(s => ({ ...s, bars: s.bars.filter(b => !(b.entry.kind === 'ranked' && b.entry.rank != null)) }))
        .filter(s => s.bars.length > 0);
      if (categorySections.length) {
        // A category with a real list gets its header row; runs of small
        // categories flow into one block with the category on each card,
        // in merit order, so Bartenders' Choice is not twenty headings over
        // twenty lone cards.
        for (const s of categorySections) {
          if (s.bars.length >= MIN_SECTION_FOR_HEADING) {
            blocks.push({ id: slugify(s.label), label: s.label, cells: s.bars.map(bar => ({ bar, kicker: null })) });
            continue;
          }
          const last = blocks[blocks.length - 1];
          const cells = s.bars.map(bar => ({ bar, kicker: s.label }));
          if (last && last.id.startsWith('honored')) last.cells.push(...cells);
          else blocks.push({ id: `honored-${blocks.length + 1}`, label: 'Honored bars', cells });
        }
        for (const b of blocks) {
          if (!b.id.startsWith('honored')) continue;
          b.cells.sort((x, y) => compareHonoredBars(x.bar, y.bar));
          // Name the flow by what it holds: a run of one-bar winner categories
          // is "Winners", not a vague "Honored bars".
          const kinds = new Set(b.cells.map(c => c.bar.entry.kind));
          b.label = kinds.size === 1 && kinds.has('winner') ? 'Winners' : kinds.size === 1 && kinds.has('nominee') ? 'Nominees' : 'Honored bars';
        }
      }
      panels.push({ edition: edition.slug, year: group.year, title: listTitle(edition, group.year), blocks });
    }
  }
  return panels;
}

/** The years a panel exists for, newest first. */
export function yearsFor<T>(panels: HubPanel<T>[], edition: string): number[] {
  return Array.from(new Set(panels.filter(p => p.edition === edition).map(p => p.year))).sort((a, b) => b - a);
}

/**
 * The list a visitor lands on with no parameters: the first edition that
 * has records (the world list on the 50 Best hub), its most recent year.
 */
export function defaultSelection<T>(panels: HubPanel<T>[], editions: HubEdition[]): { edition: string; year: number } | null {
  for (const e of editions) {
    const years = yearsFor(panels, e.slug);
    if (years.length) return { edition: e.slug, year: years[0] };
  }
  return null;
}

/** How many cards a block shows before its "Show all" button: 12, so the
    collapsed list ends on a full row at three columns and at two (Roman,
    2026-09-23). Applies to every block, the 51-100 half included. */
export const COLLAPSED_CARDS = 12;

/**
 * The share of a ranked list the directory must hold before that year shows
 * on the hub (Roman, 2026-09-23): 45 of 50, and 90 of 100 where a 51-100 list
 * exists. A year below it is hidden from the hub, not deleted; the profiles
 * keep their accolades, and the year comes back by itself once enough of its
 * bars are in. Each published half counts on its own, so a year whose top
 * 50 is not out yet (the world list before 7 October 2026) qualifies on its
 * 51-100 half alone. Category programs (Spirited, James Beard, Bartenders'
 * Choice) have no ranked list and are not subject to it.
 */
export const HUB_YEAR_THRESHOLD = 0.9;

/** How many placings a ranked panel holds against how many its year expects. */
export function panelCoverage<T>(panel: HubPanel<T>): { held: number; expected: number } | null {
  const top = panel.blocks.find(b => b.id === '1-50');
  const extended = panel.blocks.find(b => b.id === '51-100');
  if (!top && !extended) return null; // a category panel
  const expected = (top ? 50 : 0) + (extended ? 50 : 0);
  const held = (top?.cells.length ?? 0) + (extended?.cells.length ?? 0);
  return { held, expected };
}

export function panelQualifies<T>(panel: HubPanel<T>): boolean {
  const c = panelCoverage(panel);
  if (!c) return true;
  return c.held >= Math.ceil(c.expected * HUB_YEAR_THRESHOLD);
}

/** The panels the hub shows: ranked years at or over the threshold, every category year. */
export function qualifyingPanels<T>(panels: HubPanel<T>[]): HubPanel<T>[] {
  return panels.filter(panelQualifies);
}
