import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | BarMagazine',
  description: 'Terms and conditions for using the BarMagazine website.',
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

        <h2>User Submissions</h2>
        <p>By submitting content to BarMagazine (including bar submissions, event suggestions, or other communications), you grant us a non-exclusive, royalty-free right to use, publish, and distribute the submitted information in connection with our editorial activities.</p>

        <h2>Third-Party Links</h2>
        <p>The Website may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of external websites. Accessing linked sites is at your own risk.</p>

        <h2>Disclaimer</h2>
        <p>The content on the Website is provided for informational and entertainment purposes only. While we strive for accuracy, BarMagazine makes no warranties regarding the completeness or reliability of any information on the Website.</p>

        <h2>Limitation of Liability</h2>
        <p>BarMagazine shall not be liable for any damages arising from the use of or inability to use the Website, including but not limited to direct, indirect, incidental, or consequential damages.</p>

        <h2>Changes to These Terms</h2>
        <p>We reserve the right to modify these Terms of Use at any time. Continued use of the Website after changes constitutes acceptance of the updated terms.</p>

        <h2>Governing Law</h2>
        <p>These terms are governed by and construed in accordance with applicable law. Any disputes shall be subject to the exclusive jurisdiction of the relevant courts.</p>

        <h2>Contact Us</h2>
        <p>For questions about these Terms of Use, please contact us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>.</p>

        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--text-tertiary)' }}>Last updated: March 2026</p>
      </div>
    </div>
  );
}
