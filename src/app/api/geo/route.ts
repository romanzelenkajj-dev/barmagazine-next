import { NextRequest, NextResponse } from 'next/server';

// EU member state ISO codes
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

export async function GET(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') || '';
  const isEU = EU_COUNTRIES.has(country.toUpperCase());

  return NextResponse.json(
    { country, isEU },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
