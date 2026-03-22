import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  return createClient(supabaseUrl, serviceKey);
}

async function verifyOwner(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET - fetch owner's bars and submissions
export async function GET(request: NextRequest) {
  const user = await verifyOwner(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  // Get bars owned by this user
  const { data: bars } = await supabase
    .from('bars')
    .select('*')
    .eq('owner_id', user.id)
    .order('name');

  // Get submissions by this user
  const { data: submissions } = await supabase
    .from('bar_submissions')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // Get owner profile
  const { data: profile } = await supabase
    .from('owner_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ bars: bars || [], submissions: submissions || [], profile });
}

// POST - update bar or upload photo
export async function POST(request: NextRequest) {
  const user = await verifyOwner(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === 'update_bar') {
    const { barId, updates } = body;
    // Verify ownership
    const { data: bar } = await supabase
      .from('bars')
      .select('owner_id')
      .eq('id', barId)
      .single();

    if (!bar || bar.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this bar' }, { status: 403 });
    }

    // Only allow certain fields to be updated by owners
    const allowedFields = ['description', 'short_excerpt', 'website', 'instagram', 'phone', 'email', 'address'];
    const safeUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) safeUpdates[key] = updates[key] === '' ? null : updates[key];
    }

    const { data: updated, error } = await supabase
      .from('bars')
      .update(safeUpdates)
      .eq('id', barId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, bar: updated });
  }

  if (action === 'upload_photo') {
    const { barId, photo } = body;
    // Verify ownership
    const { data: bar } = await supabase
      .from('bars')
      .select('owner_id, photos, name')
      .eq('id', barId)
      .single();

    if (!bar || bar.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Upload photo to storage
    const matches = photo.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Invalid photo data' }, { status: 400 });
    }

    const mimeType = matches[1];
    const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const slug = bar.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filePath = `bars/${slug}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('bar-photos')
      .upload(filePath, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('bar-photos')
      .getPublicUrl(filePath);

    const photoUrl = urlData?.publicUrl;
    if (photoUrl) {
      const currentPhotos = bar.photos || [];
      await supabase
        .from('bars')
        .update({ photos: [...currentPhotos, photoUrl] })
        .eq('id', barId);
    }

    return NextResponse.json({ success: true, photoUrl });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
