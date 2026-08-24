import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { searchOrFilter } from '@/lib/ascii-fold';

export const dynamic = 'force-dynamic';

/**
 * Bar lookup for the claim page.
 *
 * Returns only what the public directory already shows — name, city, country,
 * slug and whether the bar is spoken for. It must never return `email`, nor
 * even a masked form of it: knowing which bars have an address on file is the
 * enumeration the spec closes off at claim-start, and this endpoint would
 * otherwise reopen it.
 */
export async function GET(request: NextRequest) {
  try {
    const q = (new URL(request.url).searchParams.get('q') || '').trim();
    if (q.length < 2) return NextResponse.json({ bars: [] });

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('bars')
      .select('slug, name, city, country, owner_id')
      .eq('is_active', true)
      // Accent-insensitive via the generated *_ascii columns, so an owner
      // searching "muzsa" finds "Múzsa". Wildcards are escaped inside.
      .or(searchOrFilter(q))
      .order('name')
      .limit(20);

    if (error) {
      console.error('[claim/search]', error.message);
      return NextResponse.json({ bars: [] });
    }

    return NextResponse.json({
      bars: (data || []).map(b => ({
        slug: b.slug,
        name: b.name,
        city: b.city,
        country: b.country,
        claimed: !!b.owner_id,
      })),
    });
  } catch {
    return NextResponse.json({ bars: [] });
  }
}
