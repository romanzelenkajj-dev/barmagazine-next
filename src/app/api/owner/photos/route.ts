import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyOwnerToken } from '@/lib/supabase-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const owner = await verifyOwnerToken(token);
    if (!owner) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const formData = await request.formData();
    const barId = formData.get('bar_id') as string;
    const photos = formData.getAll('photos') as File[];

    if (!barId || photos.length === 0) {
      return NextResponse.json({ error: 'Missing bar_id or photos' }, { status: 400 });
    }

    const { data: bar } = await supabase
      .from('bars').select('id, owner_id')
      .eq('id', barId).eq('owner_id', owner.id).single();

    if (!bar) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const uploadedUrls: string[] = [];
    for (const photo of photos) {
      const ext = photo.name.split('.').pop();
      const fileName = `${barId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = Buffer.from(await photo.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from('bar-photos').upload(fileName, buffer, { contentType: photo.type });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('bar-photos').getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    await supabase.from('owner_submissions').insert({
      bar_id: barId, owner_id: owner.id, status: 'pending',
      submitted_data: { gallery_images: uploadedUrls },
      submission_type: 'photo_upload',
    });

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
