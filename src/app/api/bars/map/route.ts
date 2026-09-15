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
  type: string;
  tier: string;
  lat: number | null;
  lng: number | null;
  photo: string | null; // first photo only, for popup thumbnail
};

export async function GET() {
  try {
    // Whole-directory read: paged past Supabase's silent 1,000-row cap
    // (the map page itself had the same defect). Pins without coordinates
    // are dropped here rather than in the query; tier-then-name order is
    // applied after the pages are joined.
    const all = await getAllActiveBars<{
      id: string; name: string; slug: string; city: string; country: string; type: string;
      subtypes: string[] | null; tier: string; lat: number | null; lng: number | null;
      photos: string[] | null; accolades: unknown;
    }>('id, name, slug, city, country, type, subtypes, tier, lat, lng, photos, accolades');
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
      type: b.type,
      tier: b.tier,
      lat: b.lat,
      lng: b.lng,
      photo: Array.isArray(b.photos) && b.photos.length > 0 ? b.photos[0] : null,
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
