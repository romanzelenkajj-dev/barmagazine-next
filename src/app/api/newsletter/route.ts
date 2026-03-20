import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || '';
const MAILCHIMP_LIST_ID = '7857dc28c0';
const MAILCHIMP_DC = MAILCHIMP_API_KEY.split('-').pop(); // us22

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

