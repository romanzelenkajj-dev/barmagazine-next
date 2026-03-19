import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim & Upgrade Your Bar — BarMagazine',
  description: 'Claim your bar listing on BarMagazine. Choose from Free, Featured, or Premium tiers to boost your visibility.',
  robots: { index: false, follow: false },
};

const tiers = [
  {
    name: 'Free',
    price: 'Free',
    description: 'Basic listing in the BarMagazine directory.',
    features: [
      'Bar name & location',
      'Bar type & category',
      'Short description',
      'Link to your website',
    ],
    cta: 'Get Listed',
    ctaLink: '/add-your-bar',
    highlight: false,
  },
  {
    name: 'Featured',
    price: 'Contact Us',
    description: 'Stand out with enhanced visibility and editorial support.',
    features: [
      'Everything in Free',
      'Featured badge on listing',
      'Priority placement in search',
      'Photo gallery (up to 5 photos)',
      'Instagram & contact details',
      'Verified badge',
    ],
    cta: 'Get Featured',
    ctaLink: 'mailto:office@barmagazine.com?subject=Featured%20Listing%20Inquiry',
    highlight: true,
  },
  {
    name: 'Premium',
    price: 'Contact Us',
    description: 'Maximum exposure with premium branding and editorial features.',
    features: [
      'Everything in Featured',
      'Premium badge with gold accent',
      'Top placement in directory',
      'Extended photo gallery (up to 15)',
      'Full editorial article on BarMagazine',
      'Social media promotion',
      'Homepage feature rotation',
      'Detailed analytics & insights',
    ],
    cta: 'Go Premium',
    ctaLink: 'mailto:office@barmagazine.com?subject=Premium%20Listing%20Inquiry',
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
              <div className="claim-tier-price">{tier.price}</div>
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
            <h3>How do I claim my bar?</h3>
            <p>If your bar is already listed, email us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a> with your bar name and we&apos;ll verify your ownership and upgrade your listing.</p>
          </div>
          <div className="claim-faq-item">
            <h3>What if my bar isn&apos;t listed yet?</h3>
            <p>Use our <Link href="/add-your-bar">submission form</Link> to add your bar for free. You can then upgrade at any time.</p>
          </div>
          <div className="claim-faq-item">
            <h3>Can I cancel or downgrade?</h3>
            <p>Yes. Contact us anytime and we&apos;ll adjust your listing tier. No long-term commitments required.</p>
          </div>
          <div className="claim-faq-item">
            <h3>What does the editorial article include?</h3>
            <p>Premium listings receive a professionally written feature article on BarMagazine, highlighting your bar&apos;s story, cocktails, and atmosphere.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
