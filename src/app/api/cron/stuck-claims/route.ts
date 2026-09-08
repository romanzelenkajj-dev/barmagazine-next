import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { CLAIM_VERIFICATION_WINDOW_HOURS } from '@/lib/claim-routes';
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

    // ---- Expiry sweep, BEFORE the alert sweep, so a freshly-expired row
    // can never trigger a stuck alert. Two kinds of dead rows:
    //   1. abandoned: awaiting_verification past the 24h link lifetime -
    //      the link can no longer complete (the callback would expire it on
    //      click; this expires it without waiting for a click).
    //   2. superseded: awaiting_verification on a bar someone else already
    //      claimed - the callback's owner_id-is-null guard means it can
    //      never complete, but it sat around making an owned bar look
    //      unverified in the monitoring.
    // Row-by-row so each carries its reason in evidence for the admin view.
    let expired = 0;
    const lifetimeCutoff = new Date(
      Date.now() - CLAIM_VERIFICATION_WINDOW_HOURS * 60 * 60 * 1000
    ).toISOString();
    const { data: staleRows } = await supabase
      .from('bar_claims')
      .select('id, bar_id, created_at, evidence')
      .eq('status', 'awaiting_verification');
    if (staleRows && staleRows.length > 0) {
      const { data: ownedBars } = await supabase
        .from('bars')
        .select('id')
        .in('id', Array.from(new Set(staleRows.map(c => c.bar_id))))
        .not('owner_id', 'is', null);
      const ownedIds = new Set((ownedBars || []).map(b => b.id));
      for (const row of staleRows) {
        const reason = ownedIds.has(row.bar_id)
          ? 'superseded_by_approved_claim'
          : row.created_at < lifetimeCutoff
            ? 'link_lifetime_elapsed'
            : null;
        if (!reason) continue;
        const ev =
          row.evidence && typeof row.evidence === 'object' && !Array.isArray(row.evidence)
            ? (row.evidence as Record<string, unknown>)
            : {};
        const { error: expireError } = await supabase
          .from('bar_claims')
          .update({
            status: 'expired',
            evidence: { ...ev, expired_reason: reason, expired_at: new Date().toISOString() },
          })
          .eq('id', row.id)
          // Guard against a click landing mid-sweep: only an
          // awaiting_verification row flips, never an approved one.
          .eq('status', 'awaiting_verification');
        if (expireError) {
          console.error('[cron/stuck-claims] expire failed for', row.id, expireError.message);
        } else {
          expired++;
        }
      }
    }

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
      return NextResponse.json({ alerted: 0, expired });
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

    return NextResponse.json({ alerted, expired });
  } catch (e) {
    console.error('[cron/stuck-claims] threw:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
