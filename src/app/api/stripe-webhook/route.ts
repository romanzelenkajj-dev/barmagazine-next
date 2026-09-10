import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { boundedNoStoreFetch } from '@/lib/bounded-fetch';
import { notifySubscriptionEvent } from '@/lib/notify';

export const dynamic = 'force-dynamic';

/**
 * Stripe webhook: subscription safety net.
 *
 * Featured is a paid product but tier flips are manual, so a lapsed
 * subscription used to be invisible until someone ran the audit by hand.
 * This endpoint FLAGS lapses the moment Stripe reports them - it emails the
 * notification mailbox and logs, and deliberately NEVER changes the tier:
 * a demotion is a human decision (some arrangements are intentional comps).
 *
 * Subscribed events: customer.subscription.updated and
 * customer.subscription.deleted. "Cancelled", "past_due" and "expired" are
 * all states of those two - deletion is the definitive end, and updated
 * carries status transitions plus cancel_at_period_end scheduling.
 *
 * Signature verification uses the raw request body; STRIPE_WEBHOOK_SECRET is
 * a Sensitive env var on Vercel.
 */

/** Subscription statuses that mean the payment behind a tier is in doubt. */
const FLAGGED_STATUSES = new Set(['past_due', 'unpaid', 'canceled', 'incomplete_expired', 'paused']);

function describeChange(event: Stripe.Event, sub: Stripe.Subscription): string | null {
  if (event.type === 'customer.subscription.deleted') return 'ended';

  if (event.type === 'customer.subscription.updated') {
    const prev = (event.data.previous_attributes || {}) as Partial<Stripe.Subscription>;
    // Only transitions INTO a flagged state notify - re-notifying on every
    // unrelated update of an already-flagged subscription would be noise.
    if ('status' in prev && FLAGGED_STATUSES.has(sub.status) && prev.status !== sub.status) {
      return sub.status.replace(/_/g, ' ');
    }
    // Early warning: the owner scheduled a cancellation; payment is still
    // fine today but the subscription will end at period close.
    if ('cancel_at_period_end' in prev && sub.cancel_at_period_end && !prev.cancel_at_period_end) {
      return 'cancellation scheduled at period end';
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    // Preview deployments have no webhook secret; Stripe only calls prod.
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'customer.subscription.updated' && event.type !== 'customer.subscription.deleted') {
    // Acknowledge anything else so Stripe doesn't retry it.
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const sub = event.data.object as Stripe.Subscription;
  const what = describeChange(event, sub);
  if (!what) return NextResponse.json({ received: true, flagged: false });

  const stripeBarName = (sub.metadata?.bar_name || '').trim();
  const plan = sub.metadata?.plan || null;
  // Top-level current_period_end on older API versions (what this account
  // pins today), on the subscription item in Basil and later.
  const periodEndTs =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items?.data?.[0]?.current_period_end ??
    null;
  const periodEnd = periodEndTs ? new Date(periodEndTs * 1000).toISOString().slice(0, 10) : null;

  // Best-effort match to a bars row by the checkout's bar_name metadata
  // (checkout stored it free-form, so trim + case-insensitive). A miss still
  // notifies - an unmatched lapse is MORE worth a look, not less.
  let matched: { name: string; slug: string; tier: string } | null = null;
  if (stripeBarName) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { global: { fetch: boundedNoStoreFetch } }
      );
      const { data } = await supabase
        .from('bars')
        .select('name, slug, tier')
        .ilike('name', stripeBarName)
        .limit(1);
      if (data?.[0]) matched = { name: String(data[0].name), slug: String(data[0].slug), tier: String(data[0].tier) };
    } catch (e) {
      console.error('[stripe-webhook] bar lookup failed:', e);
    }
  }

  console.warn(
    `[stripe-webhook] FLAG ${what}: sub=${sub.id} bar_name=${JSON.stringify(stripeBarName)} matched=${matched?.slug || 'none'} (tier untouched)`
  );
  await notifySubscriptionEvent({
    what,
    subscriptionId: sub.id,
    stripeBarName: stripeBarName || 'not set in metadata',
    plan,
    periodEnd,
    matched,
  });

  return NextResponse.json({ received: true, flagged: true });
}
