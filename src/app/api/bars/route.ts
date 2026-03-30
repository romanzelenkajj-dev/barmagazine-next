import { NextRequest, NextResponse } from 'next/server';
import { getBars } from '@/lib/supabase';

// FIX: New API route to support server-side pagination for the bar directory.
// Previously, /bars page fetched all 1000+ bars in one request and sent them
// all in the initial HTML payload (~600KB inline script). This endpoint lets
// the client fetch bars in pages of 24, dramatically reducing initial load time.
//
// Usage: GET /api/bars?page=1&perPage=24&country=Spain&city=Barcelona&type=cocktail-bar&search=query

export const revalidate = 300; // 5 min cache

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = Math.min(parseInt(searchParams.get('perPage') || '24', 10), 1000); // cap at 1000 for filter fetches
  const country = searchParams.get('country') || undefined;
  const city = searchParams.get('city') || undefined;
  const type = searchParams.get('type') || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const { bars, total } = await getBars({ page, perPage, country, city, type, search });

    return NextResponse.json(
      { bars, total, page, perPage },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching bars:', error);
    return NextResponse.json({ error: 'Failed to fetch bars' }, { status: 500 });
  }
}
