import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events Calendar | Bar Magazine',
  description: 'Upcoming bar industry events, cocktail competitions, and trade shows worldwide.',
};

const EVENTS = [
  { date: '2026-03-22', title: 'Bar Convent Asia 2026', location: 'Singapore', type: 'Trade Show', desc: 'Asia\'s leading bar and beverage trade show returns to Singapore with masterclasses, tastings, and industry networking.' },
  { date: '2026-04-05', title: 'World Cocktail Day Festival', location: 'London, UK', type: 'Festival', desc: 'A city-wide celebration of cocktail culture with pop-ups, guest shifts, and exclusive menus at London\'s top bars.' },
  { date: '2026-04-18', title: 'Tales of the Cocktail', location: 'New Orleans, US', type: 'Conference', desc: 'The world\'s premier cocktail festival featuring seminars, tastings, competitions, and the Spirited Awards.' },
  { date: '2026-05-10', title: 'Bar Convent Berlin', location: 'Berlin, Germany', type: 'Trade Show', desc: 'Europe\'s largest bar and spirits trade fair with 15,000+ visitors and hundreds of exhibiting brands.' },
  { date: '2026-05-25', title: 'Melbourne Cocktail Festival', location: 'Melbourne, AU', type: 'Festival', desc: 'A week-long celebration showcasing Melbourne\'s vibrant cocktail scene with guest bartenders from around the world.' },
  { date: '2026-06-08', title: 'London Spirits Competition', location: 'London, UK', type: 'Competition', desc: 'International spirits competition judged by top bartenders, buyers, and spirits experts.' },
  { date: '2026-06-20', title: 'Imbibe Live', location: 'London, UK', type: 'Trade Show', desc: 'The UK\'s leading on-trade drinks event featuring masterclasses, new product launches, and networking.' },
  { date: '2026-07-15', title: 'Tokyo Cocktail Week', location: 'Tokyo, Japan', type: 'Festival', desc: 'A celebration of Tokyo\'s legendary bar culture with tours, pop-ups, and collaborative events.' },
  { date: '2026-08-02', title: 'Panamá Cocktail Festival', location: 'Panama City', type: 'Festival', desc: 'Central America\'s premier cocktail event bringing together Latin American bar talent.' },
  { date: '2026-09-14', title: 'World\'s 50 Best Bars Ceremony', location: 'TBA', type: 'Awards', desc: 'The annual announcement of the World\'s 50 Best Bars list — the most anticipated event in the global bar industry.' },
  { date: '2026-10-05', title: 'Singapore Cocktail Festival', location: 'Singapore', type: 'Festival', desc: 'Southeast Asia\'s biggest cocktail festival featuring Asia\'s best bartenders and global guest shifts.' },
  { date: '2026-11-10', title: 'Whisky Live Paris', location: 'Paris, France', type: 'Trade Show', desc: 'Europe\'s premier whisky event with over 150 exhibitors, tastings, and masterclasses.' },
];

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.toLocaleDateString('en', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  return { month, day };
}

export default function EventsPage() {
  return (
    <div style={{ marginTop: 'var(--gap)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Events Calendar
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          Upcoming bar industry events, cocktail competitions, and trade shows from around the world.
        </p>
      </div>

      {/* Events list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
        {EVENTS.map((event, i) => {
          const { month, day } = formatEventDate(event.date);
          return (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                padding: 28,
                display: 'flex',
                gap: 24,
                alignItems: 'flex-start',
              }}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'var(--bg-card-warm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em' }}>
                  {month}
                </span>
                <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>
                  {day}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{event.title}</h3>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 10px',
                    borderRadius: 100,
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}>
                    {event.type}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {event.location}
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {event.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit CTA */}
      <div style={{
        background: 'var(--bg-accent)',
        borderRadius: 'var(--radius)',
        padding: '48px 32px',
        textAlign: 'center',
        marginTop: 48,
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Have an event to submit?</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 20px' }}>
          We&apos;re always looking for industry events to feature. Submit your event and reach the global bar community.
        </p>
        <a
          href="mailto:office@barmagazine.com?subject=Event Submission"
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
          Submit Event
        </a>
      </div>
    </div>
  );
}
