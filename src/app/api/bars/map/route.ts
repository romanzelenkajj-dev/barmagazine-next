import { NextResponse } from 'next/server';
import { getAllActiveBars } from '@/lib/supabase';

// Lightweight endpoint for the map view.
// Returns ONLY the fields needed to render map pins for ALL active bars.
// Much smaller payload than the full bars endpoint — no photos array,
// no description, no contact fields, no timestamps.
// Cached for 10 minutes at the CDN edge.

export const revalidate = 600; // 10 min cache

export type MapBar = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  state: string | null; // bars.state, for the place line on the pin card
  type: string;
  tier: string;
  lat: number | null;
  lng: number | null;
  photo: string | null; // first photo only, for popup thumbnail
  /**
   * Trimmed accolades. The query already selected these and the projection
   * threw them away, so the cost is in the response, not the database.
   *
   * Near-me needs them (task 87): it now orders the WHOLE directory rather
   * than a 226-bar sample, and a card built from this payload has to render
   * the same badges as one built from getBars(), or the same page shows two
   * qualities of card. Only the fields bestAccolade, hasFiftyBest and the
   * badge renderer read are kept.
   *
   * Null for the 1,066 bars with none, rather than an empty array, so the
   * common case costs 18 bytes.
   */
  accolades: MapAccolade[] | null;
};

export type MapAccolade = {
  org: string;
  org_key: string;
  kind: string;
  rank: number | null;
  year: number;
  score: number;
  title: string | null;
  /**
   * REQUIRED, not optional padding. isRenderable() in accolades.ts rejects
   * any entry without a non-empty source, so an accolade trimmed of it
   * renders nothing: hasFiftyBest() returns false and the 50 Best pill
   * silently disappears from every near-me card while the same bar shows one
   * in normal browsing. Dropping it to save bytes is what this field exists
   * to stop someone doing again.
   */
  source: string;
};

export async function GET() {
  try {
    // Whole-directory read: paged past Supabase's silent 1,000-row cap
    // (the map page itself had the same defect). Pins without coordinates
    // are dropped here rather than in the query; tier-then-name order is
    // applied after the pages are joined.
    const all = await getAllActiveBars<{
      id: string; name: string; slug: string; city: string; country: string; state: string | null; type: string;
      subtypes: string[] | null; tier: string; lat: number | null; lng: number | null;
      photos: string[] | null; accolades: unknown;
    }>('id, name, slug, city, country, state, type, subtypes, tier, lat, lng, photos, accolades');
    const data = all
      .filter(b => b.lat != null && b.lng != null)
      .sort((a, b) => a.tier.localeCompare(b.tier) || a.name.localeCompare(b.name));

    // Slim down: extract only first photo from the photos array
    const mapBars: MapBar[] = data.map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      city: b.city,
      country: b.country,
      state: b.state ?? null,
      type: b.type,
      tier: b.tier,
      lat: b.lat,
      lng: b.lng,
      photo: Array.isArray(b.photos) && b.photos.length > 0 ? b.photos[0] : null,
      accolades: Array.isArray(b.accolades) && b.accolades.length
        ? (b.accolades as Record<string, unknown>[]).map(a => ({
            org: String(a.org ?? ''),
            org_key: String(a.org_key ?? ''),
            kind: String(a.kind ?? ''),
            rank: a.rank == null ? null : Number(a.rank),
            year: Number(a.year ?? 0),
            score: Number(a.score ?? 0),
            title: a.title == null ? null : String(a.title),
            source: String(a.source ?? ''),
          }))
        : null,
    }));

    return NextResponse.json(
      { bars: mapBars, total: mapBars.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching map bars:', error);
    return NextResponse.json({ error: 'Failed to fetch map bars' }, { status: 500 });
  }
}
