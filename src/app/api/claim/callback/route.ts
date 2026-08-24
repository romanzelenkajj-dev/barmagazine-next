import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, verifyOwnerToken } from '@/lib/supabase-auth';
import { isClaimExpired } from '@/lib/claim-routes';

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
      .select('id, bar_id, claimant_email, status, is_transfer, created_at, method, evidence')
      .eq('id', claimId)
      .maybeSingle();

    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

    // Only the mailbox the link was sent to can finish the claim.
    //
    // That is NOT always the address the claimant typed: on route B the link
    // goes to the bar's on-file contact precisely so a stranger cannot claim a
    // bar by typing their own address. Comparing against claimant_email would
    // therefore reject the legitimate owner and make route B impossible, so we
    // compare against the recorded destination and fall back to claimant_email
    // (route A, where they are the same).
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

    return NextResponse.json({ success: true, slug: bar?.slug ?? null });
  } catch {
    return NextResponse.json({ error: 'Could not complete the claim' }, { status: 500 });
  }
}
