import { renderableAccolades } from './accolades';

/**
 * The one-line intro on every /best-bars band (Roman, task 114).
 *
 * It names no bar. The old intros led with the top-accolade venue ("Athens
 * drinking starts with Line"), but the list under the band is ordered tier
 * first, so the sentence pointed at a bar that was not first. This line is
 * built only from facts that hold whatever the order: how many bars are
 * listed, and how many of them carry a World's 50 Best record, a Spirited
 * Awards result, a James Beard result or Pinnacle Guide pins. Zeros are
 * omitted. A list with nothing on the record gets the verification line
 * instead of an empty colon.
 *
 *   "Six bars, chosen on the record: two on World's 50 Best, one Spirited
 *    Awards nominee."
 *   "Six speakeasies, every listing verified by BarMagazine."
 */

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function num(n: number): string {
  return n <= 10 ? WORDS[n] : String(n);
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

const FIFTY_BEST: [string, string][] = [
  ['w50b', "World's 50 Best"],
  ['a50b', "Asia's 50 Best"],
  ['e50b', "Europe's 50 Best"],
  ['na50b', "North America's 50 Best"],
];

export function recordLine(bars: { accolades?: unknown }[], noun = 'bars'): string {
  const fifty: Record<string, number> = {};
  let totcWinners = 0, totcNominees = 0, jbfWinners = 0, jbfNominees = 0, pinnacle = 0;

  for (const bar of bars) {
    const entries = renderableAccolades(bar.accolades);
    if (entries.length === 0) continue;
    const keys = new Set(entries.map(e => e.org_key));
    for (const [key] of FIFTY_BEST) if (keys.has(key)) fifty[key] = (fifty[key] ?? 0) + 1;
    // A bar that has both won and been nominated counts once, as a winner.
    const totc = entries.filter(e => e.org_key === 'totc');
    if (totc.some(e => e.kind === 'winner')) totcWinners++;
    else if (totc.length) totcNominees++;
    const jbf = entries.filter(e => e.org_key === 'jbf');
    if (jbf.some(e => e.kind === 'winner')) jbfWinners++;
    else if (jbf.length) jbfNominees++;
    if (keys.has('pinnacle')) pinnacle++;
  }

  const parts: string[] = [];
  for (const [key, label] of FIFTY_BEST) if (fifty[key]) parts.push(`${num(fifty[key])} on ${label}`);
  if (totcWinners) parts.push(`${num(totcWinners)} Spirited Awards ${plural(totcWinners, 'winner', 'winners')}`);
  if (totcNominees) parts.push(`${num(totcNominees)} Spirited Awards ${plural(totcNominees, 'nominee', 'nominees')}`);
  if (jbfWinners) parts.push(`${num(jbfWinners)} James Beard ${plural(jbfWinners, 'winner', 'winners')}`);
  if (jbfNominees) parts.push(`${num(jbfNominees)} James Beard ${plural(jbfNominees, 'nominee', 'nominees')}`);
  if (pinnacle) parts.push(`${num(pinnacle)} with Pinnacle Guide pins`);

  const head = `${cap(num(bars.length))} ${bars.length === 1 ? noun.replace(/s$/, '') : noun}`;
  if (parts.length === 0) return `${head}, every listing verified by BarMagazine.`;
  return `${head}, chosen on the record: ${parts.join(', ')}.`;
}
