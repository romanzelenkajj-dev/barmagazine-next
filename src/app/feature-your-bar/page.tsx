import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import {
  CURRENCY_COOKIE,
  resolveCurrencyForRequest,
  symbolFor,
  type Currency,
} from '@/lib/geo-currency';

/**
 * /feature-your-bar — landing page for the bar-featuring sales funnel.
 *
 * Replaces the legacy /claim-your-bar URL via a 301 in next.config.mjs.
 * Server-rendered so all copy + JSON-LD ships in the initial HTML
 * (Lighthouse SEO requires view-source content; the prompt's SSR
 * requirement is load-bearing for ranking).
 *
 * Currency is resolved server-side from the `geo_currency` cookie
 * (set by src/middleware.ts on this exact path) with `x-vercel-ip-
 * country` as the cold-start fallback. EU visitors see €; everyone
 * else sees $ on the same numeric pricing — matches the existing
 * /claim-your-bar client-side getTiers(isEU) convention.
 *
 * CTAs all link to /add-your-bar?plan=… — the same flow /claim-your-bar
 * uses today. /add-your-bar's form submission POSTs to
 * /api/create-checkout which creates the Stripe Checkout Session. No
 * Stripe code lives in this file; the wiring is the existing code path.
 */

const SITE_URL = 'https://barmagazine.com';
const PAGE_URL = `${SITE_URL}/feature-your-bar`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  title: 'Feature Your Bar on BarMagazine | Get Featured & Promoted',
  description:
    "Get your bar featured to cocktail lovers worldwide: a feature article, SEO profile and social coverage. List free or get Featured from €19.50/mo.",
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  } as Metadata['robots'],
  openGraph: {
    type: 'website',
    siteName: 'BarMagazine',
    title:
      'Feature Your Bar on BarMagazine | Get Featured & Promote Your Bar',
    description:
      'Get your bar in front of cocktail lovers and industry pros with a feature article, SEO profile and social coverage. List free or get Featured from €19.50/mo.',
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Feature Your Bar on BarMagazine | Get Featured & Promote Your Bar',
    description:
      'Get your bar in front of cocktail lovers and industry pros with a feature article, SEO profile and social coverage.',
    images: [OG_IMAGE],
  },
};

// ISR — page is mostly static; allow occasional revalidation in case
// copy/pricing changes without a redeploy.
export const revalidate = 3600;

function resolveCurrencySSR(): Currency {
  const cookieStore = cookies();
  const headerList = headers();
  return resolveCurrencyForRequest({
    cookieValue: cookieStore.get(CURRENCY_COOKIE)?.value,
    countryHeader: headerList.get('x-vercel-ip-country'),
  });
}

// JSON-LD blocks — built per-request so the Service/Offer prices match
// the currency the visitor sees. Search-crawler bots (US-based)
// typically see the USD variant; EU visitors see EUR. Schema.org
// accepts per-visitor offer variation.
function jsonLdBlocks(currency: Currency) {
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Feature Your Bar on BarMagazine',
    url: PAGE_URL,
    description:
      'Get your bar featured and promoted to cocktail lovers and industry professionals worldwide with a BarMagazine feature article, SEO-optimized profile and social coverage.',
    publisher: {
      '@type': 'Organization',
      name: 'BarMagazine',
      url: SITE_URL,
      logo: `${SITE_URL}/logo-white.png`,
      sameAs: [
        'https://www.instagram.com/barmagazine',
        'https://www.facebook.com/BARMAGAZINEcom',
        'https://www.linkedin.com/company/barmagazine',
      ],
    },
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Bar feature and promotion',
    provider: {
      '@type': 'Organization',
      name: 'BarMagazine',
      url: SITE_URL,
    },
    areaServed: 'Worldwide',
    offers: [
      {
        '@type': 'Offer',
        name: 'Listed (Free)',
        price: '0',
        priceCurrency: currency,
        url: `${SITE_URL}/add-your-bar`,
      },
      {
        '@type': 'Offer',
        name: 'Featured',
        price: '234',
        priceCurrency: currency,
        url: `${SITE_URL}/add-your-bar?plan=featured`,
        description:
          'Billed annually. Includes a BarMagazine feature article, SEO-optimized profile, priority placement and Featured badge.',
      },
      {
        '@type': 'Offer',
        name: 'Featured + Social',
        price: '474',
        priceCurrency: currency,
        url: `${SITE_URL}/add-your-bar?plan=featured_social`,
        description:
          'Billed annually. Everything in Featured plus an Instagram post or Reel, 3 Stories and a cross-promotion collab.',
      },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I get my bar featured on BarMagazine?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Choose a plan, fill out the short submission form with your bar's details and photos, and complete payment securely via Stripe. We publish your feature within a few days, no meetings, no back-and-forth.",
        },
      },
      {
        '@type': 'Question',
        name: 'How can I promote my bar online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The fastest way to promote your bar online is to be featured on a publication your future guests already read. A BarMagazine feature gives you a professionally written, SEO-optimized article that ranks in Google, a profile in our global directory, and exposure to our 88,000+ Instagram followers.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does the feature article include?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "A professionally written article highlighting your bar's story, signature cocktails and atmosphere, optimized for search so new guests can find you. Standalone articles cost over €1,000, it's included free with the Featured plan.",
        },
      },
      {
        '@type': 'Question',
        name: 'How much does it cost to feature my bar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Listing your bar is free. During our launch promotion, Featured starts at €19.50/month (billed annually, €234/year), and Featured + Social, which adds Instagram coverage, starts at €39.50/month billed annually (€474/year).',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel my subscription?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can cancel anytime through the Stripe Customer Portal or by emailing office@barmagazine.com. EU consumers also have a 14-day right of withdrawal after purchase.',
        },
      },
    ],
  };

  return [webPage, service, faq];
}

// Bars rotating in the hero marquee. Duplicated server-side for the
// seamless CSS scroll loop (the doubled list lets translateX(-50%)
// land on a clean boundary).
const MARQUEE_BARS: Array<{ name: string; city: string }> = [
  { name: 'The Loft', city: 'Santiago' },
  { name: 'FlipDog', city: 'London' },
  { name: 'The Grey Room', city: 'Tokyo' },
  { name: 'Bar Sathorn', city: 'Bangkok' },
  { name: 'Jin Bo Law', city: 'Hong Kong' },
  { name: 'Himkok', city: 'Oslo' },
  { name: 'Rayo', city: 'Mexico City' },
  { name: 'Horatio', city: 'Singapore' },
  { name: 'St. Regis Bar', city: 'Jakarta' },
  { name: 'Scarfes Bar', city: 'London' },
];

export default function FeatureYourBarPage() {
  const currency = resolveCurrencySSR();
  const sym = symbolFor(currency);
  const ldBlocks = jsonLdBlocks(currency);

  return (
    <>
      {/* JSON-LD — emitted server-side so it's in the initial HTML for
          Googlebot. Each block is a separate <script> per schema.org best
          practice (one @context per block). */}
      {ldBlocks.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <main className="feature-page">
        {/* ============= HERO ============= */}
        <section className="feature-hero">
          <div className="feature-wrap">
            <span className="feature-pill">★ Launch Special · 50% off your first year</span>
            <h1>
              Feature your bar on{' '}
              <span className="feature-accent">BarMagazine.</span>
            </h1>
            <p className="feature-hero-sub">
              Get your bar in front of cocktail lovers and industry professionals
              around the world, with a professionally written feature article, an
              SEO-optimized profile that ranks on Google, and coverage across our
              channels. Go live in days, all self-serve.
            </p>
            <div className="feature-hero-cta">
              <a className="feature-btn feature-btn-primary" href="#pricing">
                Get my bar featured
              </a>
              <a className="feature-btn feature-btn-outline" href="#how">
                See how it works
              </a>
            </div>
            <p className="feature-reassure">
              Free listing available · Featured from {sym}19.50/mo · Cancel anytime
            </p>

            <div className="feature-marquee">
              <p className="feature-marquee-label">
                Bars discovered through BarMagazine
              </p>
              <div className="feature-marquee-track">
                {[...MARQUEE_BARS, ...MARQUEE_BARS].map((bar, i) => (
                  <span key={i}>
                    {bar.name} <b>· {bar.city}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============= HOW IT WORKS ============= */}
        <section id="how" className="feature-section">
          <div className="feature-wrap">
            <div className="feature-sec-head">
              <span className="feature-eyebrow">Simple &amp; self-serve</span>
              <h2 className="feature-sec-title">Get featured in three steps</h2>
              <p className="feature-sec-intro">
                No agencies, no meetings, no waiting weeks. Pick a plan, tell us
                about your bar, and we do the rest.
              </p>
            </div>
            <div className="feature-steps">
              <div className="feature-step">
                <div className="feature-step-num">Step 01</div>
                <h3>Choose your plan</h3>
                <p>
                  List for free, or upgrade to Featured for an article and
                  priority placement. Secure checkout via Stripe in under two
                  minutes.
                </p>
              </div>
              <div className="feature-step">
                <div className="feature-step-num">Step 02</div>
                <h3>Tell us your story</h3>
                <p>
                  Fill in a short form with your bar&apos;s story, signature
                  cocktails and photos. That&apos;s everything we need, no calls
                  required.
                </p>
              </div>
              <div className="feature-step">
                <div className="feature-step-num">Step 03</div>
                <h3>Go live &amp; get noticed</h3>
                <p>
                  We publish your feature within a few days. New guests discover
                  you through Google, our directory and our social channels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============= WHAT YOU GET (dark band) ============= */}
        <section className="feature-section feature-dark">
          <div className="feature-wrap">
            <div className="feature-sec-head">
              <span className="feature-eyebrow">What you get</span>
              <h2 className="feature-sec-title">More than a listing</h2>
              <p className="feature-sec-intro">
                Every Featured bar gets an owned marketing asset that keeps
                working long after launch.
              </p>
            </div>
            <div className="feature-feat-grid">
              <div className="feature-feat">
                <h3>A real feature article</h3>
                <p>
                  Professionally written and SEO-optimized, standalone articles
                  cost over €1,000. It&apos;s included with Featured.
                </p>
              </div>
              <div className="feature-feat">
                <h3>Found on Google</h3>
                <p>
                  Your search-optimized profile helps people searching for the
                  best bars in your city actually find you.
                </p>
              </div>
              <div className="feature-feat">
                <h3>Priority directory placement</h3>
                <p>
                  Stand out in our global directory used by travellers and
                  locals across 138 cities.
                </p>
              </div>
              <div className="feature-feat">
                <h3>A Featured badge</h3>
                <p>
                  Third-party credibility you can link to from your own site,
                  menu and reservations page.
                </p>
              </div>
              <div className="feature-feat">
                <h3>Social reach</h3>
                <p>
                  Add Instagram coverage to put your bar in front of our full
                  88,000+ follower audience.
                </p>
              </div>
              <div className="feature-feat">
                <h3>Unlimited updates</h3>
                <p>
                  New menu, new photos, new story? Update your profile any time
                  at no extra cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============= SEO PROSE ============= */}
        <section className="feature-section feature-prose-sec">
          <div className="feature-wrap feature-prose">
            <h2>How to promote your bar and get it featured</h2>
            <p>
              If you&apos;ve been searching for{' '}
              <strong>how to promote your bar</strong> or{' '}
              <strong>how to get your bar featured</strong>, the most effective
              move is also the simplest: get your bar covered by a publication
              the right people already read. Guests today discover where to drink
              the same way they discover everything else, they search Google,
              they scroll Instagram, and increasingly they ask an AI assistant
              for recommendations. To win those moments, your bar needs to show
              up with a credible, well-written story attached to it.
            </p>
            <p>
              That&apos;s exactly what a BarMagazine feature does. Instead of a
              thin listing, you get a real editorial article about your bar,
              your concept, your signature cocktails, your atmosphere, written
              and optimized so it ranks in search and gives you something worth
              sharing.
            </p>

            <h3>Why being featured beats advertising</h3>
            <p>
              Most bar marketing is rented attention: you pay for an ad, it
              runs, and the moment you stop paying it disappears. A feature
              article is different, it&apos;s an owned asset that keeps working.
              Here&apos;s why it&apos;s the smartest way to promote a bar:
            </p>
            <ul>
              <li>
                <strong>It ranks on Google.</strong> A search-optimized article
                means people looking for &quot;best cocktail bars in [your city]&quot;
                can actually find you.
              </li>
              <li>
                <strong>It builds trust.</strong> Third-party editorial coverage
                is far more persuasive than your own ads, it&apos;s social proof
                you can link to from your site, menu and reservations page.
              </li>
              <li>
                <strong>It reaches the right audience.</strong>{' '}
                BarMagazine&apos;s readers and 88,000+ Instagram followers are
                cocktail lovers and industry professionals, the exact people
                you want walking through your door.
              </li>
              <li>
                <strong>It compounds.</strong> The article keeps driving
                discovery long after launch, unlike a paid post that vanishes
                when the budget runs out.
              </li>
            </ul>

            <h3>What you get when you feature your bar</h3>
            <p>
              Every Featured bar receives a professionally written article
              (standalone articles cost over €1,000, it&apos;s included), an
              SEO-optimized profile page, priority placement in our global
              directory used by travellers and locals, a Featured badge, and
              the option to add Instagram coverage to put your bar in front of
              our full social audience.
            </p>

            <h3>How to get started today</h3>
            <p>
              Choose a plan below, complete checkout securely through Stripe,
              and fill in the short form telling us about your bar. We publish
              within a few days, no agency retainer, no long contracts, cancel
              anytime. It&apos;s the fastest, most affordable way to get your
              bar the coverage it deserves.
            </p>
          </div>
        </section>

        {/* ============= STATS ============= */}
        <section className="feature-section">
          <div className="feature-wrap">
            <div className="feature-sec-head">
              <span className="feature-eyebrow">The audience</span>
              <h2 className="feature-sec-title">Reach a global bar community</h2>
            </div>
            <div className="feature-stats">
              <div className="feature-stat"><b>88K+</b><span>Instagram followers</span></div>
              <div className="feature-stat"><b>1000+</b><span>Bars in directory</span></div>
              <div className="feature-stat"><b>138</b><span>Cities covered</span></div>
              <div className="feature-stat"><b>58</b><span>Countries</span></div>
            </div>
          </div>
        </section>

        {/* ============= PRICING ============= */}
        <section id="pricing" className="feature-section">
          <div className="feature-wrap">
            <div className="feature-promo-wrap">
              <span className="feature-promo-banner">
                🔥 Launch promotion · 50% off your first year
              </span>
            </div>
            <div className="feature-sec-head" style={{ marginBottom: 0 }}>
              <h2 className="feature-sec-title">Choose how you want to be featured</h2>
              <p className="feature-sec-intro">
                Start free, or get the full feature treatment for less than the
                price of a cocktail per month.
              </p>
            </div>

            <div className="feature-tiers">
              {/* Listed */}
              <div className="feature-tier">
                <h3>Listed</h3>
                <div className="feature-price"><span className="feature-now">Free</span></div>
                <div className="feature-billed">&nbsp;</div>
                <p className="feature-tag">Get your bar on the map.</p>
                <ul>
                  <li>Directory profile</li>
                  <li>Name, location &amp; bar type</li>
                  <li>1 interior photo</li>
                  <li>Website &amp; Instagram link</li>
                </ul>
                <a className="feature-btn feature-btn-outline" href="/add-your-bar">
                  Get Listed
                </a>
              </div>

              {/* Featured */}
              <div className="feature-tier feature-tier-featured">
                <span className="feature-badge">Most Popular</span>
                <h3>Featured</h3>
                <div className="feature-price">
                  <span className="feature-was">{sym}39</span>
                  <span className="feature-now">{sym}19.50</span>
                  <span className="feature-per">/mo</span>
                </div>
                <div className="feature-billed">
                  Billed annually {sym}468 → <strong>{sym}234/year</strong>
                </div>
                <span className="feature-save">Save {sym}234 in year one</span>
                <p className="feature-tag">
                  Stand out with editorial coverage and priority placement.
                </p>
                <ul>
                  <li>Everything in Listed</li>
                  <li>BarMagazine feature article</li>
                  <li>SEO-optimized profile page</li>
                  <li>Priority placement in directory</li>
                  <li>Multiple photos &amp; menu</li>
                  <li>Featured badge</li>
                  <li>Unlimited profile updates</li>
                </ul>
                <a
                  className="feature-btn feature-btn-primary"
                  href="/add-your-bar?plan=featured"
                >
                  Get Featured · 50% Off
                </a>
              </div>

              {/* Featured + Social */}
              <div className="feature-tier">
                <h3>Featured + Social</h3>
                <div className="feature-price">
                  <span className="feature-was">{sym}79</span>
                  <span className="feature-now">{sym}39.50</span>
                  <span className="feature-per">/mo</span>
                </div>
                <div className="feature-billed">
                  Billed annually {sym}948 → <strong>{sym}474/year</strong>
                </div>
                <span className="feature-save">Save {sym}474 in year one</span>
                <p className="feature-tag">
                  Maximum exposure across editorial and 88K+ social followers.
                </p>
                <ul>
                  <li>Everything in Featured</li>
                  <li>Instagram post or Reel</li>
                  <li>3 Instagram Stories</li>
                  <li>Cross-promotion collab</li>
                </ul>
                <a
                  className="feature-btn feature-btn-outline"
                  href="/add-your-bar?plan=featured_social"
                >
                  Get Started · 50% Off
                </a>
              </div>
            </div>
            <p className="feature-fineprint">
              Paid plans are billed annually and renew automatically at the
              standard rate after the promotional period. Cancel anytime via the
              Stripe Customer Portal or by emailing office@barmagazine.com. EU
              consumers have a 14-day right of withdrawal. Payments processed
              securely by Stripe.
            </p>
          </div>
        </section>

        {/* ============= URGENCY (green band) ============= */}
        <section className="feature-section feature-urgency">
          <div className="feature-wrap">
            <span className="feature-eyebrow">Don&apos;t get left off the list</span>
            <h2>
              The bars getting discovered are the ones getting written about.
            </h2>
            <p>
              Every week your bar isn&apos;t featured, your future guests are
              finding someone else. Lock in 50% off your first year and go live
              in days.
            </p>
            <a className="feature-btn feature-btn-onaccent" href="#pricing">
              Feature my bar
            </a>
          </div>
        </section>

        {/* ============= FAQ ============= */}
        <section className="feature-section">
          <div className="feature-wrap">
            <div className="feature-sec-head" style={{ marginBottom: 0 }}>
              <span className="feature-eyebrow">Questions</span>
              <h2 className="feature-sec-title">Frequently asked questions</h2>
            </div>
            <div className="feature-faq">
              <details open>
                <summary>How do I get my bar featured on BarMagazine?</summary>
                <p>
                  Choose a plan, fill out the short submission form with your
                  bar&apos;s details and photos, and complete payment securely
                  via Stripe. We publish your feature within a few days, no
                  meetings, no back-and-forth.
                </p>
              </details>
              <details>
                <summary>How can I promote my bar online?</summary>
                <p>
                  The fastest way to promote your bar online is to be featured
                  on a publication your future guests already read. A
                  BarMagazine feature gives you a professionally written,
                  SEO-optimized article that ranks in Google, a profile in our
                  global directory, and exposure to our 88,000+ Instagram
                  followers.
                </p>
              </details>
              <details>
                <summary>What does the feature article include?</summary>
                <p>
                  A professionally written article highlighting your bar&apos;s
                  story, signature cocktails and atmosphere, optimized for
                  search so new guests can find you. Standalone articles cost
                  over €1,000, it&apos;s included free with the Featured plan.
                </p>
              </details>
              <details>
                <summary>How much does it cost to feature my bar?</summary>
                <p>
                  Listing your bar is free. During our launch promotion,
                  Featured starts at {sym}19.50/month (billed annually,{' '}
                  {sym}234/year), and Featured + Social, which adds Instagram
                  coverage, starts at {sym}39.50/month (billed annually,{' '}
                  {sym}474/year).
                </p>
              </details>
              <details>
                <summary>What if my bar isn&apos;t listed yet?</summary>
                <p>
                  No problem, all plans start with the same submission form.
                  Tell us about your bar, choose your plan, and we&apos;ll
                  handle the rest.
                </p>
              </details>
              <details>
                <summary>Can I cancel my subscription?</summary>
                <p>
                  Yes. You can cancel anytime through the Stripe Customer
                  Portal or by contacting us at office@barmagazine.com.
                  There&apos;s also a 14-day cooling-off period after first
                  signup under EU consumer rights.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ============= FINAL CTA ============= */}
        <section className="feature-section feature-final">
          <div className="feature-wrap">
            <h2>Ready to get your bar discovered?</h2>
            <p>
              Lock in 50% off your first year and go live in days. Less than
              the price of a cocktail a month.
            </p>
            <a className="feature-btn feature-btn-primary" href="#pricing">
              Feature my bar now
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
