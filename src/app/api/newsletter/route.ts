import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || '';
const MAILCHIMP_LIST_ID = '7857dc28c0';
const MAILCHIMP_DC = MAILCHIMP_API_KEY.split('-').pop(); // us22

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';

const WELCOME_EMAIL_HTML = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to BarMagazine</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #F5F0E8; font-family: 'Inter', Arial, sans-serif; color: #1A1A1A; -webkit-font-smoothing: antialiased; }
    .email-wrapper { background-color: #F5F0E8; padding: 40px 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .email-header { background-color: #1A1A1A; padding: 32px 48px; text-align: center; }
    .email-header img { height: 28px; width: auto; display: inline-block; }
    .email-hero { background-color: #1A1A1A; padding: 0 48px 48px; text-align: center; border-bottom: 3px solid #C85A2A; }
    .email-hero h1 { font-family: 'Inter', Arial, sans-serif; font-size: 36px; font-weight: 700; color: #F5F0E8; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.5px; }
    .email-hero p { font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #A89880; line-height: 1.6; max-width: 420px; margin: 0 auto; }
    .email-body { padding: 48px; background-color: #FFFFFF; }
    .email-body p { font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #333333; line-height: 1.7; margin-bottom: 20px; }
    .expect-section { background-color: #F5F0E8; border-left: 3px solid #C85A2A; padding: 24px 28px; margin: 32px 0; }
    .expect-section h2 { font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #1A1A1A; margin-bottom: 16px; letter-spacing: 1px; text-transform: uppercase; }
    .expect-item { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .expect-item:last-child { margin-bottom: 0; }
    .expect-dot { width: 6px; height: 6px; background-color: #C85A2A; border-radius: 50%; margin-top: 8px; margin-right: 12px; flex-shrink: 0; }
    .expect-item p { font-size: 15px; color: #444444; line-height: 1.5; margin-bottom: 0; }
    .cta-wrapper { text-align: center; margin: 36px 0; }
    .cta-button { display: inline-block; background-color: #C85A2A; color: #FFFFFF !important; font-family: 'Inter', Arial, sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; text-decoration: none; padding: 14px 36px; }
    .divider { border: none; border-top: 1px solid #E8E0D4; margin: 32px 0; }
    .email-footer { background-color: #1A1A1A; padding: 32px 48px; text-align: center; }
    .email-footer p { font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 8px; }
    .email-footer a { color: #A89880; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-header { padding: 24px 24px; }
      .email-hero { padding: 0 24px 36px; }
      .email-hero h1 { font-size: 28px; }
      .email-body { padding: 32px 24px; }
      .email-footer { padding: 24px 24px; }
      .expect-section { padding: 20px 20px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <img src="https://barmagazine.com/logo-white.png" alt="BarMagazine" width="164" height="29" />
      </div>
      <div class="email-hero">
        <h1>Welcome to<br>BarMagazine</h1>
        <p>The essential read for bar professionals, bartenders, and cocktail culture enthusiasts worldwide.</p>
      </div>
      <div class="email-body">
        <p>Thank you for subscribing. You're now part of a community of bar owners, bartenders, and industry professionals who rely on BarMagazine for the stories that matter.</p>
        <div class="expect-section">
          <h2>What to expect</h2>
          <div class="expect-item">
            <div class="expect-dot"></div>
            <p><strong>Bar profiles &amp; spotlights</strong> — In-depth features on the world's most influential bars</p>
          </div>
          <div class="expect-item">
            <div class="expect-dot"></div>
            <p><strong>Industry news &amp; awards</strong> — Coverage of competitions, openings, and the people shaping the industry</p>
          </div>
          <div class="expect-item">
            <div class="expect-dot"></div>
            <p><strong>Cocktail culture</strong> — Trends, techniques, and the stories behind the drinks</p>
          </div>
          <div class="expect-item">
            <div class="expect-dot"></div>
            <p><strong>Bar directory</strong> — Discover and explore exceptional bars around the world</p>
          </div>
        </div>
        <p>In the meantime, explore the latest from the bar world on our website.</p>
        <div class="cta-wrapper">
          <a href="https://barmagazine.com" class="cta-button">Read BarMagazine</a>
        </div>
        <hr class="divider" />
        <p style="font-size: 14px; color: #888888; text-align: center; margin-bottom: 0;">
          Is your bar listed in our directory?<br>
          <a href="https://barmagazine.com/add-your-bar" style="color: #C85A2A; text-decoration: none; font-weight: 600;">Add your bar for free &rarr;</a>
        </p>
      </div>
      <div class="email-footer">
        <p>You're receiving this because you subscribed at BarMagazine.com</p>
        <p style="margin-top: 12px; font-size: 12px; color: #444444;">BarMagazine &middot; barmagazine.com</p>
      </div>
    </div>
  </div>
</body>
</html>`;

async function sendWelcomeEmail(subscriberEmail: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set — skipping welcome email');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BarMagazine <newsletter@barmagazine.com>',
        to: [subscriberEmail],
        subject: 'Welcome to BarMagazine',
        html: WELCOME_EMAIL_HTML,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend welcome email error:', err);
    } else {
      console.log('Welcome email sent to:', subscriberEmail);
    }
  } catch (e) {
    console.error('Failed to send welcome email:', e);
  }
}

async function sendSignupNotification(subscriberEmail: string): Promise<void> {
  if (!RESEND_API_KEY || !NOTIFICATION_EMAIL) {
    console.log('Resend not configured — skipping newsletter signup notification');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BarMagazine <newsletter@barmagazine.com>',
        to: [NOTIFICATION_EMAIL],
        subject: `New Newsletter Subscriber: ${subscriberEmail}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A1A1A;">New Newsletter Subscriber</h2>
            <p style="font-size: 16px; color: #333;">
              <strong>${subscriberEmail}</strong> just subscribed to the BarMagazine newsletter.
            </p>
            <p style="margin-top: 24px; font-size: 13px; color: #999;">This notification was sent from barmagazine.com</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend notification error:', err);
    } else {
      console.log('Signup notification sent for:', subscriberEmail);
    }
  } catch (e) {
    console.error('Failed to send signup notification:', e);
  }
}

export async function POST(request: NextRequest) {
  if (!MAILCHIMP_API_KEY) {
    console.error('MAILCHIMP_API_KEY environment variable is not set');
    return NextResponse.json(
      { error: 'Newsletter service is not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const subscriberHash = crypto
      .createHash('md5')
      .update(email)
      .digest('hex');

    // Use Mailchimp Marketing API v3 — PUT to add or update subscriber
    const url = `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Only send welcome email to genuinely new subscribers (not re-subscriptions)
      const isNew = data.status === 'subscribed' && !data.last_changed;
      if (isNew || data.stats?.avg_open_rate === 0) {
        await sendWelcomeEmail(email);
      }
      // Always send internal notification
      await sendSignupNotification(email);
      return NextResponse.json({ success: true });
    }

    // Handle specific Mailchimp errors
    if (data.title === 'Member Exists') {
      return NextResponse.json({ success: true }); // Already subscribed is fine
    }

    if (data.title === 'Invalid Resource') {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    console.error('Mailchimp API error:', data);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
