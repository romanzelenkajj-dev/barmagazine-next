import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { searchOrFilters } from '@/lib/ascii-fold';

export const dynamic = 'force-dynamic';

interface Row {
  slug: string;
  name: string;
  city: string;
  country: string;
  owner_id: string | null;
}

/** The one public shape both lookups return, so they cannot drift apart. */
function respond(data: Row[] | null, error: { message: string } | null) {
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
}

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
    const params = new URL(request.url).searchParams;
    const q = (params.get('q') || '').trim();
    // Exact-slug lookup so the "Is this your bar?" button on a profile can hand
    // the claim page the bar the owner was already looking at, instead of making
    // them search for it again. Returns the same public shape as a search, so it
    // exposes nothing the directory does not already show.
    const slug = (params.get('slug') || '').trim();

    if (!slug && q.length < 2) return NextResponse.json({ bars: [] });

    const supabase = createAdminClient();

    const base = supabase
      .from('bars')
      .select('slug, name, city, country, owner_id')
      .eq('is_active', true);

    // NOT a ternary over a shared `base`: supabase-js filter builders mutate
    // and return themselves, so applying the search filters to `base` would
    // leave them on the slug lookup too when both params arrive.
    if (slug) {
      const { data, error } = await base.eq('slug', slug).limit(1);
      return respond(data as Row[] | null, error);
    }

    // Accent-insensitive via the generated *_ascii columns, so an owner
    // searching "muzsa" finds "Múzsa". Wildcards are escaped inside.
    //
    // One `.or()` per word, which PostgREST ANDs together: every word must
    // match, in any order. An owner typing their venue and their room in the
    // order the sign outside uses is the case this serves, and it is the one
    // the search used to answer with nothing at all.
    let search = base;
    searchOrFilters(q).forEach(filter => { search = search.or(filter); });
    const { data, error } = await search.order('name').limit(20);
    return respond(data as Row[] | null, error);
  } catch {
    return NextResponse.json({ bars: [] });
  }
}
