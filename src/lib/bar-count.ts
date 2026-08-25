import { supabase } from './supabase';

/**
 * Live count of active bars, rounded DOWN to the nearest hundred — marketing
 * copy reads "1,200+ bars", and rounding down is what keeps the "+" honest.
 *
 * Callers are ISR pages, so the number refreshes on their own revalidate
 * schedule as bars are added; nothing here caches beyond that. On a query
 * error it falls back to 1,000 — the old hardcoded floor — because a
 * transient hiccup must never render "0+ bars".
 */
export async function getBarCountRounded(): Promise<number> {
  const { count, error } = await supabase
    .from('bars')
    .select('id', { head: true, count: 'exact' })
    .eq('is_active', true);

  if (error || !count) return 1000;
  return Math.floor(count / 100) * 100;
}
