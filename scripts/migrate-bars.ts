/**
 * Migration script: Import bars.json into Supabase
 * Run with: npx tsx scripts/migrate-bars.ts
 * 
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import barsData from '../src/data/bars.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Region mapping
function getRegion(country: string): string {
  const regions: Record<string, string> = {
    'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
    'United Kingdom': 'Europe', 'France': 'Europe', 'Spain': 'Europe', 'Italy': 'Europe',
    'Germany': 'Europe', 'Netherlands': 'Europe', 'Portugal': 'Europe', 'Greece': 'Europe',
    'Austria': 'Europe', 'Sweden': 'Europe', 'Denmark': 'Europe', 'Czech Republic': 'Europe',
    'Poland': 'Europe', 'Slovakia': 'Europe', 'Ireland': 'Europe',
    'Japan': 'Asia', 'China': 'Asia', 'South Korea': 'Asia', 'Singapore': 'Asia',
    'Thailand': 'Asia', 'India': 'Asia', 'Philippines': 'Asia', 'Vietnam': 'Asia',
    'Indonesia': 'Asia', 'Malaysia': 'Asia', 'Taiwan': 'Asia',
    'United Arab Emirates': 'Middle East', 'Israel': 'Middle East', 'Saudi Arabia': 'Middle East',
    'Bahrain': 'Middle East', 'Qatar': 'Middle East', 'Lebanon': 'Middle East',
    'Brazil': 'South America', 'Argentina': 'South America', 'Colombia': 'South America',
    'Peru': 'South America', 'Chile': 'South America',
    'Australia': 'Oceania', 'New Zealand': 'Oceania',
    'South Africa': 'Africa', 'Nigeria': 'Africa', 'Kenya': 'Africa',
  };
  return regions[country] || 'Other';
}

async function migrate() {
  console.log(`Migrating ${barsData.length} bars to Supabase...`);
  
  const bars = (barsData as any[]).map(bar => ({
    name: bar.name,
    slug: bar.slug,
    city: bar.city || 'Unknown',
    country: bar.country || 'Unknown',
    region: getRegion(bar.country || ''),
    type: bar.type || 'Cocktail Bar',
    short_excerpt: bar.excerpt || null,
    photos: bar.image ? [bar.image] : [],
    wp_article_slug: bar.wp_post_slug || null,
    tier: 'free' as const,
    is_verified: false,
    is_active: true,
  }));

  // Insert in batches of 50
  const batchSize = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < bars.length; i += batchSize) {
    const batch = bars.slice(i, i + batchSize);
    const { data, error } = await supabase.from('bars').insert(batch).select('id');
    
    if (error) {
      console.error(`Error in batch ${i / batchSize + 1}:`, error.message);
      // Try individual inserts for failed batch
      for (const bar of batch) {
        const { error: singleError } = await supabase.from('bars').insert(bar);
        if (singleError) {
          console.error(`  Failed: ${bar.name} - ${singleError.message}`);
          errors++;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length || batch.length;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Errors: ${errors}`);
  console.log(`Total in database should be ${inserted} bars.`);
}

migrate().catch(console.error);
