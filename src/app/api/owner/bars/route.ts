import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyOwnerToken } from '@/lib/supabase-auth';
import { filterOwnerFields } from '@/lib/owner-fields';

// Owner data is always per-request (Authorization header) — never prerender.
// Also keeps builds green in environments without SUPABASE_SERVICE_ROLE_KEY.
export const dynamic = 'force-dynamic';

// GET - fetch owner's bars and submissions
export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    const { data: submissions } = await supabase
      .from('owner_submissions')
      .select('*')
      .eq('owner_id', owner.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ bars: bars || [], submissions: submissions || [], email: owner.email });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - submit changes for admin review
export async function PUT(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const owner = await verifyOwnerToken(token);
    if (!owner) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { bar_id, updates } = await request.json();

    // Verify ownership
    const { data: bar } = await supabase
      .from('bars')
      .select('id, owner_id')
      .eq('id', bar_id)
      .eq('owner_id', owner.id)
      .single();

    if (!bar) return NextResponse.json({ error: 'Bar not found or not owned' }, { status: 403 });

    // Only ever store fields an owner is allowed to change. Editorial and
    // identity fields (description, tier, name, city, coordinates, …) are
    // dropped here so they can never reach the approve path, which spreads
    // submitted_data into bars.update(). Enforced again at approval.
    const { allowed, rejected } = filterOwnerFields(updates);

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json(
        { error: 'No editable fields in submission', rejected },
        { status: 400 }
      );
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

    // Report what was ignored so the dashboard can say so plainly rather than
    // letting an owner believe an edit is pending review when it was dropped.
    return NextResponse.json({ success: true, rejected });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
