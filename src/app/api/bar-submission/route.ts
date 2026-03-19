import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (bypasses RLS)
// Lazy init to avoid build-time errors when env vars aren't available
function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  return createClient(supabaseUrl, serviceKey);
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';


async function uploadPhotoToStorage(base64Data: string, barName: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    // Extract mime type and data from base64 string
    const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) return null;

    const mimeType = matches[1];
    const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Generate a unique filename
    const slug = barName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const timestamp = Date.now();
    const filePath = `submissions/${slug}-${timestamp}.${ext}`;

    const { error } = await supabase.storage
      .from('bar-photos')
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('Photo upload error:', error);
      // Try creating the bucket if it doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
        await supabase.storage.createBucket('bar-photos', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
        });
        const retryResult = await supabase.storage
          .from('bar-photos')
          .upload(filePath, buffer, { contentType: mimeType, upsert: false });
        if (retryResult.error) {
          console.error('Photo upload retry error:', retryResult.error);
          return null;
        }
      } else {
        return null;
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('bar-photos')
      .getPublicUrl(filePath);

    return urlData?.publicUrl || null;
  } catch (e) {
    console.error('Photo upload failed:', e);
    return null;
  }
}

async function sendNotificationEmail(data: Record<string, string | undefined>, photoUrl?: string | null) {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured — skipping email notification');
    return;
  }

  try {
    const photoRow = photoUrl
      ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Photo</td><td style="padding: 8px 12px;"><a href="${photoUrl}">View uploaded photo</a></td></tr>`
      : '';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BarMagazine <onboarding@resend.dev>',
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
              ${data.preferred_plan && data.preferred_plan !== 'free' ? `<tr style="background: #fff3cd;"><td style="padding: 8px 12px; font-weight: 600; color: #856404;">💰 Preferred Plan</td><td style="padding: 8px 12px; font-weight: 600; color: #856404;">${data.preferred_plan === 'featured_social' ? 'Featured + Social ($79/mo)' : data.preferred_plan === 'featured' ? 'Featured ($39/mo)' : data.preferred_plan}</td></tr>` : `<tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Preferred Plan</td><td style="padding: 8px 12px;">Free (Listed)</td></tr>`}
              ${data.description ? `<tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Description</td><td style="padding: 8px 12px;">${data.description}</td></tr>` : ''}
              ${photoRow}
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

    // Upload photo if provided
    let photoUrl: string | null = null;
    if (data.photo) {
      photoUrl = await uploadPhotoToStorage(data.photo, data.name);
    }

    // Insert into Supabase using service role key
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      // Fallback: log the submission — it will be visible in Vercel logs
      console.log('BAR_SUBMISSION:', JSON.stringify({ ...data, photo: data.photo ? '[base64 photo]' : null, photo_url: photoUrl, preferred_plan: data.preferred_plan || 'free' }));
      return NextResponse.json({ success: true, note: 'Submission logged, database save pending env setup' });
    }

    const insertData: Record<string, unknown> = {
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
    };

    const { data: submission, error } = await supabaseAdmin
      .from('bar_submissions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error));
      return NextResponse.json(
        { success: false, error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    console.log('New bar submission saved:', submission.id, photoUrl ? `with photo: ${photoUrl}` : 'no photo');

    // Send notification email (non-blocking)
    sendNotificationEmail(data, photoUrl);

    return NextResponse.json({ success: true, id: submission.id });
  } catch (e) {
    console.error('Bar submission error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
