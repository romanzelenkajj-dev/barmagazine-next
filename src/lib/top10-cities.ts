// Shared data — no 'use client' directive so this can be imported by both
// server components (e.g. Top10FooterBlock, page.tsx) and client components
// (e.g. Top10CityPicker).
export const TOP10_CITIES = [
  { label: 'Dubai',      dirSlug: 'dubai' },
  { label: 'Hong Kong',  dirSlug: 'hong-kong' },
  { label: 'London',     dirSlug: 'london' },
  { label: 'New York',   dirSlug: 'new-york' },
  { label: 'Singapore',  dirSlug: 'singapore' },
  { label: 'Tokyo',      dirSlug: 'tokyo' },
];
