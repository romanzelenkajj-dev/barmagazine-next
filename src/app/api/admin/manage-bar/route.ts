import { createClient } from '@supabase/supabase-js';
import { noStoreFetch } from '@/lib/supabase-auth';
import { NextRequest, NextResponse } from 'next/server';
import { geocodeBar, stateHint } from '@/lib/geocode';
import { usesSubdivision } from '@/lib/city-location';
import { normalizeBarFields } from '@/lib/normalize';
import { flagBarName } from '@/lib/bar-name';
import { revalidateBarPages } from '@/lib/revalidate-bars';

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    throw new Error('Supabase URL or service role key not configured');
  }
  // noStoreFetch: GET handlers' fetches land in Next's Data Cache; admin
  // reads must never be served stale.
  return createClient(supabaseUrl, serviceKey, { global: { fetch: noStoreFetch } });
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
  // Which bars have an owner edit waiting. /admin/bars writes to `bars`
  // directly, while owner edits are proposals in owner_submissions — without
  // this the two are invisible to each other and a pending edit can sit
  // unnoticed while someone edits the same bar by hand.
  const pendingByBar: Record<string, number> = {};
  const { data: pending, error: pendingError } = await supabase
    .from('owner_submissions')
    .select('bar_id')
    .eq('status', 'pending');

  if (pendingError) {
    console.error('[manage-bar] pending lookup failed:', pendingError.message);
  } else {
    for (const row of pending || []) {
      const id = String(row.bar_id);
      pendingByBar[id] = (pendingByBar[id] || 0) + 1;
    }
  }

  return NextResponse.json({
    bars: allBars.map(b => ({
      ...b,
      pending_owner_edits: pendingByBar[String(b.id)] || 0,
    })),
  });
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
    revalidateBarPages((data || []).map((b: Record<string, unknown>) => String(b.slug || '')));
    return NextResponse.json({ deleted: data });
  }

  if (action === 'update') {
    // Stamp the write. There is no database trigger on updated_at: rows
    // patched all day on 2026-09-14 still carried March dates, and the
    // sitemap's lastmod reads this column, so an unstamped write is a page
    // change Google is told never happened.
    const cleanUpdates = normalizeBarFields({ updated_at: new Date().toISOString(), ...updates });
    const query = barId
      ? supabase.from('bars').update(cleanUpdates).eq('id', barId).select()
      : barName
        ? supabase.from('bars').update(cleanUpdates).eq('name', barName).select()
        : null;
    if (!query) return NextResponse.json({ error: 'barId or barName required' }, { status: 400 });
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateBarPages((data || []).map((b: Record<string, unknown>) => String(b.slug || '')));
    return NextResponse.json({ updated: data });
  }

  if (action === 'create') {
    // Auto-geocode if lat/lng not already provided
    let insertData = normalizeBarFields({ ...updates });
    // bars.state for US and Canadian rows, from the address postcode line or
    // a qualifier in the city string, unless the caller set it. The city
    // slug rule and the location label read this column, never the address.
    if (!insertData.state && insertData.city && usesSubdivision(insertData.country)) {
      const s = stateHint({ address: insertData.address || null, city: insertData.city, country: insertData.country });
      if (s && /^[A-Za-z]{2}$/.test(s)) insertData = { ...insertData, state: s.toUpperCase() };
    }
    if (!insertData.lat && !insertData.lng && insertData.name && insertData.city && insertData.country) {
      const coords = await geocodeBar({
        name: insertData.name,
        address: insertData.address || null,
        city: insertData.city,
        country: insertData.country,
      });
      if (coords) {
        insertData = { ...insertData, lat: coords.lat, lng: coords.lng };
      }
    }
    // Directory noise ("Kura Stockholm", "Alenka Cocktail bar Prague") most
    // often arrives here. Log it rather than rewriting: only the venue's own
    // channels can say whether the suffix belongs to the name.
    {
      const flag = flagBarName(insertData.name, insertData.city, insertData.type);
      if (flag) {
        console.warn(
          `[manage-bar] name flag (${flag.kind}) on insert of "${insertData.name}": appended "${flag.suffix}" - verify against the venue's own channels`
        );
      }
    }
    const { data, error } = await supabase.from('bars').insert(insertData).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateBarPages((data || []).map((b: Record<string, unknown>) => String(b.slug || '')));
    return NextResponse.json({ created: data });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
