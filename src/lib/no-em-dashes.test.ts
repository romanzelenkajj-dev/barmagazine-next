import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * No em dash reaches a reader.
 *
 * WHY THIS IS A TEST AND NOT A CHECKER. `checkHouseStyle()` in house-style.ts
 * already rejects em dashes, but it has exactly one caller: the admin screen
 * that reviews an owner's submitted description. It is a runtime check on one
 * field of untrusted input. None of our own copy passes through it, because
 * our copy is source literals compiled into the bundle.
 *
 * This shipped to production twice: three em dashes in task 88, then
 * twenty-eight more in task 89 that the first pass missed because it was
 * pointed at the file the task named rather than the file the page reads. The
 * worst of them sat in article-schema.ts, the live meta description for every
 * category page.
 *
 * So the guard belongs where every commit already passes: here.
 *
 * WHAT IT DOES NOT COVER, honestly. It reads source, not the rendered page,
 * so an em dash arriving from the database or from WordPress is invisible to
 * it. That is correct: those are content, not our writing, and
 * category/[slug]/page.tsx decodes `&#8212;` from imported article bodies on
 * purpose.
 */

const ROOTS = ['src/app', 'src/components', 'src/lib'];
const EM_DASH = '—';

/**
 * Files that are ALLOWED to contain an em dash, each for a stated reason.
 * Anything not on this list fails. Adding to it should need a sentence.
 */
const ALLOWED = new Map<string, string>([
  // These DETECT em dashes. Changing them breaks the checker. (The task 88
  // list named sitemap-filters.ts too, but its em dashes are all in comments,
  // so it needs no entry.)
  ['src/lib/house-style.ts', 'the house-style checker: matches em dashes to reject them'],
  ['src/lib/bar-seo-meta.ts', 'strips dashes out of imported hours strings'],
  ['src/lib/menu-highlight.ts', 'splits a menu line on a dash'],
  ['src/lib/bar-name.ts', 'trims trailing dashes off a bar name'],
  ['src/lib/bar-fallback.ts', 'splits a description on a dash'],
  ['src/components/EditableSubmissionFields.tsx', 'warns the reviewer that a submission contains one'],

  // Admin-only screens. A bare em dash standing for an empty table cell is
  // correct typography, and no visitor sees it.
  ['src/app/admin/bars/AdminBarsClient.tsx', 'admin table: em dash is the empty-cell glyph'],
  ['src/app/admin/bars/page.tsx', 'admin page title'],
  ['src/app/admin/claims/page.tsx', 'admin table: em dash is the empty-cell glyph'],

  // Notification email to us, not to a reader.
  ['src/lib/notify.ts', 'internal notification email, not visitor copy'],
  ['src/lib/mail.ts', 'internal send-failure logging'],
  ['src/lib/claim-email.ts', 'internal logging'],
  ['src/app/api/bar-submission/route.ts', 'internal notification email and logging'],
  ['src/app/api/newsletter/route.ts', 'internal logging'],
  ['src/app/api/admin/owner-submissions/route.ts', 'admin API error string'],

  // Decodes &#8212; out of imported WordPress article bodies. That entity is
  // their punctuation, not ours, and the decode must keep working.
  ['src/app/category/[slug]/page.tsx', 'decodes WordPress entities in imported article bodies'],

  // Decode &#8212; out of imported WordPress content. Same reason as the
  // category route: that entity is their punctuation, not ours.
  ['src/lib/utils.ts', 'decodes WordPress entities'],
  ['src/lib/wordpress.ts', 'decodes WordPress entities'],
]);

/** Every .ts/.tsx under the roots, tests excluded. */
function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      if (!/\.tsx?$/.test(entry.name)) continue;
      if (/\.test\.tsx?$/.test(entry.name)) continue;
      out.push(p);
    }
  };
  for (const r of ROOTS) if (fs.existsSync(r)) walk(r);
  return out.sort();
}

/**
 * Strip comments, so a note explaining an em dash does not trip the rule.
 * Deliberately simple: it over-strips a `/*` or `//` inside a string, which
 * can only ever HIDE a violation, never invent one. A test that cannot raise
 * a false alarm is a test people leave switched on.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    // Trailing comments too: `const x = 1; // note — here` was tripping the
    // rule. A `//` preceded by ':' is a URL scheme and must survive.
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('no em dash reaches a reader', () => {
  it('finds none in any source file outside the allowlist', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      if (ALLOWED.has(file)) continue;
      const body = stripComments(fs.readFileSync(file, 'utf8'));
      body.split('\n').forEach((line, i) => {
        if (line.includes(EM_DASH)) offenders.push(`${file}:${i + 1}  ${line.trim().slice(0, 100)}`);
      });
    }
    expect(
      offenders,
      `Em dash in visitor-facing copy. Replace it with the punctuation the sentence wants, a colon, a comma or a full stop, NOT an en dash. If the file genuinely needs one, add it to ALLOWED in this file with a reason.\n\n${offenders.join('\n')}\n`
    ).toEqual([]);
  });

  it('keeps the allowlist honest: every entry still exists and still has one', () => {
    // An allowlist entry that no longer needs to be there is how a guard
    // rots. If the em dash is gone, or the file is, the entry should go too.
    const stale: string[] = [];
    // forEach, not for...of: this tsconfig predates downlevelIteration and
    // TS2802 rejects iterating a Map. vitest transpiles happily, `tsc` does
    // not, and the build runs tsc.
    ALLOWED.forEach((reason, file) => {
      if (!fs.existsSync(file)) { stale.push(`${file} no longer exists (reason was: ${reason})`); return; }
      const body = stripComments(fs.readFileSync(file, 'utf8'));
      if (!body.includes(EM_DASH)) stale.push(`${file} no longer contains one (reason was: ${reason})`);
    });
    expect(stale, `Stale ALLOWED entries, remove them:\n${stale.join('\n')}\n`).toEqual([]);
  });
});
