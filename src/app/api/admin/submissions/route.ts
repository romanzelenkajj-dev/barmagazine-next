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
  const secret = request.headers.get('x-admin-secret');
  return secret === process.env.ADMIN_SECRET;
}

// GET — list all submissions
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  const { data, error } = await supabase
    .from('bar_submissions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    // If status column doesn't exist, try without filter
    const { data: allData, error: allError } = await supabase
      .from('bar_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) return NextResponse.json({ error: allError.message }, { status: 500 });
    return NextResponse.json({ submissions: allData });
  }

  return NextResponse.json({ submissions: data });
}

// POST — approve or reject a submission
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action, submissionId } = body;
  const supabase = getServiceClient();

  if (action === 'approve') {
    // Get the submission
    const { data: submission, error: fetchError } = await supabase
      .from('bar_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Create slug from name
    const slug = submission.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .trim();

    // Insert into bars table
    const { data: bar, error: insertError } = await supabase
      .from('bars')
      .insert({
        name: submission.name,
        slug: slug,
        city: submission.city,
        country: submission.country,
        address: submission.address,
        type: submission.type || 'Cocktail Bar',
        website: submission.website,
        instagram: submission.instagram,
        phone: submission.phone,
        email: submission.email,
        description: submission.description,
        photos: [],
        tier: 'free',
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      // Try with city-suffixed slug if duplicate
      const slugWithCity = `${slug}-${submission.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const { data: bar2, error: insertError2 } = await supabase
        .from('bars')
        .insert({
          name: submission.name,
          slug: slugWithCity,
          city: submission.city,
          country: submission.country,
          address: submission.address,
          type: submission.type || 'Cocktail Bar',
          website: submission.website,
          instagram: submission.instagram,
          phone: submission.phone,
          email: submission.email,
          description: submission.description,
          photos: [],
          tier: 'free',
          is_active: true,
        })
        .select()
        .single();

      if (insertError2) {
        return NextResponse.json({ error: insertError2.message }, { status: 500 });
      }
    }

    // Update submission status
    await supabase
      .from('bar_submissions')
      .update({ status: 'approved' })
      .eq('id', submissionId);

    return NextResponse.json({ approved: true, bar: bar });
  }

  if (action === 'reject') {
    const { error } = await supabase
      .from('bar_submissions')
      .update({ status: 'rejected' })
      .eq('id', submissionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rejected: true });
  }

  if (action === 'delete') {
    const { error } = await supabase
      .from('bar_submissions')
      .delete()
      .eq('id', submissionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
