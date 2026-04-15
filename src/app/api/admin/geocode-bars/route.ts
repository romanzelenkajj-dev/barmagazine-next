import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { geocodeBar } from '@/lib/geocode';

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

// POST — geocode bars missing lat/lng
// Body: { barId?: string } — if barId provided, geocode just that bar; otherwise geocode all missing
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { barId } = body;
  const supabase = getServiceClient();

  let query = supabase
    .from('bars')
    .select('id, name, address, city, country, lat, lng')
    .is('lat', null);

  if (barId) {
    query = supabase
      .from('bars')
      .select('id, name, address, city, country, lat, lng')
      .eq('id', barId);
  }

  const { data: bars, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!bars || bars.length === 0) return NextResponse.json({ message: 'No bars to geocode', updated: 0 });

  let updated = 0;
  let failed = 0;
  const results: { name: string; status: string; lat?: number; lng?: number }[] = [];

  for (const bar of bars) {
    if (!bar.city || !bar.country) {
      results.push({ name: bar.name, status: 'skipped (no city/country)' });
      continue;
    }

    const coords = await geocodeBar({
      name: bar.name,
      address: bar.address,
      city: bar.city,
      country: bar.country,
    });

    if (coords) {
      const { error: updateError } = await supabase
        .from('bars')
        .update({ lat: coords.lat, lng: coords.lng })
        .eq('id', bar.id);

      if (updateError) {
        results.push({ name: bar.name, status: `error: ${updateError.message}` });
        failed++;
      } else {
        results.push({ name: bar.name, status: 'geocoded', lat: coords.lat, lng: coords.lng });
        updated++;
      }
    } else {
      results.push({ name: bar.name, status: 'geocoding failed' });
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return NextResponse.json({ updated, failed, total: bars.length, results });
}
