import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim & Upgrade Your Bar — BarMagazine',
  description: 'Claim your bar listing on BarMagazine. Choose from Listed (Free), Featured, or Featured + Social tiers to boost your visibility.',
  robots: { index: false, follow: false },
};

const tiers = [
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
    monthlyPrice: '€39',
    annualPrice: '€468',
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
    ctaLink: 'mailto:office@barmagazine.com?subject=Featured%20Listing%20Inquiry',
    highlight: true,
  },
  {
    name: 'Featured + Social',
    monthlyPrice: '€79',
    annualPrice: '€948',
    priceLabel: null,
    description: 'Maximum exposure across editorial and social channels.',
    features: [
      'Everything in Featured',
      'Instagram post or Reel',
      '3 Instagram Stories',
      'Cross-promotion collab',
    ],
    cta: 'Get Started',
    ctaLink: 'mailto:office@barmagazine.com?subject=Featured%20%2B%20Social%20Listing%20Inquiry',
    highlight: false,
  },
];

export default function ClaimYourBarPage() {
  return (
    <div className="claim-page">
      <div className="claim-hero">
        <div className="claim-hero-badge">For Bar Owners & Managers</div>
        <h1>Elevate Your Bar&apos;s Presence</h1>
        <p>
          BarMagazine reaches thousands of cocktail enthusiasts and industry professionals monthly.
          Choose the right plan to maximize your bar&apos;s visibility.
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
            {tier.ctaLink.startsWith('mailto:') ? (
              <a href={tier.ctaLink} className={`claim-tier-cta${tier.highlight ? ' claim-tier-cta--primary' : ''}`}>
                {tier.cta}
              </a>
            ) : (
              <Link href={tier.ctaLink} className={`claim-tier-cta${tier.highlight ? ' claim-tier-cta--primary' : ''}`}>
                {tier.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="claim-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="claim-faq-grid">
          <div className="claim-faq-item">
            <h3>How do I get started?</h3>
            <p>Click &apos;Get Featured&apos; or &apos;Get Started&apos; and we&apos;ll reach out within 24 hours to set everything up. Already listed? We&apos;ll upgrade your existing profile.</p>
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
        </div>
      </div>
    </div>
  );
}
