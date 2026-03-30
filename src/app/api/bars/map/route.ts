import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase
      .from('bars')
      .select('id, name, slug, city, country, type, tier, lat, lng, photos')
      .eq('is_active', true)
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('tier', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    // Slim down: extract only first photo from the photos array
    const mapBars: MapBar[] = (data || []).map(b => ({
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
