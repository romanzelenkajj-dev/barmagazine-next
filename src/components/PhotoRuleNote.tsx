/**
 * The one photo rule, shown above every owner-facing upload box (task 129,
 * Roman 2026-09-24).
 *
 * Owners kept sending cocktail photographs (Aperture sent five of five)
 * because the old note told them drink photos "belong in the photo gallery,
 * part of Featured". That invitation is gone from every owner surface. The
 * wording lives HERE, once, so the dashboard and the add-your-bar form cannot
 * drift apart, and the same sentence is repeated in the claim confirmation
 * email (src/lib/claim-email.ts) where a component cannot reach.
 *
 * The thumbnails are drawn line art in public/photo-guide, not photographs of
 * a real bar: an example that shows someone else's room invites a copy of it.
 */
export const PHOTO_RULE_TEXT =
  "One photo of your bar's interior: the room or the bar counter with seating, as a guest sees it. No drinks, bottles, logos or people.";

export function PhotoRuleNote() {
  return (
    <div className="photo-rule">
      <p className="photo-rule-line">
        One photo of your bar&rsquo;s interior: the room or the bar counter with
        seating, as a guest sees it. No drinks, bottles, logos or people.
      </p>
      <div className="photo-rule-examples">
        <figure className="photo-rule-example">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photo-guide/interior.png" alt="" width={80} height={60} />
          <figcaption className="photo-rule-yes">Yes: the room</figcaption>
        </figure>
        <figure className="photo-rule-example">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photo-guide/no-drinks.png" alt="" width={80} height={60} />
          <figcaption className="photo-rule-no">No: drinks</figcaption>
        </figure>
      </div>
    </div>
  );
}
