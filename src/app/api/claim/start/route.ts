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
          // Always the claimant's own address now — route B (mailing the
          // bar's on-file contact) is dead: a mail scanner auto-followed one
          // of those links in a live test. The callback compares the
          // signed-in user against this. Stored, never returned to a caller.
          ...(decision.destination ? { destination: decision.destination } : {}),
          // MATCH / NO MATCH — read back by the callback to decide whether
          // completion may set bars.is_verified, and by the admin email.
          match: decision.match,
        },
      })
      .select('id')
      .single();

    if (insertError) {
      console.warn('[claim/start] insert failed:', insertError.message);
      return generic();
    }

    if (decision.autoVerifiable && decision.destination) {
      // Open claiming: every claim of an unclaimed bar gets a link, to the
      // claimant's OWN address. Verifying that mailbox is the whole gate —
      // ownership lands on completion, and oversight happens after the fact
      // via the completion notification and the admin revoke.
      await sendClaimLink(
        supabase,
        decision.destination,
        String(bar.name ?? bar.slug),
        bar.slug,
        claim.id
      );
    } else {
      // Transfers are the one path still gated on a human: notify now, since
      // nothing else will move until Roman acts. Completed claims notify from
      // the callback instead, where MATCH/NO MATCH is worth acting on.
      await notifyClaim({
        barName: String(bar.name ?? bar.slug),
        barSlug: String(bar.slug),
        claimantEmail: email,
        claimantName: name,
        claimantRole: role,
        method: decision.method,
        isTransfer: decision.isTransfer,
        needsReview: true,
        match: decision.match,
        ip,
      });
    }

    // Proof upload remains only for transfers — the single still-reviewed
    // path. An unclaimed bar needs no proof: mailbox verification is the gate.
    return generic({ requiresProof: decision.isTransfer, claimId: claim.id });
  } catch {
    return generic();
  }
}

/**
 * Create the owner account if needed and mail a sign-in link that lands on the
 * claim verifier. The account is created for the address the claimant typed —
 * open claiming makes that legitimate by definition: the account is worthless
 * until they prove control of the mailbox, and it owns nothing until then.
 */
async function sendClaimLink(
  supabase: ReturnType<typeof createAdminClient>,
  destination: string,
  barName: string,
  barSlug: string,
  claimId: string
): Promise<void> {
  // barSlug rides along so the landing page can show which bar the button
  // confirms — it fetches the display name via the public claim search.
  const redirectTo = `${SITE_URL}/claim-your-bar/verify?claim=${encodeURIComponent(claimId)}&bar=${encodeURIComponent(barSlug)}`;

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
