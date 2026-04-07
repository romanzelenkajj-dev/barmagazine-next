'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Stripe payment links (kept for future automated flow)
// EUR: Featured https://buy.stripe.com/4gM28r1TSaCz9CYfOLaAw00
// EUR: Featured+Social https://buy.stripe.com/7sYeVd2XWaCzdTe5a7aAw01
// USD: Featured https://buy.stripe.com/cNieVdbuseSPeXi463aAw03
// USD: Featured+Social https://buy.stripe.com/14A28r564cKH7uQ31ZaAw02

// Stripe coupon ID for 50% off first year: raZGg4DL

function getTiers(isEU: boolean) {
  const symbol = isEU ? '€' : '$';

  return [
    {
      name: 'Listed',
      monthlyPrice: null,
      originalMonthlyPrice: null,
      annualPrice: null,
      originalAnnualPrice: null,
      priceLabel: 'Free',
      description: 'Get your bar on the map.',
      savingsLabel: null,
      features: [
        'Directory profile',
        'Name, location & bar type',
        '1 interior photo',
        'Website & Instagram link',
      ],
      cta: 'Get Listed',
      ctaLink: '/add-your-bar',
      highlight: false,
    },
    {
      name: 'Featured',
      monthlyPrice: `${symbol}19.50`,
      originalMonthlyPrice: `${symbol}39`,
      annualPrice: `${symbol}234/year`,
      originalAnnualPrice: `${symbol}468`,
      priceLabel: null,
      description: 'Stand out with editorial coverage and priority placement.',
      savingsLabel: `Save ${symbol}234 in year one`,
      features: [
        'Everything in Listed',
        'BarMagazine feature article',
        'SEO-optimized profile page',
        'Priority placement in directory',
        'Multiple photos & menu',
        'Featured badge',
        'Unlimited profile updates',
      ],
      cta: 'Get Featured — 50% Off',
      ctaLink: '/add-your-bar?plan=featured',
      highlight: true,
    },
    {
      name: 'Featured + Social',
      monthlyPrice: `${symbol}39.50`,
      originalMonthlyPrice: `${symbol}79`,
      annualPrice: `${symbol}474/year`,
      originalAnnualPrice: `${symbol}948`,
      priceLabel: null,
      description: 'Maximum exposure across editorial and 88K+ social followers.',
      savingsLabel: `Save ${symbol}474 in year one`,
      features: [
        'Everything in Featured',
        'Instagram post or Reel',
        '3 Instagram Stories',
        'Cross-promotion collab',
      ],
      cta: 'Get Started — 50% Off',
      ctaLink: '/add-your-bar?plan=featured_social',
      highlight: false,
    },
  ];
}

function getCurrencyFromCookie(): boolean | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )geo_currency=([^;]*)/);
  if (!match) return null;
  return match[1] === 'EUR';
}

export default function ClaimYourBarPage() {
  const cookieEU = getCurrencyFromCookie();
  const [isEU, setIsEU] = useState(cookieEU ?? true);
  const [loaded, setLoaded] = useState(cookieEU !== null);

  useEffect(() => {
    if (loaded) return;
    fetch('/api/geo')
      .then((r) => r.json())
      .then((data) => {
        setIsEU(data.isEU);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [loaded]);

  const tiers = getTiers(isEU);

  return (
    <div className="claim-page">
      {/* Promo banner */}
      <div className="claim-promo-banner">
        <span>🔥 Launch Special — 50% Off Your First Year</span>
        <span className="claim-promo-banner-tag">Limited Time Offer</span>
      </div>

      <div className="claim-hero">
        <div className="claim-hero-badge">Launch Promotion — 50% Off First Year</div>
        <h1>Get Your Bar <span className="claim-hero-highlight">Featured</span><br />for Less than the Price of a Cocktail</h1>
        <p>
          For a limited time, put your bar in front of thousands of cocktail enthusiasts
          and industry professionals — starting at just €19.50/month.
        </p>
      </div>

      <div className="claim-tiers">
        {tiers.map((tier) => (
          <div key={tier.name} className={`claim-tier${tier.highlight ? ' claim-tier--highlight' : ''}`}>
            {tier.highlight && <div className="claim-tier-popular">Most Popular</div>}
            <div className="claim-tier-header">
              <h2>{tier.name}</h2>
              {tier.monthlyPrice ? (
                <div className="claim-tier-pricing">
                  <div className="claim-tier-price-row">
                    <span className="claim-tier-price-original">{tier.originalMonthlyPrice}</span>
                    <span className="claim-tier-price">{tier.monthlyPrice}<span className="claim-tier-price-period">/mo</span></span>
                  </div>
                  <div className="claim-tier-annual">
                    Billed annually <span className="claim-tier-annual-original">{tier.originalAnnualPrice}</span> → <strong>{tier.annualPrice}</strong>
                  </div>
                  {tier.savingsLabel && (
                    <div className="claim-tier-savings">{tier.savingsLabel}</div>
                  )}
                </div>
              ) : (
                <div className="claim-tier-pricing">
                  <div className="claim-tier-price">{tier.priceLabel}</div>
                </div>
              )}
              <p>{tier.description}</p>
            </div>
            <ul className="claim-tier-features">
              {tier.features.map((feature, i) => (
                <li key={i}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            {tier.ctaLink.startsWith('/') ? (
              <Link href={tier.ctaLink} className={`claim-tier-cta${tier.highlight ? ' claim-tier-cta--primary' : tier.name === 'Featured + Social' ? ' claim-tier-cta--dark' : ''}`}>
                {tier.cta}
              </Link>
            ) : (
              <a href={tier.ctaLink} target="_blank" rel="noopener noreferrer" className={`claim-tier-cta${tier.highlight ? ' claim-tier-cta--primary' : ''}`}>
                {tier.cta}
              </a>
            )}
            {tier.originalMonthlyPrice && (
              <p className="claim-tier-footnote">50% off applies to first year. Renews at {tier.originalMonthlyPrice}/mo.</p>
            )}
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="claim-stats-bar">
        <div className="claim-stat">
          <div className="claim-stat-number">88K+</div>
          <div className="claim-stat-label">Instagram followers</div>
        </div>
        <div className="claim-stat">
          <div className="claim-stat-number">140</div>
          <div className="claim-stat-label">Cities</div>
        </div>
        <div className="claim-stat">
          <div className="claim-stat-number">987+</div>
          <div className="claim-stat-label">Bars in directory</div>
        </div>
        <div className="claim-stat">
          <div className="claim-stat-number">58</div>
          <div className="claim-stat-label">Countries covered</div>
        </div>
      </div>

      <div className="claim-legal-notice">
        <p>Paid plans are billed annually and renew automatically at the standard rate after the promotional period. You can cancel anytime through the Stripe Customer Portal or by emailing <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>. EU consumers have a 14-day right of withdrawal after purchase. All payments are processed securely by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe</a>. By subscribing, you agree to our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
      </div>

      <div className="claim-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="claim-faq-grid">
          <div className="claim-faq-item">
            <h3>How does the 50% discount work?</h3>
            <p>You pay half price for your entire first year. After 12 months, your subscription renews at the standard rate. You can cancel anytime through your account portal.</p>
          </div>
          <div className="claim-faq-item">
            <h3>How do I get started?</h3>
            <p>Click your preferred plan, fill out the form with your bar details, and for paid plans you&apos;ll be redirected to complete payment via Stripe. We&apos;ll have everything set up within a few days.</p>
          </div>
          <div className="claim-faq-item">
            <h3>What does the feature article include?</h3>
            <p>A professionally written article on BarMagazine highlighting your bar&apos;s story, cocktails, and atmosphere — optimized for search so new guests can find you. Standalone articles cost over €1,000 — it&apos;s included free with Featured.</p>
          </div>
          <div className="claim-faq-item">
            <h3>What if my bar isn&apos;t listed yet?</h3>
            <p>No problem — all plans start with the same <Link href="/add-your-bar">submission form</Link>. Tell us about your bar and choose your plan. We&apos;ll handle the rest.</p>
          </div>
          <div className="claim-faq-item">
            <h3>Can I cancel my subscription?</h3>
            <p>Yes. You can cancel anytime through the Stripe Customer Portal or by contacting us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>. There&apos;s also a 14-day cooling-off period after first signup under EU consumer rights.</p>
          </div>
          <div className="claim-faq-item">
            <h3>How long is this offer available?</h3>
            <p>This is a limited launch promotion. Once the promotion ends, new subscribers will pay the standard rate. Lock in 50% off now and keep the discount for your full first year.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
