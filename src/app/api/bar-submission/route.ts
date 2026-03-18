import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (bypasses RLS)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = serviceKey
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
  : null;

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'office@barmagazine.com';

async function sendNotificationEmail(data: Record<string, string | undefined>) {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured — skipping email notification');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BarMagazine <notifications@barmagazine.com>',
        to: [NOTIFICATION_EMAIL],
        subject: `New Bar Submission: ${data.name} — ${data.city}, ${data.country}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A1A1A;">New Bar Submission</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #666; width: 140px;">Bar Name</td><td style="padding: 8px 12px;">${data.name}</td></tr>
              <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">City</td><td style="padding: 8px 12px;">${data.city}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Country</td><td style="padding: 8px 12px;">${data.country}</td></tr>
              ${data.address ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Address</td><td style="padding: 8px 12px;">${data.address}</td></tr>` : ''}
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Type</td><td style="padding: 8px 12px;">${data.type || 'Cocktail Bar'}</td></tr>
              ${data.website ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Website</td><td style="padding: 8px 12px;"><a href="${data.website}">${data.website}</a></td></tr>` : ''}
              ${data.instagram ? `<tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Instagram</td><td style="padding: 8px 12px;">${data.instagram}</td></tr>` : ''}
              <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Contact Name</td><td style="padding: 8px 12px;">${data.contact_name || '—'}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Contact Email</td><td style="padding: 8px 12px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
              ${data.phone ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Phone</td><td style="padding: 8px 12px;">${data.phone}</td></tr>` : ''}
              ${data.description ? `<tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Description</td><td style="padding: 8px 12px;">${data.description}</td></tr>` : ''}
            </table>
            <p style="margin-top: 24px; font-size: 13px; color: #999;">This notification was sent from barmagazine.com</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend email error:', err);
    } else {
      console.log('Notification email sent to', NOTIFICATION_EMAIL);
    }
  } catch (e) {
    console.error('Failed to send notification email:', e);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.city || !data.country || !data.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email notification (non-blocking — don't let email failure block the submission)
    sendNotificationEmail(data);

    // Insert into Supabase using service role key
    if (!supabaseAdmin) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      // Fallback: log the submission — it will be visible in Vercel logs
      console.log('BAR_SUBMISSION:', JSON.stringify(data));
      return NextResponse.json({ success: true, note: 'Submission logged, database save pending env setup' });
    }

    const { data: submission, error } = await supabaseAdmin
      .from('bar_submissions')
      .insert({
        name: data.name,
        city: data.city,
        country: data.country,
        address: data.address || null,
        type: data.type || 'Cocktail Bar',
        website: data.website || null,
        instagram: data.instagram || null,
        email: data.email,
        phone: data.phone || null,
        description: data.description || null,
        contact_name: data.contact_name || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    console.log('New bar submission saved:', submission.id);

    return NextResponse.json({ success: true, id: submission.id });
  } catch (e) {
    console.error('Bar submission error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
