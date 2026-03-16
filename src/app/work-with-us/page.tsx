import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work With Us | Bar Magazine',
  description: 'Partnership packages for bars — from social media campaigns to full-year visibility on barmagazine.com.',
};

const PACKAGES = [
  {
    tier: 'Instagram Only',
    price: '€300–600',
    features: ['1 Instagram post + 1 story set', 'Professional copy + hashtags', '88K+ follower reach', 'Performance report'],
    popular: false,
  },
  {
    tier: 'Website + Instagram',
    price: '€600–900',
    features: ['Dedicated article on barmagazine.com', 'SEO-optimized bar profile', '1 Instagram post + 1 story set', 'Cross-linked across platforms', 'Permanent web presence'],
    popular: true,
  },
  {
    tier: 'Launch Campaign',
    price: '€900–1,500',
    features: ['Full editorial feature article', 'Multi-post Instagram campaign', 'Story series with swipe-ups', 'Bar Directory premium listing', 'Priority newsletter feature'],
    popular: false,
  },
  {
    tier: 'Annual Visibility',
    price: '€2,000–4,000/yr',
    features: ['Bar Directory featured listing (12 months)', '4 Instagram posts per year', 'Quarterly article updates', 'Homepage "Featured Bars" rotation', 'Events calendar integration', 'Annual analytics report'],
    popular: false,
  },
];

export default function WorkWithUsPage() {
  return (
    <div style={{ marginTop: 'var(--gap)' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--bg-dark)',
        borderRadius: 'var(--radius)',
        padding: '64px 48px',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 'var(--gap)',
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 12 }}>
          Work With Us
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          Reach cocktail enthusiasts, industry professionals, and bar travelers worldwide.
          With 88K+ Instagram followers and growing web traffic, BarMagazine is the platform to elevate your bar&apos;s visibility.
        </p>
      </div>

      {/* Packages grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--gap)',
      }}>
        {PACKAGES.map((pkg, i) => (
          <div
            key={i}
            style={{
              background: pkg.popular ? 'var(--text-primary)' : 'var(--bg-card)',
              color: pkg.popular ? '#fff' : 'var(--text-primary)',
              borderRadius: 'var(--radius)',
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {pkg.popular && (
              <span style={{
                position: 'absolute',
                top: -10,
                right: 20,
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 100,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Most Popular
              </span>
            )}
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{pkg.tier}</h3>
            <p style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: 24,
              color: pkg.popular ? '#fff' : 'var(--accent)',
            }}>
              {pkg.price}
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 24,
            }}>
              {pkg.features.map((f, j) => (
                <li key={j} style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  display: 'flex',
                  gap: 8,
                  color: pkg.popular ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                }}>
                  <span style={{ color: pkg.popular ? '#fff' : 'var(--accent)', flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:office@barmagazine.com?subject=Partnership Inquiry"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 24px',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 600,
                background: pkg.popular ? '#fff' : 'var(--text-primary)',
                color: pkg.popular ? 'var(--text-primary)' : '#fff',
                transition: 'opacity 0.3s',
              }}
            >
              Get Started
            </a>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--gap)',
        marginTop: 48,
      }}>
        {[
          { stat: '88K+', label: 'Instagram Followers' },
          { stat: '319+', label: 'Articles Published' },
          { stat: '50+', label: 'Countries Reached' },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            padding: '40px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--accent)', marginBottom: 4 }}>
              {item.stat}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div style={{
        background: 'var(--bg-accent)',
        borderRadius: 'var(--radius)',
        padding: '48px 32px',
        textAlign: 'center',
        marginTop: 48,
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Let&apos;s Talk</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 20px' }}>
          Every bar is unique, and we love crafting custom solutions. Reach out and let&apos;s explore how we can work together.
        </p>
        <a
          href="mailto:office@barmagazine.com"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: 'var(--text-primary)',
            color: '#fff',
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          office@barmagazine.com
        </a>
      </div>
    </div>
  );
}
