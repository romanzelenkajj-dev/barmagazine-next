import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyOwnerToken, noStoreFetch } from '@/lib/supabase-auth';
import { filterOwnerFields } from '@/lib/owner-fields';
import { menuUrlProblem } from '@/lib/menu-url';
import { notifyOwnerSubmission } from '@/lib/notify';

// Owner data is always per-request (Authorization header) — never prerender.
// Also keeps builds green in environments without SUPABASE_SERVICE_ROLE_KEY.
export const dynamic = 'force-dynamic';

// GET - fetch owner's bars and submissions
export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // GET route handlers get their fetches cached by Next's Data Cache; a
    // Supabase read must never be served stale (see noStoreFetch).
    { global: { fetch: noStoreFetch } }
  );

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const owner = await verifyOwnerToken(token);
    if (!owner) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { data: bars } = await supabase
      .from('bars')
      .select('*')
      .eq('owner_id', owner.id);

    const { data: submissions, error: subsError } = await supabase
      .from('owner_submissions')
      .select('*')
      .eq('owner_id', owner.id)
      .order('created_at', { ascending: false });

    // Was silent: a failure here returned an empty list, so an owner with
    // pending edits saw "nothing waiting" and no error anywhere.
    if (subsError) {
      console.error('[owner/bars] submissions query failed for', owner.id, subsError.message);
    }

    // Open claims for this mailbox. A signed-in session proves control of the
    // address, which is the exact proof the email link's callback checks — so
    // the dashboard can offer to finish these. This also rescues anyone whose
    // claim link died because requesting this very sign-in link invalidated it
    // (GoTrue keeps one outstanding magic-link token per user): instead of an
    // empty "Your bars" dead end, they land on a finish button.
    const { data: pendingClaimRows } = await supabase
      .from('bar_claims')
      .select('id, bar_id')
      .eq('status', 'awaiting_verification')
      .eq('is_transfer', false)
      .ilike('claimant_email', owner.email);

    let pendingClaims: { id: string; barName: string; barSlug: string | null }[] = [];
    if (pendingClaimRows && pendingClaimRows.length > 0) {
      const { data: claimBars } = await supabase
        .from('bars')
        .select('id, name, slug, owner_id')
        .in('id', pendingClaimRows.map(c => c.bar_id));
      pendingClaims = pendingClaimRows.flatMap(c => {
        const b = (claimBars || []).find(x => x.id === c.bar_id);
        // A bar someone else claimed first is not finishable; don't offer it.
        if (!b || b.owner_id) return [];
        return [{ id: c.id, barName: String(b.name ?? 'your bar'), barSlug: b.slug ? String(b.slug) : null }];
      });
    }

    return NextResponse.json({ bars: bars || [], submissions: submissions || [], pendingClaims, email: owner.email });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - submit changes for admin review
export async function PUT(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: noStoreFetch } }
  );

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const owner = await verifyOwnerToken(token);
    if (!owner) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { bar_id, updates } = await request.json();

    // Verify ownership. The editable columns ride along so the no-op check
    // below can compare against live data.
    const { data: bar } = await supabase
      .from('bars')
      .select('id, owner_id, name, slug, address, phone, website, instagram, email, opening_hours, reservation_url, whatsapp, menu_url, menu_sections, photos')
      .eq('id', bar_id)
      .eq('owner_id', owner.id)
      .single();

    if (!bar) return NextResponse.json({ error: 'Bar not found or not owned' }, { status: 403 });

    // Only ever store fields an owner is allowed to change. Editorial and
    // identity fields (description, tier, name, city, coordinates, …) are
    // dropped here so they can never reach the approve path, which spreads
    // submitted_data into bars.update(). Enforced again at approval.
    const { allowed, rejected } = filterOwnerFields(updates);

    // A search results page or a social profile is never a menu. The form
    // blocks these with the same check; rejecting here keeps the rule for
    // direct callers.
    if (typeof allowed.menu_url === 'string') {
      const problem = menuUrlProblem(allowed.menu_url);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json(
        { error: 'No editable fields in submission', rejected },
        { status: 400 }
      );
    }

    // Drop fields that already match live data (null and '' compare equal;
    // arrays by JSON). A submission whose whole diff is empty used to sit in
    // the moderation queue as an unapprovable "nothing differs" item that
    // only Reject could clear - it never gets queued now.
    const liveRecord = bar as Record<string, unknown>;
    for (const key of Object.keys(allowed)) {
      const next = allowed[key];
      const live = liveRecord[key];
      const same = Array.isArray(next) || Array.isArray(live)
        ? JSON.stringify(next ?? null) === JSON.stringify(live ?? null)
        : String(next ?? '') === String(live ?? '');
      if (same) delete allowed[key];
    }
    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ success: true, noop: true, rejected });
    }

    // Create submission for admin review
    const { error } = await supabase.from('owner_submissions').insert({
      bar_id,
      owner_id: owner.id,
      status: 'pending',
      submitted_data: allowed,
      submission_type: 'info_update',
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Tell the admin it's waiting — nothing else surfaces this queue. Awaited
    // so the serverless function doesn't exit before the request goes out, but
    // it never throws, so a mail failure can't fail a stored submission.
    await notifyOwnerSubmission({
      barName: String(bar.name ?? 'Unknown bar'),
      barSlug: bar.slug ? String(bar.slug) : null,
      ownerEmail: owner.email,
      submissionType: 'info_update',
      fields: allowed,
      rejected,
    });

    // Report what was ignored so the dashboard can say so plainly rather than
    // letting an owner believe an edit is pending review when it was dropped.
    return NextResponse.json({ success: true, rejected });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
