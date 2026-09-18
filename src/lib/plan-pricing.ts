/**
 * Plan prices in one place, and the label format that reads them.
 *
 * WHY THE ORDER MATTERS. The dropdown used to read
 * "Featured ($19.50/mo, 50% off first year)". Leading with the promotional
 * figure makes it the reference price, so the standard rate reads later as a
 * price rise. Leading with the full price and putting the promotion second
 * makes the same money read as a saving. Same numbers, opposite feeling.
 *
 * WHY IT LIVES HERE. Roman is settling pricing with Fable next week: the
 * direction is around $39 a month billed monthly with 50% off for paying
 * annually, and $19.50 is too low. So these figures are about to change.
 * Changing them should be editing this table, not hunting strings through JSX.
 *
 * This is not yet the only place a price appears. The /feature-your-bar cards,
 * its FAQ and metadata, the add-your-bar tier cards and the directory sidebar
 * still carry their own literals; the task 71 report lists every one. Those
 * already lead with the full price, which is the correct order, so they were
 * left alone rather than refactored under a task scoped to label text.
 */

export type PaidPlan = 'featured' | 'featured_social';

export interface PlanPrice {
  /** The standard monthly rate, the number that should lead. */
  full: { USD: string; EUR: string };
  /** The promotional monthly rate during the first year. */
  promo: { USD: string; EUR: string };
  /** What the promotion is, in words. */
  promoNote: string;
  /**
   * How the rate is billed, as a value rather than baked into a label.
   *
   * A price reading "$39/mo" is read as a monthly charge, and every paid plan
   * is billed a year at a time. The first time a visitor meets that fact
   * should not be the Stripe page; that gap is what produced the $468 scare.
   *
   * This is a field because it is about to stop being one answer. Roman is
   * settling pricing next week at roughly $39 a month billed MONTHLY, with 50%
   * off for paying annually, so "billed annually" will no longer be true of
   * every plan and the labels will have to offer two billing choices rather
   * than state one. When that happens this becomes a per-option value and
   * planLabel takes which one; the call sites do not change.
   */
  period: string;
}

export const PLAN_PRICING: Record<PaidPlan, PlanPrice> = {
  featured: {
    full: { USD: '$39', EUR: '€39' },
    promo: { USD: '$19.50', EUR: '€19.50' },
    promoNote: '50% off',
    period: 'billed annually',
  },
  featured_social: {
    full: { USD: '$79', EUR: '€79' },
    promo: { USD: '$39.50', EUR: '€39.50' },
    promoNote: '50% off',
    period: 'billed annually',
  },
};

export const PLAN_NAME: Record<PaidPlan, string> = {
  featured: 'Featured',
  featured_social: 'Featured + Social',
};

/**
 * "Featured, $39/mo billed annually (first year $19.50, 50% off)".
 *
 * Full price first, then how it is billed, then the promotion. A comma rather
 * than a dash: an em dash breaks the site-wide rule and this string is
 * user-visible.
 */
export function planLabel(plan: PaidPlan, currency: string): string {
  const p = PLAN_PRICING[plan];
  const cur = currency === 'EUR' ? 'EUR' : 'USD';
  const period = p.period ? ` ${p.period}` : '';
  return `${PLAN_NAME[plan]}, ${p.full[cur]}/mo${period} (first year ${p.promo[cur]}, ${p.promoNote})`;
}
