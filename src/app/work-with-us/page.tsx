import type { Metadata } from 'next';
import { NewsletterForm } from '@/components/NewsletterForm';

export const metadata: Metadata = {
  title: 'Stay in the Mix | BarMagazine',
  description: 'Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.',
};

export default function WorkWithUsPage() {
  return (
    <div style={{ marginTop: 'var(--gap)' }}>
      {/* Newsletter Hero */}
      <div className="newsletter-hero" style={{
        background: 'var(--bg-dark)',
        borderRadius: 'var(--radius)',
        padding: '80px 48px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <h1 style={{
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          marginBottom: 16,
          lineHeight: 1.15,
        }}>
          Stay in the Mix
        </h1>
        <p style={{
          fontSize: 17,
          color: 'rgba(255,255,255,0.65)',
          maxWidth: 520,
          margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.
        </p>

        {/* Mailchimp form - posts to WP mc4wp */}
        <NewsletterForm className="newsletter-form" />
      </div>

      {/* What to expect */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 'var(--gap)',
        marginTop: 'var(--gap)',
      }}>
        {[
          {
            title: 'Cocktail Trends',
            desc: 'Discover the latest cocktail innovations, recipes, and techniques from top bartenders worldwide.',
          },
          {
            title: 'Bar Openings',
            desc: 'Be the first to know about exciting new bar openings and industry developments.',
          },
          {
            title: 'Industry Insights',
            desc: 'Expert interviews, brand features, and behind-the-scenes stories from the bar world.',
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              padding: '36px 28px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{
        background: 'var(--bg-accent)',
        borderRadius: 'var(--radius)',
        padding: '48px 32px',
        textAlign: 'center',
        marginTop: 'var(--gap)',
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Want to work with us?</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 20px' }}>
          For partnership inquiries, advertising, and collaborations, reach out to our team.
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
            textDecoration: 'none',
          }}
        >
          office@barmagazine.com
        </a>
      </div>
    </div>
  );
}
