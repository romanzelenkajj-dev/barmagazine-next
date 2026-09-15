import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { boundedNoStoreFetch } from '@/lib/bounded-fetch';
import { verifyOwnerToken } from '@/lib/supabase-auth';
import { waitUntil } from '@vercel/functions';
import { ownerEditNotice, DEBOUNCE_MS } from '@/lib/owner-edit-notice';
import { photoLimitForTier } from '@/lib/owner-fields';

// The office notice waits DEBOUNCE_MS after the response before it sends
// (see owner-edit-notice.ts); the function must outlive that wait.
export const maxDuration = 90;

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: boundedNoStoreFetch } }
  );

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
      .from('bars').select('id, owner_id, name, slug, tier')
      .eq('id', barId).eq('owner_id', owner.id).single();

    if (!bar) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    // Unpaid tiers get one profile photo; the gallery is a Featured feature.
    // The UI enforces this too, but the gate has to live where the upload
    // does - and it REJECTS rather than silently truncating, so a direct
    // API caller learns the rule instead of losing photos quietly.
    const limit = photoLimitForTier(bar.tier);
    if (limit !== null && photos.length > limit) {
      return NextResponse.json(
        {
          error:
            'Your plan includes 1 profile photo. Featured bars can display a full gallery. Please upload a single photo.',
        },
        { status: 400 }
      );
    }

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

    const { data: inserted, error: insertError } = await supabase
      .from('owner_submissions')
      .insert({
        bar_id: barId, owner_id: owner.id, status: 'pending',
        submitted_data: { gallery_images: uploadedUrls },
        submission_type: 'photo_upload',
      })
      .select('id')
      .single();

    // Surface it — the photo queue is as invisible as the edit queue. Runs
    // after the response and waits a minute so a save made just before this
    // upload lands in the same email (see owner-edit-notice.ts).
    if (insertError || !inserted) {
      console.error('[owner/photos] submission insert failed:', insertError?.message);
    } else {
      waitUntil(
        ownerEditNotice(
          { barId, ownerId: owner.id, ownerEmail: owner.email, submissionId: inserted.id },
          { delayMs: DEBOUNCE_MS }
        )
      );
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
