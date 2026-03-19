import { NextRequest, NextResponse } from 'next/server';

// EU member state ISO codes
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

export function middleware(request: NextRequest) {
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country') || '';
  const isEU = EU_COUNTRIES.has(country.toUpperCase());

  const response = NextResponse.next();
  response.cookies.set('geo_currency', isEU ? 'EUR' : 'USD', {
    path: '/',
    maxAge: 3600, // 1 hour
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/claim-your-bar'],
};
