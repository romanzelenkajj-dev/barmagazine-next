import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stay in the Mix | Bar Magazine',
  description: 'Get the latest cocktail trends, bar openings, and industry insights delivered to your inbox.',
};

export default function WorkWithUsPage() {
  return (
    <div style={{ marginTop: 'var(--gap)' }}>
      {/* Newsletter Hero */}
      <div style={{
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
        <form
          method="post"
          action="https://romanzelenka-wjgek.wpcomstaging.com/"
          style={{
            maxWidth: 480,
            margin: '0 auto',
            display: 'flex',
            gap: 12,
          }}
        >
          <input type="hidden" name="_mc4wp_form_id" value="84" />
          <input type="hidden" name="_mc4wp_timestamp" value="" />
          <input type="hidden" name="_mc4wp_honeypot" value="" />
          <input
            type="email"
            name="EMAIL"
            required
            placeholder="Your email address"
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: 15,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '14px 32px',
              borderRadius: 100,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Subscribe
          </button>
        </form>
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
            icon: '🍸',
            title: 'Cocktail Trends',
            desc: 'Discover the latest cocktail innovations, recipes, and techniques from top bartenders worldwide.',
          },
          {
            icon: '🏠',
            title: 'Bar Openings',
            desc: 'Be the first to know about exciting new bar openings and industry developments.',
          },
          {
            icon: '💡',
            title: 'Industry Insights',
            desc: 'Expert interviews, brand features, and behind-the-scenes stories from the bar world.',
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              padding: '40px 28px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
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
