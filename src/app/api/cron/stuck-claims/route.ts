import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { notifyStuckClaim } from '@/lib/notify';

export const dynamic = 'force-dynamic';

/**
 * Hourly cron (vercel.json): alert the admin about claims stuck at
 * awaiting_verification for more than an hour, so a struggling claimant
 * surfaces in the inbox instead of only in the database.
 *
 * One email per claim, ever: sending stamps `evidence.stuck_alerted_at`, and
 * stamped claims are excluded from every later sweep. The stamp is written
 * BEFORE the email goes out — if both racefail, we prefer a missed alert over
 * a repeating one, since the claim is still visible in /admin/review.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`;
 * `x-admin-secret` is accepted too so it can be triggered by hand.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const adminSecret = process.env.ADMIN_SECRET;
  const bearer = request.headers.get('Authorization')?.replace('Bearer ', '');
  const viaCron = !!cronSecret && bearer === cronSecret;
  const viaAdmin = !!adminSecret && request.headers.get('x-admin-secret') === adminSecret;
  if (!viaCron && !viaAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: claims, error } = await supabase
      .from('bar_claims')
      .select('id, bar_id, claimant_email, claimant_name, method, created_at, evidence')
      .eq('status', 'awaiting_verification')
      .lt('created_at', cutoff)
      .is('evidence->stuck_alerted_at', null);

    if (error) {
      console.error('[cron/stuck-claims] query failed:', error.message);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
    if (!claims || claims.length === 0) {
      return NextResponse.json({ alerted: 0 });
    }

    const barIds = Array.from(new Set(claims.map(c => c.bar_id)));
    const { data: bars } = await supabase
      .from('bars')
      .select('id, name, slug')
      .in('id', barIds);

    let alerted = 0;
    for (const claim of claims) {
      const ev =
        claim.evidence && typeof claim.evidence === 'object' && !Array.isArray(claim.evidence)
          ? (claim.evidence as Record<string, unknown>)
          : {};
      const { error: stampError } = await supabase
        .from('bar_claims')
        .update({ evidence: { ...ev, stuck_alerted_at: new Date().toISOString() } })
        .eq('id', claim.id);
      if (stampError) {
        console.error('[cron/stuck-claims] stamp failed for', claim.id, stampError.message);
        continue; // unstamped: next run retries this claim
      }

      const bar = (bars || []).find(b => b.id === claim.bar_id);
      const hoursStuck = Math.floor((Date.now() - new Date(claim.created_at).getTime()) / 36e5);
      await notifyStuckClaim({
        barName: String(bar?.name ?? 'Unknown bar'),
        barSlug: bar?.slug ? String(bar.slug) : null,
        claimantEmail: claim.claimant_email,
        claimantName: claim.claimant_name,
        method: claim.method,
        hoursStuck,
      });
      alerted++;
    }

    return NextResponse.json({ alerted });
  } catch (e) {
    console.error('[cron/stuck-claims] threw:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
