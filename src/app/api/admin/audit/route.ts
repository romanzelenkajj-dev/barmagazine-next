import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) throw new Error('Supabase credentials missing');
  return createClient(supabaseUrl, serviceKey);
}

function checkAuth(request: NextRequest): boolean {
  return request.headers.get('x-admin-secret') === process.env.ADMIN_SECRET;
}

// GET — audit: find duplicates or search bars by name
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getServiceClient();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const name = searchParams.get('name');
  const city = searchParams.get('city');
  const country = searchParams.get('country');

  if (action === 'search') {
    // Search bars by name/city/country
    let query = supabase.from('bars').select('id, name, slug, city, country, tier, photos, is_active');
    if (name) query = query.ilike('name', `%${name}%`);
    if (city) query = query.ilike('city', `%${city}%`);
    if (country) query = query.ilike('country', `%${country}%`);
    const { data, error } = await query.limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bars: data });
  }

  if (action === 'duplicates') {
    // Find bars with duplicate names using a raw SQL approach
    // Get all bar names and find ones that appear more than once
    const { data, error } = await supabase.rpc('find_duplicate_bar_names').limit(200);
    if (error) {
      // Fallback: fetch all names and find duplicates in JS
      // Use a chunked approach - get just name, id, city, country, tier, photos
      const PAGE_SIZE = 1000;
      const allBars: { id: string; name: string; slug: string; city: string; country: string; tier: string; photos: string[]; is_active: boolean }[] = [];
      let from = 0;
      while (true) {
        const { data: chunk, error: chunkError } = await supabase
          .from('bars')
          .select('id, name, slug, city, country, tier, photos, is_active')
          .range(from, from + PAGE_SIZE - 1)
          .order('name', { ascending: true });
        if (chunkError || !chunk || chunk.length === 0) break;
        allBars.push(...chunk);
        if (chunk.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }
      // Find duplicates
      const nameMap: Record<string, typeof allBars> = {};
      for (const bar of allBars) {
        const key = bar.name.trim().toLowerCase();
        if (!nameMap[key]) nameMap[key] = [];
        nameMap[key].push(bar);
      }
      const duplicates = Object.values(nameMap).filter(group => group.length > 1);
      return NextResponse.json({ 
        totalBars: allBars.length,
        duplicateGroups: duplicates.length,
        duplicates: duplicates.map(group => ({
          name: group[0].name,
          entries: group.map(b => ({
            id: b.id,
            slug: b.slug,
            city: b.city,
            country: b.country,
            tier: b.tier,
            photos: (b.photos || []).length,
            is_active: b.is_active
          }))
        }))
      });
    }
    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: 'action required: search or duplicates' }, { status: 400 });
}
