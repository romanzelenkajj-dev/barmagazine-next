import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import {
  decideRoute,
  CLAIM_RATE_LIMIT_PER_EMAIL,
  CLAIM_RATE_LIMIT_PER_IP,
  CLAIM_VERIFICATION_WINDOW_HOURS,
} from '@/lib/claim-routes';
import { notifyClaim } from '@/lib/notify';
import { sendClaimLinkEmail } from '@/lib/claim-email';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://barmagazine.com';

/**
 * The one response this endpoint ever gives on a well-formed request.
 *
 * It is identical for a domain match, an on-file address, a manual claim, a
 * bar that does not exist, a rate-limited caller and an internal failure. The
 * endpoint is unauthenticated, so any variation would let someone map which
 * bars have an email on file — exactly the enumeration the spec forbids.
 */
function generic(extra: Record<string, unknown> = {}) {
  return NextResponse.json({
    success: true,
    message: 'If this bar is yours, check your inbox.',
    ...extra,
  });
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Rate limits are counted from `bar_claims` itself rather than a side table,
 * so nothing new has to be migrated. The IP is recorded in `evidence` at
 * creation for exactly this purpose.
 *
 * Consequence worth knowing: only requests that created a row count, so probes
 * against nonexistent bars are not limited. The generic response above is what
 * protects against enumeration; this limits volume.
 */
async function isRateLimited(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  ip: string
): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count: byEmail } = await supabase
    .from('bar_claims')
    .select('id', { count: 'exact', head: true })
    .ilike('claimant_email', email)
    .gte('created_at', since);

  if ((byEmail ?? 0) >= CLAIM_RATE_LIMIT_PER_EMAIL) return true;

  if (ip !== 'unknown') {
    const { count: byIp } = await supabase
      .from('bar_claims')
      .select('id', { count: 'exact', head: true })
      .eq('evidence->>ip', ip)
      .gte('created_at', since);
    if ((byIp ?? 0) >= CLAIM_RATE_LIMIT_PER_IP) return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const email = rawEmail.toLowerCase();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : null;
    const role = typeof body.role === 'string' ? body.role.trim().slice(0, 120) : null;

    // Shape errors are the one thing worth reporting — they reveal nothing
    // about which bars exist.
    if (!slug || !email.includes('@') || email.length > 320) {
      return NextResponse.json({ error: 'A bar and a valid email are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ip = clientIp(request);

    if (await isRateLimited(supabase, email, ip)) {
      return generic();
    }

    const { data: bar } = await supabase
      .from('bars')
      .select('id, name, slug, website, email, owner_id')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    // Unknown bar: same answer as a successful claim.
    if (!bar) return generic();

    const decision = decideRoute(bar, email);

    // Expire this requester's own abandoned claims for this bar first.
    // The partial unique index covers (bar_id, lower(claimant_email)) while a
    // claim is awaiting_verification or pending_review, so a link that was
    // never followed would block the same person from ever retrying — there is
    // no cron to sweep it. Scoped to this pair, so it can't touch anyone else's
    // claim, and only awaiting_verification rows are swept: pending_review is
    // waiting on a human, not on the claimant.
    const staleBefore = new Date(
      Date.now() - CLAIM_VERIFICATION_WINDOW_HOURS * 60 * 60 * 1000
    ).toISOString();

    await supabase
      .from('bar_claims')
      .update({ status: 'expired' })
      .eq('bar_id', bar.id)
      .ilike('claimant_email', email)
      .eq('status', 'awaiting_verification')
      .lt('created_at', staleBefore);

    // One open claim per (bar, lower(email)) is enforced by a partial unique
    // index; a repeat is not an error worth surfacing.
    const { data: claim, error: insertError } = await supabase
      .from('bar_claims')
      .insert({
        bar_id: bar.id,
        claimant_email: email,
        claimant_name: name,
        claimant_role: role,
        method: decision.method,
        status: decision.autoVerifiable ? 'awaiting_verification' : 'pending_review',
        is_transfer: decision.isTransfer,
        evidence: {
          ip,
          requested_at: new Date().toISOString(),
          // The address the link is actually sent to. For route B that is the
          // bar's on-file contact, NOT what the claimant typed — the callback
          // must check the signed-in user against this, or a route B claim
          // could never complete. Stored, never returned to a caller.
          ...(decision.destination ? { destination: decision.destination } : {}),
        },
      })
      .select('id')
      .single();

    if (insertError) {
      console.warn('[claim/start] insert failed:', insertError.message);
      return generic();
    }

    if (decision.autoVerifiable && decision.destination) {
      // Routes A and B only. The destination is already established as
      // legitimate — the bar's own domain, or the address we hold on file — so
      // creating the auth user here cannot be pointed at an arbitrary address.
      // Manual claims deliberately create nothing until Roman approves.
      await sendClaimLink(
        supabase,
        decision.destination,
        String(bar.name ?? bar.slug),
        bar.slug,
        claim.id
      );
    }

    await notifyClaim({
      barName: String(bar.name ?? bar.slug),
      barSlug: String(bar.slug),
      claimantEmail: email,
      claimantName: name,
      claimantRole: role,
      method: decision.method,
      isTransfer: decision.isTransfer,
      needsReview: !decision.autoVerifiable,
    });

    // `requiresProof` tells the UI to show the upload step. It is derived from
    // the bar having neither a matching domain nor an address on file, which
    // the claimant can already work out from the public listing, so it leaks
    // nothing the directory does not already show.
    return generic({ requiresProof: decision.method === 'manual', claimId: claim.id });
  } catch {
    return generic();
  }
}

/**
 * Create the owner account if needed and mail a sign-in link that lands on the
 * claim verifier. `/api/auth/magic-link` uses shouldCreateUser:false, so the
 * account has to be created here — this is the only place where a claim is
 * already proven enough to justify it.
 */
async function sendClaimLink(
  supabase: ReturnType<typeof createAdminClient>,
  destination: string,
  barName: string,
  barSlug: string,
  claimId: string
): Promise<void> {
  const redirectTo = `${SITE_URL}/claim-your-bar/verify?claim=${encodeURIComponent(claimId)}`;

  try {
    const { error: createError } = await supabase.auth.admin.createUser({
      email: destination,
      email_confirm: true,
      user_metadata: { role: 'owner', claimed_bar: barSlug },
    });
    // Already registered is the normal case for a second claim; anything else
    // is logged but must not change the response.
    if (createError && !/already/i.test(createError.message)) {
      console.warn('[claim/start] createUser:', createError.message);
    }

    // We mint the link and send it ourselves rather than letting Supabase mail
    // its stock template, which is unbranded and reads as phishing to a bar
    // owner. Expiry is unchanged — the token still honours the project setting.
    await sendClaimLinkEmail(supabase, { destination, barName, redirectTo });
  } catch (e) {
    console.warn('[claim/start] link step threw:', e);
  }
}
