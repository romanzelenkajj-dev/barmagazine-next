import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | BarMagazine',
  description: 'Terms and conditions for using the BarMagazine website, including subscription terms.',
  alternates: { canonical: 'https://barmagazine.com/terms' },
};

export default function TermsPage() {
  return (
    <div style={{ marginTop: 'var(--gap)', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 32 }}>
        Terms of Use
      </h1>
      <div className="article-body" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '48px 40px' }}>
        <p>By accessing and using barmagazine.com (&quot;the Website&quot;), you agree to be bound by these Terms of Use. If you do not agree with these terms, please do not use the Website.</p>

        <h2>Intellectual Property</h2>
        <p>All content on the Website — including text, photographs, graphics, logos, and design — is owned by BarMagazine or its content creators and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or republish any content without our prior written consent.</p>

        <h2>Use of the Website</h2>
        <p>You agree to use the Website only for lawful purposes. You may not:</p>
        <ul>
          <li>Copy, modify, or distribute content without permission</li>
          <li>Use the Website to transmit harmful, offensive, or illegal material</li>
          <li>Attempt to gain unauthorized access to any part of the Website</li>
          <li>Use automated systems to extract data from the Website</li>
        </ul>

        <h2>Subscription Services</h2>
        <p>BarMagazine offers paid subscription plans (&quot;Featured&quot; and &quot;Featured + Social&quot;) for bar owners and managers who wish to enhance their listing on the Website. By purchasing a subscription, you agree to the following terms:</p>

        <h3>Plans and Pricing</h3>
        <p>Subscription plans and their current pricing are displayed on our <a href="/claim-your-bar">Claim Your Bar</a> page. Prices are listed in euros (€) for visitors within the European Union and in US dollars ($) for visitors outside the EU. The exact price you will be charged is confirmed at checkout before payment.</p>

        <h3>Billing and Auto-Renewal</h3>
        <p>All paid subscriptions are billed annually. Your subscription will automatically renew at the end of each billing period at the then-current price unless you cancel before the renewal date. You will be notified by email before each renewal.</p>

        <h3>Right of Withdrawal (14-Day Cooling-Off Period)</h3>
        <p>In accordance with the EU Consumer Rights Directive (2011/83/EU), if you are a consumer in the European Union, you have the right to withdraw from your subscription within 14 days of purchase without providing any reason. To exercise this right, contact us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a> with a clear statement of your decision to withdraw. Upon withdrawal, we will reimburse all payments received from you without undue delay and no later than 14 days from the day we are informed of your decision. If you have used the service during the withdrawal period, you may be charged a proportionate amount for the service provided up to the point of withdrawal.</p>

        <h3>Cancellation</h3>
        <p>You may cancel your subscription at any time through the Stripe Customer Portal (a link is provided in your subscription confirmation and renewal emails) or by contacting us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>. Upon cancellation:</p>
        <ul>
          <li>Your subscription will remain active until the end of the current billing period.</li>
          <li>No further charges will be made after cancellation.</li>
          <li>Your listing will revert to the free &quot;Listed&quot; tier at the end of the paid period.</li>
        </ul>

        <h3>Refunds</h3>
        <p>Outside of the 14-day withdrawal period, subscriptions are non-refundable. If you cancel mid-cycle, you will continue to have access to your paid features until the end of your current billing period. In exceptional circumstances, please contact us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a> and we will review your request on a case-by-case basis.</p>

        <h3>Payment Processing</h3>
        <p>All payments are processed securely by Stripe, Inc. BarMagazine does not store your credit card or payment details. By completing a purchase, you also agree to <a href="https://stripe.com/legal/end-users" target="_blank" rel="noopener noreferrer">Stripe&apos;s Terms of Service</a>.</p>

        <h2>Free Listings</h2>
        <p>Bar owners may submit their bar for a free listing through the Website. Free listings include basic profile information and are subject to editorial review. BarMagazine reserves the right to approve, modify, or remove any listing at its discretion.</p>

        <h2>User Submissions</h2>
        <p>By submitting content to BarMagazine (including bar submissions, event suggestions, or other communications), you grant us a non-exclusive, royalty-free right to use, publish, and distribute the submitted information in connection with our editorial activities.</p>

        <h2>Third-Party Links</h2>
        <p>The Website may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of external websites. Accessing linked sites is at your own risk.</p>

        <h2>Disclaimer</h2>
        <p>The content on the Website is provided for informational and entertainment purposes only. While we strive for accuracy, BarMagazine makes no warranties regarding the completeness or reliability of any information on the Website.</p>

        <h2>Limitation of Liability</h2>
        <p>BarMagazine shall not be liable for any damages arising from the use of or inability to use the Website, including but not limited to direct, indirect, incidental, or consequential damages.</p>

        <h2>Changes to These Terms</h2>
        <p>We reserve the right to modify these Terms of Use at any time. If we make material changes to subscription terms, we will notify active subscribers by email at least 30 days before the changes take effect. Continued use of the Website after changes constitutes acceptance of the updated terms.</p>

        <h2>Governing Law</h2>
        <p>These terms are governed by and construed in accordance with the laws of the Slovak Republic. For consumers within the European Union, mandatory consumer protection laws of your country of residence shall apply where they provide greater protection. Any disputes shall be subject to the exclusive jurisdiction of the courts of the Slovak Republic, without prejudice to your right to bring proceedings in the courts of your country of residence if you are an EU consumer.</p>

        <h2>Contact Us</h2>
        <p>For questions about these Terms of Use, subscription inquiries, or to exercise your right of withdrawal, please contact us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>.</p>

        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--text-tertiary)' }}>Last updated: March 2026</p>
      </div>
    </div>
  );
}
