import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || '';
const MAILCHIMP_LIST_ID = '7857dc28c0';
const MAILCHIMP_DC = MAILCHIMP_API_KEY.split('-').pop(); // us22

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';

async function sendSignupNotification(subscriberEmail: string) {
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
        from: 'BarMagazine <onboarding@resend.dev>',
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
      console.error('Resend newsletter notification error:', err);
    } else {
      console.log('Newsletter signup notification sent for:', subscriberEmail);
    }
  } catch (e) {
    console.error('Failed to send newsletter signup notification:', e);
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
      // Send notification email — must await in serverless
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
