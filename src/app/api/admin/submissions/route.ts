import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    throw new Error('Supabase URL or service role key not configured');
  }
  return createClient(supabaseUrl, serviceKey);
}

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-password') || request.headers.get('x-admin-secret');
  return secret === process.env.ADMIN_SECRET;
}

// GET - list submissions with optional status filter
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('owner_submissions')
    .select(`
      *,
      bars:bar_id ( name ),
      bar_owners:owner_id ( email )
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten joined data for the frontend
  const submissions = (data || []).map((s: Record<string, unknown>) => {
    const bars = s.bars as Record<string, unknown> | null;
    const barOwners = s.bar_owners as Record<string, unknown> | null;
    return {
      ...s,
      bar_name: bars?.name || null,
      owner_email: barOwners?.email || null,
      bars: undefined,
      bar_owners: undefined,
    };
  });

  return NextResponse.json({ submissions });
}

// PUT - approve or reject a submission
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const body = await request.json();
  const { submission_id, action } = body;

  if (!submission_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  // If approving, get the submission data and apply changes to the bar
  if (action === 'approve') {
    const { data: submission, error: fetchErr } = await supabase
      .from('owner_submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (fetchErr || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Apply submitted_data changes to the bar
    if (submission.bar_id && submission.submitted_data) {
      const { error: updateErr } = await supabase
        .from('bars')
        .update(submission.submitted_data)
        .eq('id', submission.bar_id);

      if (updateErr) {
        return NextResponse.json({ error: 'Failed to update bar: ' + updateErr.message }, { status: 500 });
      }
    }
  }

  // Update submission status
  const { error } = await supabase
    .from('owner_submissions')
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq('id', submission_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: newStatus });
}
