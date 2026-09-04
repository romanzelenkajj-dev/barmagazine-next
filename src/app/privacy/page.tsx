import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What personal data BarMagazine collects, why, and what your rights are.',
  alternates: { canonical: 'https://barmagazine.com/privacy' },
};

// Copy is the approved legal draft (claude/privacy-policy-draft.md),
// converted verbatim - no rewording here without a new draft.
export default function PrivacyPage() {
  return (
    <div style={{ marginTop: 'var(--gap)', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 32 }}>
        <strong>Last updated: September 2026</strong>
      </p>
      <div className="article-body" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '48px 40px' }}>
        <p>This policy explains what personal data BarMagazine collects, why, and what your rights are. The data controller is PRO PUBLISHING s.r.o., a company registered in the Slovak Republic, reachable at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>. It covers barmagazine.com, the bar directory, owner accounts, and our emails.</p>

        <h2>1. What we collect</h2>
        <p><strong>Visitors.</strong> We collect standard usage data: pages viewed, approximate location, device and browser type, and referrer. Our primary analytics (Vercel Web Analytics) works without cookies and does not track you across sites. We also use Google Analytics for aggregate traffic measurement. A currency cookie may remember your region so prices display correctly.</p>
        <p><strong>Bar owners and representatives.</strong> When you claim a listing or create an account, we collect your name, email address, and the business information you submit, including photos, hours, and contact details. Sign-in uses email links, so we never store a password for you.</p>
        <p><strong>Business contact information.</strong> The directory contains business information about bars, including publicly available business email addresses and phone numbers, gathered from public sources or provided by the venues themselves.</p>
        <p><strong>Customers.</strong> If you purchase a paid service, billing is handled by our payment providers (Stripe, Wise). We receive confirmation of payment and your business billing details, never your full card number.</p>

        <h2>2. How we use it</h2>
        <p>We use this data to operate the directory, let owners manage their listings, review and publish submissions, deliver paid services, measure site traffic, and communicate with you. We do not sell personal data, and we do not use advertising trackers.</p>

        <h2>3. Email</h2>
        <p><strong>Transactional email.</strong> We send emails you need to use the service: claim verification links, submission confirmations, invoices, and renewal notices.</p>
        <p><strong>Newsletter.</strong> We send our newsletter only to people who have opted in, for example by ticking the newsletter box when claiming a listing or subscribing on the site. Consent is never pre-ticked, every newsletter contains an unsubscribe link, and unsubscribing takes effect immediately.</p>
        <p><strong>Business outreach.</strong> As a trade publication, we occasionally email bars at their business addresses about their listing on BarMagazine, for example to let a bar know it has been listed or to offer listing services. We send these to business contact addresses on the basis of our legitimate interest in operating a trade directory, we keep them relevant and infrequent, and every such email includes a way to opt out. If you opt out, we will not email that address again.</p>

        <h2>4. Who processes your data</h2>
        <p>We use a small set of service providers to run the site: Vercel (hosting and analytics), Supabase (database and authentication), Resend (email delivery), Stripe and Wise (payments), and Google Analytics (traffic measurement). Each processes data under its own terms and only as needed to provide its service to us. Some providers process data in the United States; where EU data is transferred, our providers rely on standard contractual clauses or equivalent safeguards.</p>

        <h2>5. How long we keep it</h2>
        <p>Account data is kept while your account is active. Directory business information is kept while the listing is live. Analytics data is kept in aggregate form. Billing records are kept as long as tax law requires. If you close your account, we delete your personal data within 30 days, except what we must keep for legal reasons.</p>

        <h2>6. Your rights</h2>
        <p>You can ask us at any time to access, correct, delete, or export your personal data, to object to processing, or to withdraw consent where processing is based on consent, including unsubscribing from any email. If you are in the EU or UK, these are your rights under the GDPR, and you can also complain to your local data protection authority. Email <a href="mailto:office@barmagazine.com">office@barmagazine.com</a> and we will respond within 30 days.</p>
        <p>If you represent a bar and want your listing&apos;s business information corrected or removed, the same address works, and corrections from verified owners are prioritized.</p>

        <h2>7. Children</h2>
        <p>BarMagazine covers the drinks trade and is not directed at anyone under the legal drinking age of their country.</p>

        <h2>8. Changes</h2>
        <p>We may update this policy as the service evolves. The date at the top reflects the current version, and material changes will be announced on the site or by email.</p>
      </div>
    </div>
  );
}
