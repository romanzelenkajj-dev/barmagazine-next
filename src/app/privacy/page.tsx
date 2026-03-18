import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BarMagazine',
  description: 'BarMagazine privacy policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div style={{ marginTop: 'var(--gap)', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 32 }}>
        Privacy Policy
      </h1>
      <div className="article-body" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '48px 40px' }}>
        <p>This Privacy Policy describes how BarMagazine (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares your personal information when you visit barmagazine.com.</p>

        <h2>Information We Collect</h2>
        <p>We may collect the following information when you use our website:</p>
        <ul>
          <li>Usage data such as pages viewed, time spent on pages, and referring URLs</li>
          <li>Device information including browser type, operating system, and screen resolution</li>
          <li>Information you voluntarily provide when submitting forms or contacting us via email</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Operate and improve our website</li>
          <li>Respond to your inquiries and submissions</li>
          <li>Analyze website traffic and usage patterns</li>
          <li>Send newsletters and updates if you have opted in</li>
        </ul>

        <h2>Cookies</h2>
        <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience and analyze traffic. You can control cookie preferences through your browser settings.</p>

        <h2>Third-Party Services</h2>
        <p>We may use third-party analytics and advertising services that collect and process data according to their own privacy policies. These may include Google Analytics and social media platforms.</p>

        <h2>Data Sharing</h2>
        <p>We do not sell your personal information. We may share data with trusted service providers who assist us in operating our website, provided they agree to keep your information confidential.</p>

        <h2>Your Rights</h2>
        <p>You have the right to access, correct, or request deletion of your personal data. To exercise these rights, please contact us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>.</p>

        <h2>Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.</p>

        <h2>Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>.</p>

        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--text-tertiary)' }}>Last updated: March 2026</p>
      </div>
    </div>
  );
}
