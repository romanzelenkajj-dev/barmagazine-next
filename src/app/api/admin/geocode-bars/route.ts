import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { noStoreFetch } from '@/lib/supabase-auth';
import { geocodeBarDetailed, distanceKm, type GeocodeMethod } from '@/lib/geocode';
import { revalidateBarPages } from '@/lib/revalidate-bars';

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    throw new Error('Supabase URL or service role key not configured');
  }
  return createClient(supabaseUrl, serviceKey, { global: { fetch: noStoreFetch } });
}

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret');
  return secret === process.env.ADMIN_SECRET;
}

interface Row {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
}

interface Result {
  slug: string;
  name: string;
  status: 'geocoded' | 'unchanged' | 'proposed' | 'skipped (no city/country)' | 'geocoding failed' | string;
  method?: GeocodeMethod;
  before?: { lat: number; lng: number } | null;
  after?: { lat: number; lng: number };
  /** How far the new point is from the stored one, km; null when nothing was stored. */
  movedKm?: number | null;
}

/**
 * POST — (re)geocode bars through the same geocoder the insert path uses
 * (src/lib/geocode.ts: full street address first, name search as the
 * fallback, city centre last, 40km check throughout).
 *
 * Body, all optional:
 *   barId: string          one row
 *   barIds: string[]       a set of rows
 *   since: ISO timestamp   every active row created at or after it
 *   force: boolean         re-geocode rows that already have coordinates
 *                          (default: only rows with lat null)
 *   dryRun: boolean        compute and report, write nothing
 *   minMoveKm: number      with force, write only when the new point is at
 *                          least this far from the stored one (default 0)
 *
 * Every result carries before, after, the method that produced the point
 * and the distance moved, so a re-run over a wave can be read as a diff
 * before it is applied (Drastic Measures, 2026-09-15: a namesake-city
 * landing 400km out that only the address check caught).
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { barId, barIds, since, force, dryRun } = body as {
    barId?: string; barIds?: string[]; since?: string; force?: boolean; dryRun?: boolean; minMoveKm?: number;
  };
  const minMoveKm = typeof body.minMoveKm === 'number' ? body.minMoveKm : 0;
  const supabase = getServiceClient();

  const cols = 'id, slug, name, address, city, country, lat, lng';
  let query = supabase.from('bars').select(cols);
  if (barId) query = query.eq('id', barId);
  else if (Array.isArray(barIds) && barIds.length) query = query.in('id', barIds);
  else if (since) query = query.eq('is_active', true).gte('created_at', since);
  if (!force) query = query.is('lat', null);
  // The PostgREST cap is silent at 1,000; a wave is far smaller, a full
  // backfill goes through scripts/geocode-backfill.mjs.
  query = query.order('slug').limit(1000);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const bars = (data || []) as Row[];
  if (bars.length === 0) return NextResponse.json({ message: 'No bars to geocode', updated: 0, results: [] });

  let updated = 0;
  let failed = 0;
  const results: Result[] = [];
  const touched: string[] = [];

  for (const bar of bars) {
    if (!bar.city || !bar.country) {
      results.push({ slug: bar.slug, name: bar.name, status: 'skipped (no city/country)' });
      continue;
    }

    const r = await geocodeBarDetailed({ name: bar.name, address: bar.address, city: bar.city, country: bar.country });
    if (!r) {
      results.push({ slug: bar.slug, name: bar.name, status: 'geocoding failed' });
      failed++;
      continue;
    }
    const before = bar.lat != null && bar.lng != null ? { lat: bar.lat, lng: bar.lng } : null;
    const movedKm = before ? Math.round(distanceKm(before.lat, before.lng, r.lat, r.lng) * 10) / 10 : null;
    const after = { lat: r.lat, lng: r.lng };
    const base: Result = { slug: bar.slug, name: bar.name, status: 'proposed', method: r.method, before, after, movedKm };

    if (movedKm !== null && movedKm < minMoveKm) {
      results.push({ ...base, status: 'unchanged' });
      continue;
    }
    if (dryRun) {
      results.push(base);
      continue;
    }
    const { error: updateError } = await supabase
      .from('bars')
      .update({ lat: r.lat, lng: r.lng, updated_at: new Date().toISOString() })
      .eq('id', bar.id);
    if (updateError) {
      results.push({ ...base, status: `error: ${updateError.message}` });
      failed++;
    } else {
      results.push({ ...base, status: 'geocoded' });
      touched.push(bar.slug);
      updated++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  if (touched.length) revalidateBarPages(touched);
  return NextResponse.json({ updated, failed, total: bars.length, dryRun: !!dryRun, results });
}
