import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, verifyOwnerToken } from '@/lib/supabase-auth';
import { isClaimExpired } from '@/lib/claim-routes';
import { notifyClaim } from '@/lib/notify';
import { revalidateBarPages } from '@/lib/revalidate-bars';

export const dynamic = 'force-dynamic';

/**
 * Complete a verified claim.
 *
 * The magic link has already been followed, so the caller holds a Supabase
 * session; that session IS the proof. This route grants ownership only for a
 * claim whose `claimant_email` matches the signed-in address, which is what
 * stops a session obtained for one bar being replayed against another.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const owner = await verifyOwnerToken(token);
    if (!owner) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

    const { claimId } = await request.json();
    if (typeof claimId !== 'string' || !claimId) {
      return NextResponse.json({ error: 'claimId required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: claim } = await supabase
      .from('bar_claims')
      .select('id, bar_id, claimant_email, claimant_name, claimant_role, status, is_transfer, created_at, method, evidence, newsletter_opt_in')
      .eq('id', claimId)
      .maybeSingle();

    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

    // Only the mailbox the link was sent to can finish the claim. Under open
    // claiming that is always the claimant's own address; the recorded
    // destination is still preferred so claims created under the old route B
    // (link to the on-file contact) can complete for whoever it was sent to.
    const evidence =
      claim.evidence && typeof claim.evidence === 'object' && !Array.isArray(claim.evidence)
        ? (claim.evidence as Record<string, unknown>)
        : {};
    const expected = String(evidence.destination || claim.claimant_email).toLowerCase();

    if (expected !== owner.email.toLowerCase()) {
      return NextResponse.json({ error: 'This link is not for your account' }, { status: 403 });
    }

    // Legal transitions are awaiting_verification → approved | expired.
    // Anything else — already approved, rejected, or queued for review — is
    // terminal here; nothing ever returns to awaiting_verification.
    if (claim.status !== 'awaiting_verification') {
      return NextResponse.json(
        {
          error:
            claim.status === 'pending_review'
              ? 'This claim is waiting on manual review'
              : 'This claim has already been resolved',
          status: claim.status,
        },
        { status: 409 }
      );
    }

    if (isClaimExpired(claim.created_at)) {
      await supabase.from('bar_claims').update({ status: 'expired' }).eq('id', claim.id);
      return NextResponse.json({ error: 'This claim has expired', status: 'expired' }, { status: 410 });
    }

    // Belt and braces: a transfer should never have reached awaiting_verification.
    if (claim.is_transfer) {
      return NextResponse.json({ error: 'Transfers require review' }, { status: 409 });
    }

    const now = new Date().toISOString();

    const { error: barError } = await supabase
      .from('bars')
      .update({ owner_id: owner.id, claimed_at: now })
      .eq('id', claim.bar_id)
      // Only claim an unowned bar. If another claim landed first this matches
      // no rows, so two racing links cannot both take ownership.
      .is('owner_id', null);

    if (barError) {
      console.error('[claim/callback] bar update failed:', barError.message);
      return NextResponse.json({ error: 'Could not complete the claim' }, { status: 500 });
    }

    const { data: bar } = await supabase
      .from('bars')
      .select('slug, owner_id')
      .eq('id', claim.bar_id)
      .maybeSingle();

    if (bar?.owner_id !== owner.id) {
      return NextResponse.json({ error: 'This bar has already been claimed' }, { status: 409 });
    }

    await supabase
      .from('bar_claims')
      .update({ status: 'approved', owner_id: owner.id, verified_at: now, reviewed_at: now })
      .eq('id', claim.id);

    // Carry the claim-time newsletter consent to the owner's record. Only
    // ever sets true: a later claim without the tick must not revoke a
    // consent given earlier.
    if (claim.newsletter_opt_in === true) {
      await supabase.from('bar_owners').update({ newsletter_opt_in: true }).eq('id', owner.id);
    }

    // The public trust signal. A MATCH claim (email connected to the bar via
    // its website domain or on-file contact) sets it automatically; a
    // NO-MATCH claim leaves it unset until Roman confirms in /admin/bars.
    const match = evidence.match === true;
    if (match) {
      await supabase.from('bars').update({ is_verified: true }).eq('id', claim.bar_id);
    }

    // Oversight happens here, after the grant: every completed claim tells
    // the admin who now owns what, labelled MATCH / NO MATCH so the risky
    // ones stand out. Best-effort — a mail failure must not fail the claim.
    const barName = await supabase
      .from('bars')
      .select('name')
      .eq('id', claim.bar_id)
      .maybeSingle()
      .then(r => String(r.data?.name ?? bar?.slug ?? 'Unknown bar'));

    await notifyClaim({
      barName,
      barSlug: bar?.slug ?? null,
      claimantEmail: owner.email,
      claimantName: (claim.claimant_name as string | null) ?? null,
      claimantRole: (claim.claimant_role as string | null) ?? null,
      method: claim.method as 'domain_match' | 'contact_on_file' | 'manual',
      isTransfer: false,
      needsReview: false,
      completed: true,
      match,
      ip: typeof evidence.ip === 'string' ? evidence.ip : null,
    });

    if (bar?.slug) revalidateBarPages([bar.slug]);

    return NextResponse.json({ success: true, slug: bar?.slug ?? null });
  } catch {
    return NextResponse.json({ error: 'Could not complete the claim' }, { status: 500 });
  }
}
