import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for barmagazine.com, including the bar directory, owner accounts, and paid services.',
  alternates: { canonical: 'https://barmagazine.com/terms' },
};

// Copy is the approved legal draft (claude/terms-of-service-draft.md),
// converted verbatim - no rewording here without a new draft.
export default function TermsPage() {
  return (
    <div style={{ marginTop: 'var(--gap)', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 32 }}>
        <strong>Last updated: September 2026</strong>
      </p>
      <div className="article-body" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '48px 40px' }}>
        <p>Welcome to BarMagazine. These Terms of Service govern your use of barmagazine.com, including the bar directory, owner accounts, and paid services. By using the website, claiming a listing, or purchasing a service, you agree to these terms.</p>

        <h2>1. Who we are</h2>
        <p>BarMagazine is a global bar and cocktail publication and directory. The website barmagazine.com is owned and operated by PRO PUBLISHING s.r.o., a company registered in the Slovak Republic (&quot;BarMagazine&quot;, &quot;we&quot;, &quot;us&quot;). BarMagazine operates internationally; certain services, including US invoicing and our social media programs, may be provided by our US affiliate BARMAGAZINE LLC (California). You can reach us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>.</p>

        <h2>2. Intellectual property</h2>
        <p>All editorial content on BarMagazine, including articles, bar descriptions, photography we produce or license, and the design of the website, is our property or used with permission, and is protected by copyright. You may not republish, scrape, or redistribute our content without written permission. Short quotations with attribution and a link are welcome.</p>

        <h2>3. The bar directory</h2>
        <p>The directory lists bars based on publicly available information, editorial research, and information provided by bar owners and their representatives. A listing in the directory does not imply any commercial relationship, and inclusion is at our editorial discretion.</p>
        <p>If you represent a listed bar and something is inaccurate, email <a href="mailto:office@barmagazine.com">office@barmagazine.com</a> and we will review and correct verified errors promptly. We may edit, decline, or remove any listing at any time, including where a venue closes, changes concept, or no longer fits the directory&apos;s editorial scope.</p>

        <h2>4. Owner accounts and claiming a listing</h2>
        <p>Bar owners and their authorized representatives can claim a listing to manage its details. By claiming a listing you confirm that you are authorized to represent that business. We may ask for verification, and we may reject or revoke a claim at any time, including where we believe a claim was made by someone without authority to represent the bar.</p>
        <p>You are responsible for the accuracy of information you submit through your account. We review owner submissions before publishing them and may decline changes that are inaccurate or inconsistent with our editorial standards.</p>

        <h2>5. Content you submit</h2>
        <p>When you submit content to BarMagazine, including photographs, business details, and text, you grant us a non-exclusive, royalty-free, worldwide right to use, publish, reproduce, and distribute that content on BarMagazine and in our related channels, including social media and newsletters, in connection with your listing and our coverage.</p>
        <p>You confirm that you own the content you submit or have the right to grant us this license, including for photographs taken by third parties. You keep ownership of your content, and you can ask us to remove content you submitted at any time by emailing <a href="mailto:office@barmagazine.com">office@barmagazine.com</a>.</p>
        <p>If you believe content on BarMagazine infringes your copyright, email <a href="mailto:office@barmagazine.com">office@barmagazine.com</a> with the URL, a description of the work, and your contact details, and we will review and respond promptly.</p>

        <h2>6. Paid services</h2>
        <p>BarMagazine offers paid services, including Featured and Featured + Social listing tiers, event promotion packages, and partner programs. Prices, inclusions, and billing terms are stated at the point of purchase or in a written agreement or invoice.</p>
        <p>Subscriptions bill automatically until cancelled. If you are a consumer in the EU, you have a 14-day withdrawal right from purchase; outside that window, and for business customers, payments are non-refundable, and cancelling mid-cycle keeps your service active until the end of the paid period. One-off services, such as event promotion packages, are delivered as described in the applicable offer and are non-refundable once delivery has begun. Payments are processed by third-party providers such as Stripe and Wise; we do not store your full payment details.</p>
        <p><strong>Paid services never buy editorial coverage.</strong> Our awards coverage, rankings, best-bars selections, and editorial articles are not for sale, and paid placements are always visibly labeled, for example &quot;In partnership with&quot; a named client. Purchasing a paid service does not affect whether or how a bar appears in our editorial selections.</p>

        <h2>7. Use of the website</h2>
        <p>You agree not to misuse the website, including by scraping or bulk-downloading directory data, attempting to access accounts that are not yours, submitting false claims or false information, or interfering with the operation of the site. We may suspend accounts and block access for misuse.</p>

        <h2>8. Third-party links</h2>
        <p>The website links to third-party sites, including bars&apos; own websites, social media, and booking platforms. We are not responsible for their content or practices.</p>

        <h2>9. Disclaimer</h2>
        <p>We work hard to keep directory information accurate, but bars change hours, menus, and status frequently. Information is provided &quot;as is&quot; without warranty. Always confirm details with the venue before visiting. Award and ranking information reflects the announcements of the relevant awards bodies at the time of publication.</p>

        <h2>10. Limitation of liability</h2>
        <p>To the fullest extent permitted by law, BarMagazine is not liable for indirect or consequential losses arising from your use of the website or reliance on directory information. Nothing in these terms limits liability that cannot be limited by law, and EU consumers keep all rights granted by mandatory consumer protection law.</p>

        <h2>11. Changes to these terms</h2>
        <p>We may update these terms from time to time. The &quot;last updated&quot; date at the top reflects the current version, and material changes to paid services will be communicated to affected customers by email.</p>

        <h2>12. Governing law</h2>
        <p>These terms are governed by the laws of the Slovak Republic, with EU consumers retaining the protection of mandatory provisions of the law of their country of residence.</p>

        <h2>13. Contact</h2>
        <p>PRO PUBLISHING s.r.o. &middot; <a href="mailto:office@barmagazine.com">office@barmagazine.com</a></p>
      </div>
    </div>
  );
}
