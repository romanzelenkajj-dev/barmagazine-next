import React from 'react';

/**
 * Elegant fallback visual for bars without a photo yet.
 * Replaces the old giant-initials cards: a muted dark gradient, a thin
 * brass-line glass illustration (picked by bar type), and the bar name in
 * spaced small caps — reads as intentional branding, not as a missing photo.
 */

const GRADIENTS = [
  'linear-gradient(150deg, #17130e 0%, #241c12 55%, #17130e 100%)', // warm oak
  'linear-gradient(150deg, #101418 0%, #1a222b 55%, #101418 100%)', // midnight blue
  'linear-gradient(150deg, #131017 0%, #1f1826 55%, #131017 100%)', // plum smoke
  'linear-gradient(150deg, #101512 0%, #18231c 55%, #101512 100%)', // bottle green
  'linear-gradient(150deg, #151210 0%, #231b16 55%, #151210 100%)', // espresso
  'linear-gradient(150deg, #121212 0%, #1e1e1e 55%, #121212 100%)', // charcoal
];

const BRASS = '#C9A96A';

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

type GlassKind = 'martini' | 'coupe' | 'rocks' | 'wine' | 'highball' | 'pint';

function glassForType(type?: string | null, name?: string): GlassKind {
  const t = (type || '').toLowerCase();
  if (t.includes('speakeasy')) return 'rocks';
  if (t.includes('wine')) return 'wine';
  if (t.includes('rooftop') || t.includes('tiki') || t.includes('beach')) return 'highball';
  if (t.includes('pub') || t.includes('beer') || t.includes('brew')) return 'pint';
  if (t.includes('cocktail')) return 'martini';
  // vary a little by name so grids don't repeat one icon
  const variants: GlassKind[] = ['martini', 'coupe', 'rocks'];
  return variants[hashName(name || '') % variants.length];
}

function GlassIcon({ kind }: { kind: GlassKind }) {
  const common = {
    fill: 'none',
    stroke: BRASS,
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (kind) {
    case 'martini':
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M8 10h32L24 27z" />
          <path d="M24 27v12M15 39h18" />
          <circle cx="31" cy="14" r="2.6" />
          <path d="M31 11.4V6" />
        </svg>
      );
    case 'coupe':
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M10 9h28c0 8-5 13-14 13S10 17 10 9z" />
          <path d="M24 22v15M15 39h18" />
          <path d="M33 6l4 5" />
        </svg>
      );
    case 'rocks':
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M12 10h24l-2 28H14z" />
          <path d="M17 20l6 6M27 18l-8 8" opacity="0.85" />
          <path d="M13.5 15h21" opacity="0.5" />
        </svg>
      );
    case 'wine':
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M15 7h18c0 10-3.5 16-9 16s-9-6-9-16z" />
          <path d="M24 23v14M16 39h16" />
          <path d="M15.8 13h16.4" opacity="0.5" />
        </svg>
      );
    case 'highball':
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M15 7h18l-1.5 32h-15z" />
          <path d="M20 3l8 10" opacity="0.85" />
          <path d="M16 17h16" opacity="0.5" />
        </svg>
      );
    case 'pint':
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M14 8h16l-1 30H16z" />
          <path d="M30 14h4a3 3 0 013 3v6a3 3 0 01-3 3h-4.6" />
          <path d="M15 14h14" opacity="0.5" />
        </svg>
      );
  }
}

export function BarPlaceholder({
  name,
  type,
  size = 'card',
}: {
  name: string;
  type?: string | null;
  size?: 'card' | 'hero';
}) {
  const gradient = GRADIENTS[hashName(name) % GRADIENTS.length];
  return (
    <div
      className={`bar-placeholder${size === 'hero' ? ' bar-placeholder--hero' : ''}`}
      style={{ background: gradient }}
      aria-label={name}
    >
      <div className="bar-placeholder-ring">
        <GlassIcon kind={glassForType(type, name)} />
      </div>
      <span className="bar-placeholder-name">{name}</span>
      <span className="bar-placeholder-rule" aria-hidden="true" />
    </div>
  );
}
