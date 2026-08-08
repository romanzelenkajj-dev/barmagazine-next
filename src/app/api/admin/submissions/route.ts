import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { geocodeBar } from '@/lib/geocode';
import { normalizeBarFields } from '@/lib/normalize';
import { revalidateBarPages } from '@/lib/revalidate-bars';

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

  // First try with status filter, fall back to all if column doesn't exist
  let submissions;
  const { data, error } = await supabase
    .from('bar_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message, submissions: [] }, { status: 500 });
  }

  // Filter by status client-side (in case column exists or doesn't)
  if (status && status !== 'all') {
    submissions = (data || []).filter((s: Record<string, unknown>) => {
      // If no status column, treat all as pending
      const sStatus = s.status || 'pending';
      return sStatus === status;
    });
  } else {
    submissions = data || [];
  }

  return NextResponse.json({ submissions });
}

// Map a submission's preferred_plan to a bars.tier value.
// Unknown/missing plans fall back to 'free'.
const PLAN_TIER_MAP: Record<string, string> = {
  featured: 'featured',
  featured_social: 'featured',
  premium: 'premium',
};

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

    // Normalize once so the generated slug, geocoding inputs, and both write
    // paths below all use trimmed/collapsed values (prevents "Chile " dupes).
    Object.assign(submission, normalizeBarFields(submission));

    // Reuse the directory's existing casing for city/country so a submission
    // typed as "palma de mallorca" doesn't create a second facet next to
    // "Palma de Mallorca".
    {
      const { data: cityMatch } = await supabase
        .from('bars')
        .select('city')
        .ilike('city', submission.city)
        .limit(1);
      if (cityMatch?.[0]?.city) submission.city = cityMatch[0].city;

      const { data: countryMatch } = await supabase
        .from('bars')
        .select('country')
        .ilike('country', submission.country)
        .limit(1);
      if (countryMatch?.[0]?.country) submission.country = countryMatch[0].country;
    }

    // Create slug from name
    const slug = submission.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .trim();
    const slugWithCity = `${slug}-${submission.city
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}`;

    // Tier from the plan the bar actually asked (and pays) for.
    const tier = PLAN_TIER_MAP[submission.preferred_plan || ''] || 'free';

    // Look for an existing listing of the same bar (re-submission or plan
    // upgrade, e.g. free listing later subscribing as featured). Match by
    // either slug variant, then by case-insensitive name + city.
    let existing: Record<string, unknown> | null = null;
    {
      const { data: bySlug } = await supabase
        .from('bars')
        .select('*')
        .in('slug', [slug, slugWithCity]);
      let candidates = bySlug || [];
      if (candidates.length === 0) {
        const { data: byName } = await supabase
          .from('bars')
          .select('*')
          .ilike('name', submission.name)
          .ilike('city', submission.city);
        candidates = byName || [];
      }
      if (candidates.length > 0) {
        // Prefer an active listing, then the oldest one.
        candidates.sort(
          (a, b) =>
            (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0) ||
            String(a.created_at).localeCompare(String(b.created_at))
        );
        existing = candidates[0];
      }
    }

    // Geocode only when we don't already have trusted coordinates —
    // an existing listing's coords beat a fresh (possibly wrong) geocode.
    let coords: { lat: number; lng: number } | null = null;
    if (!existing || existing.lat == null || existing.lng == null) {
      coords = await geocodeBar({
        name: submission.name,
        address: submission.address,
        city: submission.city,
        country: submission.country,
      });
    }

    // Fields shared by both the update and insert paths. Optional fields are
    // only written when the submission actually provides them, so an upgrade
    // submission can't blank out existing data.
    const fields: Record<string, unknown> = {
      name: submission.name,
      city: submission.city,
      country: submission.country,
      type: submission.type || 'Cocktail Bar',
    };
    for (const f of ['address', 'website', 'instagram', 'phone', 'email', 'description'] as const) {
      if (submission[f]) fields[f] = submission[f];
    }

    let bar: Record<string, unknown> | null = null;

    if (existing) {
      // Update the existing listing in place — no duplicate rows.
      const photos: string[] = Array.isArray(existing.photos) ? [...existing.photos] : [];
      if (submission.photo_url && !photos.includes(submission.photo_url)) {
        photos.push(submission.photo_url);
      }
      const { data: updated, error: updateError } = await supabase
        .from('bars')
        .update({
          ...fields,
          photos,
          is_active: true,
          updated_at: new Date().toISOString(),
          // Only ever upgrade the tier; a later free re-submission must not
          // downgrade a paying bar.
          ...(tier !== 'free' && { tier }),
          ...(coords && { lat: coords.lat, lng: coords.lng }),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      bar = updated;
    } else {
      // Insert a new listing
      const barPhotos = submission.photo_url ? [submission.photo_url] : [];
      const insertPayload = {
        ...fields,
        slug: slug,
        photos: barPhotos,
        tier: tier,
        is_active: true,
        ...(coords && { lat: coords.lat, lng: coords.lng }),
      };
      const { data: inserted, error: insertError } = await supabase
        .from('bars')
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) {
        // Slug taken by a different bar (same name, different city) — retry
        // with the city-suffixed slug.
        const { data: inserted2, error: insertError2 } = await supabase
          .from('bars')
          .insert({ ...insertPayload, slug: slugWithCity })
          .select()
          .single();

        if (insertError2) {
          return NextResponse.json({ error: insertError2.message }, { status: 500 });
        }
        bar = inserted2;
      } else {
        bar = inserted;
      }
    }

    // Update submission status
    await supabase
      .from('bar_submissions')
      .update({ status: 'approved' })
      .eq('id', submissionId);

    // Make the new/updated listing visible on the live site immediately
    revalidateBarPages(bar?.slug ? [String(bar.slug)] : []);

    return NextResponse.json({ approved: true, updated: !!existing, bar: bar });
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
