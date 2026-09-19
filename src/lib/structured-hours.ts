/**
 * Opening hours as data rather than as a sentence.
 *
 * WHY. `bars.opening_hours` is free text and always has been. 1,097 of the
 * active bars carry one and no two owners write them the same way:
 * "Mon-Thu 5pm-12am", "Mon-Wed 16:00-01:00; Thu-Sat 16:00-02:00",
 * "Sun to Thu, 4:00pm to 1:00am". `format-hours.ts` normalises the time
 * tokens at render time per country and deliberately never rewrites storage,
 * so nothing has ever normalised what an owner types.
 *
 * The fix is not to police the typing, it is to stop asking for it. A bar that
 * submits structured hours gets its display string generated here, identically
 * every time, and an owner cannot type a dash because there is nowhere to type
 * one.
 *
 * The free-text column stays as the fallback for every bar that already has
 * one, so nothing breaks and no migration is forced.
 *
 * WHAT THIS UNLOCKS. Three things free text cannot support at all: "Open now"
 * on a card, "open late" as a filter, and a correct
 * `openingHoursSpecification` in the schema Google reads. For a directory
 * where a large share of visits are someone deciding where to go tonight,
 * that is the actual point.
 */

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Day = typeof DAYS[number];

const LABEL: Record<Day, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

/** Schema.org day names, for openingHoursSpecification when we get there. */
export const SCHEMA_DAY: Record<Day, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

export interface DayHours {
  closed: boolean;
  /** "HH:MM", 24h. Absent when closed. */
  open?: string;
  /** "HH:MM", 24h. Earlier than `open` means it runs past midnight. */
  close?: string;
}

export type StructuredHours = Record<Day, DayHours>;

export const CLOSED: DayHours = { closed: true };

/** An empty week, for a fresh form. */
export function emptyWeek(): StructuredHours {
  return DAYS.reduce((acc, d) => { acc[d] = { closed: false }; return acc; }, {} as StructuredHours);
}

const HHMM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(v: string): boolean {
  return HHMM.test(String(v || '').trim());
}

/** True when the close time falls the next day, which is most of our bars. */
export function runsPastMidnight(d: DayHours): boolean {
  if (d.closed || !d.open || !d.close) return false;
  return toMinutes(d.close) <= toMinutes(d.open);
}

function toMinutes(hhmm: string): number {
  const m = HHMM.exec(String(hhmm).trim());
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Zero-pad so "9:00" and "09:00" compare and render the same. */
function pad(hhmm: string): string {
  const m = HHMM.exec(String(hhmm).trim());
  return m ? `${String(Number(m[1])).padStart(2, '0')}:${m[2]}` : String(hhmm).trim();
}

const sameDay = (a: DayHours, b: DayHours): boolean =>
  a.closed === b.closed && pad(a.open || '') === pad(b.open || '') && pad(a.close || '') === pad(b.close || '');

/**
 * The display string, generated from the structure.
 *
 * Consecutive days that share hours are collapsed into a range, which is what
 * every hand-written entry in the directory already does: "Mon-Thu 16:00-01:00,
 * Fri-Sat 16:00-02:00, Sun closed".
 *
 * A plain hyphen, never an en or em dash, so the output can never reintroduce
 * the character the house rule bans.
 */
export function generateHoursString(h: StructuredHours): string {
  const groups: { days: Day[]; hours: DayHours }[] = [];
  for (const d of DAYS) {
    const cur = h[d];
    if (!cur) continue;
    const last = groups[groups.length - 1];
    if (last && sameDay(last.hours, cur)) last.days.push(d);
    else groups.push({ days: [d], hours: cur });
  }
  if (groups.length === 0) return '';

  // A day that is open but has no times yet is half-filled, not a statement.
  // It is left out entirely rather than rendered as "undefined-undefined",
  // which is what a live preview on a half-filled form used to show.
  const complete = (d: DayHours) => d.closed || (!!d.open && !!d.close);
  if (!groups.some(g => complete(g.hours))) return '';

  // Every day identical is "Daily", which reads better than "Mon-Sun".
  if (groups.length === 1 && groups[0].days.length === 7) {
    const g = groups[0];
    if (g.hours.closed) return 'Closed';
    return complete(g.hours) ? `Daily ${pad(g.hours.open!)}-${pad(g.hours.close!)}` : '';
  }

  const parts = groups.filter(g => complete(g.hours)).map(g => {
    const span = g.days.length === 1
      ? LABEL[g.days[0]]
      : `${LABEL[g.days[0]]}-${LABEL[g.days[g.days.length - 1]]}`;
    if (g.hours.closed) return `${span} closed`;
    return `${span} ${pad(g.hours.open!)}-${pad(g.hours.close!)}`;
  });
  return parts.join(', ');
}

/** Anything obviously unfit to publish, for the form to show before submit. */
export function validateWeek(h: StructuredHours): string[] {
  const errs: string[] = [];
  let anyOpen = false;
  for (const d of DAYS) {
    const v = h[d];
    if (!v || v.closed) continue;
    anyOpen = true;
    if (!v.open || !v.close) { errs.push(`${LABEL[d]}: needs an open and a close time.`); continue; }
    if (!isValidTime(v.open) || !isValidTime(v.close)) errs.push(`${LABEL[d]}: times must be HH:MM.`);
  }
  if (!anyOpen) errs.push('At least one day needs opening hours.');
  return errs;
}

/* ─────────────────────── parsing the legacy strings ─────────────────────── */

const DAY_WORD: Record<string, Day> = {
  mon: 'mon', monday: 'mon', tue: 'tue', tues: 'tue', tuesday: 'tue',
  wed: 'wed', weds: 'wed', wednesday: 'wed', thu: 'thu', thur: 'thu', thurs: 'thu', thursday: 'thu',
  fri: 'fri', friday: 'fri', sat: 'sat', saturday: 'sat', sun: 'sun', sunday: 'sun',
};

/** "5pm" / "17:00" / "5.30pm" / "17.00" -> "HH:MM", or null. */
function parseTime(raw: string): string | null {
  const t = String(raw).trim().toLowerCase().replace(/\s+/g, '');
  let m = /^(\d{1,2})[:.](\d{2})(am|pm)?$/.exec(t);
  if (m) {
    let hh = Number(m[1]);
    const mm = m[2];
    if (m[3] === 'pm' && hh < 12) hh += 12;
    if (m[3] === 'am' && hh === 12) hh = 0;
    return hh > 23 ? null : `${String(hh).padStart(2, '0')}:${mm}`;
  }
  m = /^(\d{1,2})(am|pm)$/.exec(t);
  if (m) {
    let hh = Number(m[1]);
    if (m[2] === 'pm' && hh < 12) hh += 12;
    if (m[2] === 'am' && hh === 12) hh = 0;
    return hh > 23 ? null : `${String(hh).padStart(2, '0')}:00`;
  }
  return null;
}

const dayIndex = (d: Day) => DAYS.indexOf(d);

/**
 * Best-effort read of a legacy free-text string.
 *
 * Deliberately strict: it returns null rather than guess. This exists to
 * MEASURE how many of the existing strings could migrate cleanly, not to
 * migrate them. Anything it cannot read is a string a human should look at.
 */
export function parseHoursString(input: string): StructuredHours | null {
  const s = String(input || '').trim();
  if (!s) return null;
  // Prose we should never try to read as data.
  if (/temporarily closed|permanently closed|by appointment|varies|seasonal|walk-in only|reservation only|check the hotel|follow |see /i.test(s)) return null;
  // Open-ended times carry no close, so they cannot become structured hours.
  if (/\blate\b|\btill late\b|\buntil late\b|\bclose\b/i.test(s)) return null;

  const week = emptyWeek();
  for (const d of DAYS) week[d] = { closed: true };
  let matched = 0;

  const norm = s.replace(/[‒-―]/g, '-').replace(/\bto\b/gi, '-').replace(/\btill\b|\buntil\b/gi, '-');

  // "Daily 16:00-01:00"
  const daily = /^(daily|every\s*day)\s*[:,]?\s*([0-9][^,;]*)$/i.exec(norm.trim());
  if (daily) {
    const t = splitRange(daily[2]);
    if (!t) return null;
    for (const d of DAYS) week[d] = { closed: false, open: t[0], close: t[1] };
    return week;
  }

  for (const chunk of norm.split(/[,;]/)) {
    const c = chunk.trim();
    if (!c) continue;
    const m = /^([a-z]+)\s*(?:-\s*([a-z]+))?\s*[:]?\s*(.*)$/i.exec(c);
    if (!m) continue;
    const from = DAY_WORD[m[1].toLowerCase()];
    if (!from) continue;
    const to = m[2] ? DAY_WORD[m[2].toLowerCase()] : from;
    if (!to) continue;
    const rest = (m[3] || '').trim();
    const isClosed = /^closed$/i.test(rest);
    const t = isClosed ? null : splitRange(rest);
    if (!isClosed && !t) continue;
    let i = dayIndex(from);
    const end = dayIndex(to);
    for (let guard = 0; guard < 8; guard++) {
      const d = DAYS[i];
      week[d] = isClosed ? { closed: true } : { closed: false, open: t![0], close: t![1] };
      matched++;
      if (i === end) break;
      i = (i + 1) % 7;
    }
  }
  return matched > 0 ? week : null;
}

function splitRange(raw: string): [string, string] | null {
  const parts = String(raw).split('-').map(x => x.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  // "5-12" with no am/pm is ambiguous for a bar; refuse it.
  const a = parseTime(parts[0]);
  const b = parseTime(parts[1]);
  if (!a || !b) return null;
  return [a, b];
}
