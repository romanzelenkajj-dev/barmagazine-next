import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BarMagazine',
  description: 'BarMagazine privacy policy — how we collect, use, and protect your data.',
  alternates: { canonical: 'https://barmagazine.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <div style={{ marginTop: 'var(--gap)', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 32 }}>
        Privacy Policy
      </h1>
      <div className="article-body" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '48px 40px' }}>
        <p>This Privacy Policy describes how BarMagazine (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares your personal information when you visit barmagazine.com (&quot;the Website&quot;).</p>

        <h2>Information We Collect</h2>
        <p>We may collect the following information when you use our Website:</p>
        <ul>
          <li>Usage data such as pages viewed, time spent on pages, and referring URLs</li>
          <li>Device information including browser type, operating system, and screen resolution</li>
          <li>IP address and approximate geographic location (used to display pricing in your local currency)</li>
          <li>Information you voluntarily provide when submitting forms, subscribing to a plan, or contacting us via email</li>
        </ul>

        <h2>Information Collected Through Subscriptions</h2>
        <p>When you purchase a subscription on BarMagazine, we collect:</p>
        <ul>
          <li>Your name and email address</li>
          <li>Billing information (processed and stored securely by Stripe — we do not have access to your full credit card number)</li>
          <li>Business information you provide about your bar (name, address, website, social media handles)</li>
        </ul>
        <p>This information is used to process your payment, manage your subscription, deliver the services included in your plan, and communicate with you about your account.</p>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Operate and improve our Website</li>
          <li>Process payments and manage subscriptions</li>
          <li>Deliver editorial services included in paid plans (feature articles, social media promotion)</li>
          <li>Respond to your inquiries and submissions</li>
          <li>Send transactional emails such as subscription confirmations, invoices, and renewal notices</li>
          <li>Analyze website traffic and usage patterns</li>
          <li>Send newsletters and updates if you have opted in</li>
        </ul>

        <h2>Payment Processing</h2>
        <p>We use <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe, Inc.</a> to process all payments. When you make a purchase, your payment information is transmitted directly to Stripe over an encrypted connection. We do not store, process, or have access to your full credit card details. Stripe&apos;s use of your personal information is governed by their <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>

        <h2>Cookies</h2>
        <p>Our Website uses cookies and similar tracking technologies to:</p>
        <ul>
          <li>Enhance your browsing experience</li>
          <li>Analyze traffic and usage patterns</li>
          <li>Detect your geographic location for displaying prices in the appropriate currency (this cookie does not track you across websites)</li>
        </ul>
        <p>You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of the Website.</p>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services that may collect and process data according to their own privacy policies:</p>
        <ul>
          <li><strong>Stripe</strong> — payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
          <li><strong>Vercel</strong> — website hosting (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
          <li><strong>Supabase</strong> — database services (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
          <li><strong>Resend</strong> — transactional email delivery (<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
        </ul>
        <p>We may also use analytics services such as Google Analytics to understand how our Website is used.</p>

        <h2>Data Sharing</h2>
        <p>We do not sell your personal information. We may share data with trusted service providers who assist us in operating our Website and delivering our services, provided they agree to keep your information confidential. We may also share information when required by law or to protect our legal rights.</p>

        <h2>Data Retention</h2>
        <p>We retain your personal information for as long as your account is active or as needed to provide you services. If you cancel your subscription, we retain your data for a reasonable period to comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data at any time by contacting us.</p>

        <h2>Your Rights</h2>
        <p>Under applicable data protection laws (including the EU General Data Protection Regulation), you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate or incomplete personal data</li>
          <li>Request deletion of your personal data</li>
          <li>Object to or restrict the processing of your personal data</li>
          <li>Request a copy of your data in a portable format</li>
          <li>Withdraw consent at any time where processing is based on consent</li>
        </ul>
        <p>To exercise any of these rights, please contact us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>. We will respond to your request within 30 days.</p>

        <h2>International Data Transfers</h2>
        <p>Your data may be processed in countries outside the European Economic Area (EEA) by our third-party service providers. Where this occurs, we ensure appropriate safeguards are in place in accordance with applicable data protection laws.</p>

        <h2>Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. If we make material changes, we will notify active subscribers by email.</p>

        <h2>Contact Us</h2>
        <p>If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>.</p>

        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--text-tertiary)' }}>Last updated: March 2026</p>
      </div>
    </div>
  );
}
