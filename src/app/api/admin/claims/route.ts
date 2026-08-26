import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { revalidateBarPages } from '@/lib/revalidate-bars';

export const dynamic = 'force-dynamic';

/** Proof URLs are short-lived: long enough to review, not to leak. */
const SIGNED_URL_TTL_SECONDS = 10 * 60;

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret');
  return !!secret && secret === process.env.ADMIN_SECRET;
}

/**
 * GET — claims for review.
 *
 * Proof files live in the private `claim-proof` bucket (business
 * registrations, ID-bearing documents), so there is no public URL to hand
 * back. Each stored path is signed on read instead, and the signature expires.
 */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const status = new URL(request.url).searchParams.get('status') || 'open';

  let query = supabase
    .from('bar_claims')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (status === 'open') {
    // What actually needs Roman: manual claims and every transfer.
    query = query.eq('status', 'pending_review');
  } else if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: claims, error } = await query;
  if (error) {
    console.error('[admin/claims]', error.message);
    return NextResponse.json({ error: error.message, claims: [] }, { status: 500 });
  }

  // Bar names in one round trip rather than per claim.
  // Array.from rather than spreading a Set — tsconfig target predates es2015
  // downlevel iteration, so [...set] does not compile here.
  const barIds = Array.from(new Set((claims || []).map(c => c.bar_id)));
  const { data: bars } = barIds.length
    ? await supabase.from('bars').select('id, name, slug, city, country, owner_id').in('id', barIds)
    : { data: [] };
  const barById = new Map((bars || []).map(b => [b.id, b]));

  const enriched = await Promise.all(
    (claims || []).map(async claim => {
      const evidence =
        claim.evidence && typeof claim.evidence === 'object' && !Array.isArray(claim.evidence)
          ? (claim.evidence as Record<string, unknown>)
          : {};
      const paths = Array.isArray(evidence.proof_paths) ? (evidence.proof_paths as string[]) : [];

      const proof = await Promise.all(
        paths.map(async path => {
          const { data } = await supabase.storage
            .from('claim-proof')
            .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
          return { path, url: data?.signedUrl ?? null };
        })
      );

      const bar = barById.get(claim.bar_id);
      return {
        ...claim,
        bar_name: bar?.name ?? null,
        bar_slug: bar?.slug ?? null,
        bar_location: bar ? `${bar.city}, ${bar.country}` : null,
        bar_has_owner: !!bar?.owner_id,
        note: evidence.note ?? null,
        proof,
      };
    })
  );

  return NextResponse.json({ claims: enriched });
}

/**
 * POST — approve, reject or revoke.
 *
 * `approve` is the only path that grants ownership, and it is the only place a
 * transfer can complete: claim/start never auto-verifies when the bar already
 * has an owner, so a transfer always arrives here as pending_review.
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  try {
    const { action, claimId, barId, notes } = await request.json();
    const now = new Date().toISOString();

    // ---------- revoke ----------
    if (action === 'revoke') {
      if (!barId) return NextResponse.json({ error: 'barId required' }, { status: 400 });

      const { data: bar } = await supabase
        .from('bars')
        .select('id, slug, owner_id')
        .eq('id', barId)
        .maybeSingle();

      if (!bar) return NextResponse.json({ error: 'Bar not found' }, { status: 404 });
      if (!bar.owner_id) return NextResponse.json({ error: 'Bar has no owner' }, { status: 409 });

      const previousOwner = bar.owner_id;

      // is_verified goes too: the trust signal was earned by (or granted to)
      // the ownership being revoked, so it must not outlive it. The bar
      // becomes claimable again by someone else.
      const { error: clearError } = await supabase
        .from('bars')
        .update({ owner_id: null, claimed_at: null, is_verified: false })
        .eq('id', barId);

      if (clearError) {
        return NextResponse.json({ error: clearError.message }, { status: 500 });
      }

      // Their pending edits must not survive the revoke — otherwise a later
      // approval would apply changes from someone who no longer owns the bar.
      const { data: rejected } = await supabase
        .from('owner_submissions')
        .update({ status: 'rejected' })
        .eq('owner_id', previousOwner)
        .eq('bar_id', barId)
        .eq('status', 'pending')
        .select('id');

      // The approved claim that granted this ownership is now history, not a
      // live grant. Marking it rejected keeps the audit trail — rows are never
      // deleted, so a disputed bar can be reconstructed.
      await supabase
        .from('bar_claims')
        .update({ status: 'rejected', admin_notes: notes || 'Ownership revoked', reviewed_at: now })
        .eq('bar_id', barId)
        .eq('owner_id', previousOwner)
        .eq('status', 'approved');

      revalidateBarPages([bar.slug]);

      return NextResponse.json({
        success: true,
        revoked: true,
        submissionsRejected: rejected?.length ?? 0,
      });
    }

    // ---------- approve / reject ----------
    if (!claimId) return NextResponse.json({ error: 'claimId required' }, { status: 400 });

    const { data: claim } = await supabase
      .from('bar_claims')
      .select('id, bar_id, claimant_email, status, is_transfer')
      .eq('id', claimId)
      .maybeSingle();

    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

    if (claim.status !== 'pending_review') {
      return NextResponse.json(
        { error: `Claim is ${claim.status}, not open for review` },
        { status: 409 }
      );
    }

    if (action === 'reject') {
      await supabase
        .from('bar_claims')
        .update({ status: 'rejected', admin_notes: notes || null, reviewed_at: now })
        .eq('id', claim.id);
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (action !== 'approve') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Approving needs an account to hand the bar to. Manual claimants never
    // got one at claim time — deliberately, so claim/start could not be used
    // to create accounts — so it is created here, at the point a human has
    // decided the claim is genuine.
    const email = String(claim.claimant_email).toLowerCase();
    let ownerId: string | null = null;

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { role: 'owner' },
    });

    if (created?.user?.id) {
      ownerId = created.user.id;
    } else if (createError && /already/i.test(createError.message)) {
      const { data: existing } = await supabase
        .from('bar_owners')
        .select('id')
        .ilike('email', email)
        .maybeSingle();
      ownerId = existing?.id ?? null;

      if (!ownerId) {
        // Registered in auth but no profile row yet — find them by listing.
        const { data: list } = await supabase.auth.admin.listUsers();
        ownerId = list?.users.find(u => u.email?.toLowerCase() === email)?.id ?? null;
      }
    }

    if (!ownerId) {
      console.error('[admin/claims] could not resolve an owner id for', email);
      return NextResponse.json({ error: 'Could not create or find that owner' }, { status: 500 });
    }

    // Ensure the profile row exists — verifyOwnerToken would create it on
    // first sign-in, but bars.owner_id references bar_owners, so it has to
    // exist before we can point a bar at it.
    await supabase.from('bar_owners').upsert({ id: ownerId, email }, { onConflict: 'id' });

    const { data: bar } = await supabase
      .from('bars')
      .select('id, slug, owner_id')
      .eq('id', claim.bar_id)
      .maybeSingle();

    if (!bar) return NextResponse.json({ error: 'Bar not found' }, { status: 404 });

    // A transfer replaces the existing owner; reject the outgoing owner's open
    // submissions for the same reason revoke does.
    if (bar.owner_id && bar.owner_id !== ownerId) {
      await supabase
        .from('owner_submissions')
        .update({ status: 'rejected' })
        .eq('owner_id', bar.owner_id)
        .eq('bar_id', bar.id)
        .eq('status', 'pending');
    }

    const { error: assignError } = await supabase
      .from('bars')
      .update({ owner_id: ownerId, claimed_at: now })
      .eq('id', bar.id);

    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }

    await supabase
      .from('bar_claims')
      .update({
        status: 'approved',
        owner_id: ownerId,
        verified_at: now,
        reviewed_at: now,
        admin_notes: notes || null,
      })
      .eq('id', claim.id);

    revalidateBarPages([bar.slug]);

    return NextResponse.json({
      success: true,
      status: 'approved',
      wasTransfer: !!claim.is_transfer,
      ownerId,
    });
  } catch (e) {
    console.error('[admin/claims] POST failed:', e);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
