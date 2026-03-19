'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// EUR payment links (EU visitors)
const EUR_LINKS = {
  featured: 'https://buy.stripe.com/4gM28r1TSaCz9CYfOLaAw00',
  featuredSocial: 'https://buy.stripe.com/7sYeVd2XWaCzdTe5a7aAw01',
};

// USD payment links (rest of world)
const USD_LINKS = {
  featured: 'https://buy.stripe.com/cNieVdbuseSPeXi463aAw03',
  featuredSocial: 'https://buy.stripe.com/14A28r564cKH7uQ31ZaAw02',
};

function getTiers(isEU: boolean) {
  const symbol = isEU ? '€' : '$';
  const links = isEU ? EUR_LINKS : USD_LINKS;

  return [
    {
      name: 'Listed',
      monthlyPrice: null,
      annualPrice: null,
      priceLabel: 'Free',
      description: 'Get your bar on the map.',
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
      monthlyPrice: `${symbol}39`,
      annualPrice: `${symbol}468`,
      priceLabel: null,
      description: 'Stand out with editorial coverage and priority placement.',
      features: [
        'Everything in Listed',
        'BarMagazine feature article',
        'SEO-optimized profile page',
        'Priority placement in directory',
        'Multiple photos & menu',
        'Featured badge',
        'Unlimited profile updates',
      ],
      cta: 'Get Featured',
      ctaLink: links.featured,
      highlight: true,
    },
    {
      name: 'Featured + Social',
      monthlyPrice: `${symbol}79`,
      annualPrice: `${symbol}948`,
      priceLabel: null,
      description: 'Maximum exposure across editorial and social channels.',
      features: [
        'Everything in Featured',
        'Instagram post or Reel',
        '3 Instagram Stories',
        'Cross-promotion collab',
      ],
      cta: 'Get Started',
      ctaLink: links.featuredSocial,
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
    if (loaded) return; // cookie was available, no need to fetch
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
      <div className="claim-hero">
        <div className="claim-hero-badge">For Bar Owners &amp; Managers</div>
        <h1>Elevate Your Bar&apos;s Presence</h1>
        <p>
          BarMagazine reaches thousands of cocktail enthusiasts and industry professionals monthly.
          Choose the right plan to maximize your bar&apos;s visibility.
        </p>
      </div>

      <div className={`claim-tiers${loaded ? '' : ' claim-tiers--loading'}`}>
        {tiers.map((tier) => (
          <div key={tier.name} className={`claim-tier${tier.highlight ? ' claim-tier--highlight' : ''}`}>
            {tier.highlight && <div className="claim-tier-popular">Most Popular</div>}
            <div className="claim-tier-header">
              <h2>{tier.name}</h2>
              {tier.monthlyPrice ? (
                <div className="claim-tier-pricing">
                  <div className="claim-tier-price">
                    {tier.monthlyPrice}<span className="claim-tier-price-period">/mo</span>
                  </div>
                  <div className="claim-tier-annual">
                    Billed annually {tier.annualPrice}
                  </div>
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
              <Link href={tier.ctaLink} className={`claim-tier-cta${tier.highlight ? ' claim-tier-cta--primary' : ''}`}>
                {tier.cta}
              </Link>
            ) : (
              <a href={tier.ctaLink} target="_blank" rel="noopener noreferrer" className={`claim-tier-cta${tier.highlight ? ' claim-tier-cta--primary' : ''}`}>
                {tier.cta}
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="claim-legal-notice">
        <p>Paid plans are billed annually and renew automatically. You can cancel anytime through the Stripe Customer Portal or by emailing <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>. EU consumers have a 14-day right of withdrawal after purchase. All payments are processed securely by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe</a>. By subscribing, you agree to our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
      </div>

      <div className="claim-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="claim-faq-grid">
          <div className="claim-faq-item">
            <h3>How do I get started?</h3>
            <p>Click &apos;Get Featured&apos; or &apos;Get Started&apos; to complete your subscription. Once payment is confirmed, we&apos;ll reach out within 24 hours to set everything up. Already listed? We&apos;ll upgrade your existing profile.</p>
          </div>
          <div className="claim-faq-item">
            <h3>What if my bar isn&apos;t listed yet?</h3>
            <p>No problem. Use our <Link href="/add-your-bar">submission form</Link> to add your bar for free, or go straight to a paid tier and we&apos;ll create your profile for you.</p>
          </div>
          <div className="claim-faq-item">
            <h3>How long until my listing is live?</h3>
            <p>Free listings go live within 48 hours. Featured and Featured + Social listings include a feature article — we&apos;ll have everything published within 2 weeks.</p>
          </div>
          <div className="claim-faq-item">
            <h3>What does the feature article include?</h3>
            <p>A professionally written article on BarMagazine highlighting your bar&apos;s story, cocktails, and atmosphere — optimized for search so new guests can find you.</p>
          </div>
          <div className="claim-faq-item">
            <h3>Can I cancel my subscription?</h3>
            <p>Yes. You can cancel anytime through the Stripe Customer Portal (linked in your confirmation email) or by contacting us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>. Your paid features will remain active until the end of your billing period.</p>
          </div>
          <div className="claim-faq-item">
            <h3>What is the refund policy?</h3>
            <p>EU consumers have a 14-day right of withdrawal after purchase. Outside of this period, subscriptions are non-refundable but remain active until the end of your billing cycle. For exceptional cases, contact us and we&apos;ll review your request.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
