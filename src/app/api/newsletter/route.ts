import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('EMAIL');

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Build the form data for WordPress MC4WP
    const wpFormData = new URLSearchParams();
    wpFormData.set('_mc4wp_form_id', '84');
    wpFormData.set('_mc4wp_timestamp', String(Math.floor(Date.now() / 1000)));
    wpFormData.set('_mc4wp_honeypot', '');
    wpFormData.set('EMAIL', email);

    const res = await fetch(
      'https://romanzelenka-wjgek.wpcomstaging.com/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: wpFormData.toString(),
        redirect: 'manual', // Don't follow redirects
      }
    );

    // MC4WP typically redirects on success (302) or returns the page with a success message
    if (res.status === 302 || res.status === 301 || res.ok) {
      return NextResponse.json({ success: true });
    }

    // Try the REST API endpoint as fallback
    const wpFormData2 = new URLSearchParams();
    wpFormData2.set('_mc4wp_form_id', '84');
    wpFormData2.set('_mc4wp_timestamp', String(Math.floor(Date.now() / 1000)));
    wpFormData2.set('_mc4wp_honeypot', '');
    wpFormData2.set('EMAIL', email);

    const res2 = await fetch(
      'https://romanzelenka-wjgek.wpcomstaging.com/wp-json/mc4wp/v1/form',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: wpFormData2.toString(),
      }
    );

    if (res2.ok) {
      return NextResponse.json({ success: true });
    }

    const errorText = await res2.text().catch(() => '');
    return NextResponse.json(
      { error: errorText || 'Subscription failed' },
      { status: res2.status }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
