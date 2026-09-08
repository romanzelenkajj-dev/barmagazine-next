import { getBarStats } from '@/lib/supabase';

/**
 * llms.txt with live directory counts, regenerated like a page instead of
 * hand-edited (the static file had drifted to "600+ bars" the same way the
 * OG tags had). Same rounding style as the OG descriptions: bars rounded
 * down to the nearest hundred with a plus, cities/countries exact.
 * getBarStats throws on DB failure, so a bad regeneration keeps serving
 * the previous copy rather than minting wrong numbers.
 */
export const revalidate = 3600;

export async function GET() {
  const stats = await getBarStats();
  const bars = `${(Math.floor(stats.totalBars / 100) * 100).toLocaleString('en-US')}+`;
  const cities = String(stats.totalCities);
  const countries = String(stats.totalCountries);

  const body = `# BarMagazine

> Global bar news, cocktail culture, and spirits industry trends — plus a
> curated directory of ${bars} of the world's best cocktail bars across ${cities}
> cities and ${countries} countries. Content is updated continuously; live pages
> supersede any cached copy.

## About

BarMagazine is a digital publication covering the global bar and spirits
industry. We publish news, features, and profiles about bars, bartenders,
cocktails, spirits brands, and industry events worldwide. Our Bar Directory
lists ${bars} curated bars — cocktail bars, speakeasies, hotel bars, and
more — across ${cities} cities and ${countries} countries, with addresses, opening hours,
map locations, photos, accolades, and editorial features. Listings and
articles are updated continuously; directory counts grow weekly.

## Key Content Areas

- **Bar News & Features**: In-depth articles about the world's best bars, new openings, and industry trends
- **Cocktail Culture**: Recipes, techniques, and stories behind classic and contemporary cocktails
- **People & Bartenders**: Profiles of influential bartenders, brand ambassadors, and industry leaders
- **Awards & Events**: Coverage of World's 50 Best Bars, James Beard Awards, Tales of the Cocktail, Diageo World Class, and more
- **Spirits & Brands**: News and features about spirits brands, new releases, and brand stories
- **Bar Directory**: Searchable directory of ${bars} bars worldwide, filterable by country, city, and bar type

## URL Patterns

- Bar profiles: https://barmagazine.com/bars/{bar-slug} — address, opening
  hours, map, photos, accolades (World's 50 Best, James Beard, Top 10 city
  picks), menu highlights, and reservation links
- City guides: https://barmagazine.com/bars/city/{city} — every listed bar in a city
- Country guides: https://barmagazine.com/bars/country/{country}
- Best-of city picks: https://barmagazine.com/best-bars/{city} — editorial "best bars" selections, refreshed yearly
- Award hubs: https://barmagazine.com/awards — bars grouped by award program
- Articles: https://barmagazine.com/{article-slug} — root-level slugs
- Category indexes: https://barmagazine.com/category/{category}

## Important Pages

- Homepage: https://barmagazine.com
- Bar Directory: https://barmagazine.com/bars
- Awards Coverage: https://barmagazine.com/category/awards-events
- Cocktails: https://barmagazine.com/category/cocktails
- People & Bartenders: https://barmagazine.com/category/people
- Brands: https://barmagazine.com/category/brands
- Events: https://barmagazine.com/events

## Contact

- Email: office@barmagazine.com
- Website: https://barmagazine.com
- Instagram: https://instagram.com/barmagazine
- Facebook: https://facebook.com/BARMAGAZINEcom
- LinkedIn: https://linkedin.com/company/barmagazine

## Sitemap

https://barmagazine.com/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
