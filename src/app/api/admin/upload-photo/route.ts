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

// POST - upload a photo for a bar
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const barId = formData.get('barId') as string | null;

  if (!file || !barId) {
    return NextResponse.json({ error: 'Missing file or barId' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Upload to storage
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${barId}/${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from('bar-photos')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('bar-photos')
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  // Append to bar's photos array
  const { data: bar } = await supabase
    .from('bars')
    .select('photos')
    .eq('id', barId)
    .single();

  const currentPhotos: string[] = bar?.photos || [];
  const updatedPhotos = [...currentPhotos, publicUrl];

  const { data: updated, error: updateError } = await supabase
    .from('bars')
    .update({ photos: updatedPhotos })
    .eq('id', barId)
    .select();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ bar: updated?.[0], url: publicUrl });
}

// DELETE - remove a photo from a bar
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { barId, photoUrl } = await request.json();
  if (!barId || !photoUrl) {
    return NextResponse.json({ error: 'Missing barId or photoUrl' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Remove from storage
  const path = photoUrl.split('/bar-photos/')[1];
  if (path) {
    await supabase.storage.from('bar-photos').remove([path]);
  }

  // Remove from bar's photos array
  const { data: bar } = await supabase
    .from('bars')
    .select('photos')
    .eq('id', barId)
    .single();

  const currentPhotos: string[] = bar?.photos || [];
  const updatedPhotos = currentPhotos.filter((p: string) => p !== photoUrl);

  const { data: updated, error: updateError } = await supabase
    .from('bars')
    .update({ photos: updatedPhotos })
    .eq('id', barId)
    .select();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ bar: updated?.[0] });
}
