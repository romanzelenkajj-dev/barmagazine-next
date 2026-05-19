import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { geocodeBar } from '@/lib/geocode';
import { normalizeBarFields } from '@/lib/normalize';

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

// GET — list all bars (admin view, includes inactive)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  // Paginate to bypass Supabase's default 1000-row limit
  const PAGE_SIZE = 1000;
  const allBars: Record<string, unknown>[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('bars')
      .select('*')
      .order('name', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) break;
    allBars.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return NextResponse.json({ bars: allBars });
}

// POST — update or delete a bar
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action, barId, barName, updates } = body;
  const supabase = getServiceClient();

  if (action === 'delete') {
    const query = barName
      ? supabase.from('bars').delete().eq('name', barName).select()
      : supabase.from('bars').delete().eq('id', barId).select();
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: data });
  }

  if (action === 'update') {
    if (!barId && !barName) {
      return NextResponse.json({ error: 'barId or barName required' }, { status: 400 });
    }
    const finalUpdates = normalizeBarFields({ ...updates });

    // Re-geocode when the location changed (address/city/country edited) and
    // the caller didn't supply explicit coordinates. Without this, editing a
    // bar's address leaves its old map pin stale.
    const locationChanged =
      typeof finalUpdates.address === 'string' ||
      typeof finalUpdates.city === 'string' ||
      typeof finalUpdates.country === 'string';
    const explicitCoords = finalUpdates.lat != null || finalUpdates.lng != null;

    if (locationChanged && !explicitCoords) {
      const sel = supabase.from('bars').select('name, address, city, country');
      const { data: existing } = await (barId
        ? sel.eq('id', barId).single()
        : sel.eq('name', barName).single());
      if (existing) {
        const merged = {
          name: (finalUpdates.name ?? existing.name) as string,
          address: (finalUpdates.address ?? existing.address) as string | null,
          city: (finalUpdates.city ?? existing.city) as string,
          country: (finalUpdates.country ?? existing.country) as string,
        };
        if (merged.city && merged.country) {
          const coords = await geocodeBar(merged);
          if (coords) {
            finalUpdates.lat = coords.lat;
            finalUpdates.lng = coords.lng;
            if (coords.approximate) {
              console.warn(
                `GEOCODE_FALLBACK update "${merged.name}" (${merged.city}, ${merged.country}) → ${coords.level} center`,
              );
            }
          }
        }
      }
    }

    const query = barId
      ? supabase.from('bars').update(finalUpdates).eq('id', barId).select()
      : supabase.from('bars').update(finalUpdates).eq('name', barName).select();
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ updated: data });
  }

  if (action === 'create') {
    // Auto-geocode if lat/lng not already provided
    let insertData = normalizeBarFields({ ...updates });
    if (!insertData.lat && !insertData.lng && insertData.name && insertData.city && insertData.country) {
      const coords = await geocodeBar({
        name: insertData.name,
        address: insertData.address || null,
        city: insertData.city,
        country: insertData.country,
      });
      if (coords) {
        insertData = { ...insertData, lat: coords.lat, lng: coords.lng };
        if (coords.approximate) {
          console.warn(
            `GEOCODE_FALLBACK create "${insertData.name}" (${insertData.city}, ${insertData.country}) → ${coords.level} center`,
          );
        }
      }
    }
    const { data, error } = await supabase.from('bars').insert(insertData).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ created: data });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
