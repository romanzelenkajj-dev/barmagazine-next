import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { buildOwnerBarUpdate, OWNER_EDITABLE_FIELDS } from '@/lib/owner-fields';
import { revalidateBarPages } from '@/lib/revalidate-bars';

export const dynamic = 'force-dynamic';

/**
 * Review queue for owner edits.
 *
 * `owner_submissions` had no approval path at all: owners could submit, the
 * row was stored, an email went out — and there was nowhere to act on it. This
 * is that missing half.
 *
 * It is also the second allowlist enforcement point the spec asks for. The
 * approve path spreads a fields object into `bars.update()`, so it builds that
 * object with `buildOwnerBarUpdate()` rather than spreading `submitted_data`
 * directly — rows written before submission-side filtering shipped are still
 * unfiltered, and an unfiltered key would apply on a fast approval click.
 */

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret');
  return !!secret && secret === process.env.ADMIN_SECRET;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const status = new URL(request.url).searchParams.get('status') || 'pending';

  let query = supabase
    .from('owner_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (status !== 'all') query = query.eq('status', status);

  const { data: submissions, error } = await query;
  if (error) {
    console.error('[admin/owner-submissions]', error.message);
    return NextResponse.json({ error: error.message, submissions: [] }, { status: 500 });
  }

  const barIds = Array.from(new Set((submissions || []).map(s => s.bar_id).filter(Boolean)));
  const ownerIds = Array.from(new Set((submissions || []).map(s => s.owner_id).filter(Boolean)));

  const { data: bars } = barIds.length
    ? await supabase.from('bars').select('*').in('id', barIds)
    : { data: [] };
  const { data: owners } = ownerIds.length
    ? await supabase.from('bar_owners').select('id, email, name').in('id', ownerIds)
    : { data: [] };

  const barById = new Map((bars || []).map(b => [b.id, b]));
  const ownerById = new Map((owners || []).map(o => [o.id, o]));

  const enriched = (submissions || []).map(sub => {
    const bar = barById.get(sub.bar_id);
    const owner = ownerById.get(sub.owner_id);

    // What would actually be written, and what the current value is — so a
    // reviewer compares rather than guessing.
    const applied = buildOwnerBarUpdate(sub.submitted_data);
    const diff = Object.entries(applied)
      .map(([key, next]) => ({
        field: key,
        from: bar ? ((bar[key] ?? '') as string).toString() : '',
        to: (next ?? '').toString(),
      }))
      .filter(d => d.from !== d.to);

    // Keys the allowlist would drop. Should be empty for anything submitted
    // since filtering shipped; worth surfacing if it isn't.
    const dropped = Object.keys(sub.submitted_data || {}).filter(
      k => !(OWNER_EDITABLE_FIELDS as readonly string[]).includes(k) && k !== 'gallery_images'
    );

    return {
      ...sub,
      bar_name: bar?.name ?? null,
      bar_slug: bar?.slug ?? null,
      owner_email: owner?.email ?? null,
      diff,
      dropped,
      no_effect: diff.length === 0,
    };
  });

  return NextResponse.json({ submissions: enriched });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  try {
    const { action, submissionId, notes } = await request.json();
    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    const { data: sub } = await supabase
      .from('owner_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();

    if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    if (sub.status !== 'pending') {
      return NextResponse.json({ error: `Already ${sub.status}` }, { status: 409 });
    }

    const now = new Date().toISOString();

    if (action === 'reject') {
      await supabase
        .from('owner_submissions')
        .update({ status: 'rejected', admin_notes: notes || null, reviewed_at: now })
        .eq('id', sub.id);
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (action !== 'approve') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Confirm the submitter still owns the bar. A revoke between submission
    // and approval must not let a former owner's edit through.
    const { data: bar } = await supabase
      .from('bars')
      .select('id, slug, owner_id, photos')
      .eq('id', sub.bar_id)
      .maybeSingle();

    if (!bar) return NextResponse.json({ error: 'Bar not found' }, { status: 404 });

    if (bar.owner_id !== sub.owner_id) {
      await supabase
        .from('owner_submissions')
        .update({
          status: 'rejected',
          admin_notes: 'Submitter no longer owns this bar',
          reviewed_at: now,
        })
        .eq('id', sub.id);
      return NextResponse.json(
        { error: 'That owner no longer owns this bar — submission rejected' },
        { status: 409 }
      );
    }

    // THE allowlist gate. Never spread submitted_data into this.
    const update = buildOwnerBarUpdate(sub.submitted_data);

    // Photo uploads append rather than replace, so an approval can't wipe the
    // existing gallery.
    if (Array.isArray(update.photos)) {
      const existing = Array.isArray(bar.photos) ? bar.photos : [];
      const merged = existing.slice();
      for (const url of update.photos as string[]) {
        if (!merged.includes(url)) merged.push(url);
      }
      update.photos = merged;
    }

    if (Object.keys(update).length === 0) {
      await supabase
        .from('owner_submissions')
        .update({
          status: 'rejected',
          admin_notes: 'Nothing applicable to publish',
          reviewed_at: now,
        })
        .eq('id', sub.id);
      return NextResponse.json({ error: 'Nothing in this submission can be applied' }, { status: 409 });
    }

    update.updated_at = now;

    const { error: applyError } = await supabase.from('bars').update(update).eq('id', bar.id);
    if (applyError) {
      console.error('[admin/owner-submissions] apply failed:', applyError.message);
      return NextResponse.json({ error: applyError.message }, { status: 500 });
    }

    await supabase
      .from('owner_submissions')
      .update({ status: 'approved', admin_notes: notes || null, reviewed_at: now })
      .eq('id', sub.id);

    revalidateBarPages([bar.slug]);

    return NextResponse.json({
      success: true,
      status: 'approved',
      applied: Object.keys(update).filter(k => k !== 'updated_at'),
    });
  } catch (e) {
    console.error('[admin/owner-submissions] POST failed:', e);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
