import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { claimEmailHtml } from './claim-email';
import { PHOTO_RULE_TEXT } from '../components/PhotoRuleNote';

/**
 * The owner photo rule, guarded at its three surfaces (task 129).
 *
 * Owners were sending cocktail photographs because our own copy told them to:
 * "Drink and detail photos belong in the photo gallery, part of Featured" sat
 * above both upload boxes. Aperture sent five photos, five of them drinks.
 *
 * The rule now reads the same on the dashboard, on the add-your-bar form and
 * in the claim confirmation email. Three surfaces, one sentence, in two
 * places in the source (a React component and an HTML email string), so a
 * test is the only thing that can keep them equal.
 */

const SURFACES = [
  'src/app/owner-dashboard/edit/[slug]/page.tsx',
  'src/app/add-your-bar/page.tsx',
];

/** The sentence as a reader sees it: entities resolved, whitespace collapsed. */
const asRead = (s: string) =>
  s.replace(/&rsquo;|&#8217;/g, "'").replace(/&apos;/g, "'").replace(/\s+/g, ' ').trim();

describe('owner photo rule', () => {
  it('states one interior photo and names what is not wanted', () => {
    expect(PHOTO_RULE_TEXT).toContain("One photo of your bar's interior");
    expect(PHOTO_RULE_TEXT).toContain('the room or the bar counter with seating');
    expect(PHOTO_RULE_TEXT).toContain('No drinks, bottles, logos or people');
  });

  it('reaches the claim confirmation email word for word, with both examples', () => {
    const html = claimEmailHtml({ barName: 'Aperture', actionLink: 'https://barmagazine.com/x' });
    expect(asRead(html)).toContain(asRead(PHOTO_RULE_TEXT));
    expect(html).toContain('https://barmagazine.com/photo-guide/interior.png');
    expect(html).toContain('https://barmagazine.com/photo-guide/no-drinks.png');
  });

  it('shows both example thumbnails on the upload screens', () => {
    const note = fs.readFileSync('src/components/PhotoRuleNote.tsx', 'utf8');
    expect(note).toContain('/photo-guide/interior.png');
    expect(note).toContain('/photo-guide/no-drinks.png');
    for (const file of SURFACES) {
      expect(fs.readFileSync(file, 'utf8'), file).toContain('<PhotoRuleNote />');
    }
  });

  it('no owner surface invites a drink photo again', () => {
    const files = [...SURFACES, 'src/lib/claim-email.ts', 'src/components/PhotoRuleNote.tsx'];
    // The phrasings that caused this: an invitation to send drink photos, or
    // anywhere to put them. "No drinks, bottles, logos or people" is the rule
    // itself and the caption "No: drinks" labels the crossed-out example.
    const invitation = /(drink|cocktail|detail)[a-z ]{0,20}photos?\s+(belong|go|can|should|are welcome)/i;
    for (const file of files) {
      expect(fs.readFileSync(file, 'utf8'), file).not.toMatch(invitation);
    }
  });
});
