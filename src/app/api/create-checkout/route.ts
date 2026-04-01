import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const PRICE_MAP: Record<string, Record<string, string>> = {
  featured: {
    EUR: 'price_1TCh6XHjlgfQ8kMfqlPCWd0r',
    USD: 'price_1TCiwJHjlgfQ8kMflqM0kyOh',
  },
  featured_social: {
    EUR: 'price_1TCh6XHjlgfQ8kMfvvsdWbbv',
    USD: 'price_1TCiwJHjlgfQ8kMfX58joUqN',
  },
};

const COUPON_ID = 'raZGg4DL';

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);

  try {
    const body = await req.json();
    const { plan, currency, barName, email } = body as {
      plan: string;
      currency: string;
      barName?: string;
      email?: string;
    };

    const priceId = PRICE_MAP[plan]?.[currency] || PRICE_MAP[plan]?.['USD'];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: [{ coupon: COUPON_ID }],
      success_url: `${req.nextUrl.origin}/claim-your-bar?success=true`,
      cancel_url: `${req.nextUrl.origin}/add-your-bar?plan=${plan}`,
      subscription_data: {
        metadata: {
          bar_name: barName || '',
          plan,
        },
      },
    };

    if (email) {
      params.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout error';
    console.error('Stripe checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
