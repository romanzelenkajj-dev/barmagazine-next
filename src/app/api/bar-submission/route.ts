import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { escapeHtml } from '@/lib/notify';
import { MAIL_FROM, MAIL_REPLY_TO } from '@/lib/mail';
import { geocodeBar } from '@/lib/geocode';
import { normalizeBarFields } from '@/lib/normalize';

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
      ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Photo</td><td style="padding: 8px 12px;"><a href="${escapeHtml(photoUrl)}"><img src="${escapeHtml(photoUrl)}" width="120" style="width:120px;height:90px;object-fit:cover;border-radius:6px;border:1px solid #e0d8d0;display:block;margin-bottom:4px;" alt="Submitted photo">View full size</a></td></tr>`
      : '';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        reply_to: MAIL_REPLY_TO,
        to: [NOTIFICATION_EMAIL],
        subject: `New Bar Submission: ${data.name} — ${data.city}, ${data.country}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A1A1A;">${data.upgrade_slug ? 'Listing UPGRADE request' : 'New Bar Submission'}</h2>
            ${data.upgrade_slug ? `<p style="padding: 10px 12px; background: #d4edda; color: #155724; font-size: 14px; border-radius: 6px;">Existing listing: <a href="https://barmagazine.com/bars/${escapeHtml(data.upgrade_slug)}">barmagazine.com/bars/${escapeHtml(data.upgrade_slug)}</a> — do NOT create a new bar row.</p>` : ''}
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #666; width: 140px;">Bar Name</td><td style="padding: 8px 12px;">${escapeHtml(data.name)}</td></tr>
              <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">City</td><td style="padding: 8px 12px;">${escapeHtml(data.city)}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Country</td><td style="padding: 8px 12px;">${escapeHtml(data.country)}</td></tr>
              ${data.address ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Address</td><td style="padding: 8px 12px;">${escapeHtml(data.address)}</td></tr>` : ''}
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Type</td><td style="padding: 8px 12px;">${escapeHtml(data.type || 'Cocktail Bar')}</td></tr>
              ${data.website ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Website</td><td style="padding: 8px 12px;"><a href="${escapeHtml(data.website)}">${escapeHtml(data.website)}</a></td></tr>` : ''}
              ${data.instagram ? `<tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Instagram</td><td style="padding: 8px 12px;">${escapeHtml(data.instagram)}</td></tr>` : ''}
              <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Contact Name</td><td style="padding: 8px 12px;">${escapeHtml(data.contact_name || '—')}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Contact Email</td><td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
              ${data.phone ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #666;">Phone</td><td style="padding: 8px 12px;">${escapeHtml(data.phone)}</td></tr>` : ''}
              ${data.preferred_plan && data.preferred_plan !== 'free' ? `<tr style="background: #fff3cd;"><td style="padding: 8px 12px; font-weight: 600; color: #856404;">💰 Preferred Plan</td><td style="padding: 8px 12px; font-weight: 600; color: #856404;">${data.preferred_plan === 'featured_social' ? 'Featured + Social ($79/mo)' : data.preferred_plan === 'featured' ? 'Featured ($39/mo)' : escapeHtml(data.preferred_plan)}</td></tr>` : `<tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Preferred Plan</td><td style="padding: 8px 12px;">Free (Listed)</td></tr>`}
              ${data.description ? `<tr><td style="padding: 8px 12px; font-weight: 600; color: #666;">Description</td><td style="padding: 8px 12px;">${escapeHtml(data.description)}</td></tr>` : ''}
              ${photoRow}
            </table>
            <p style="margin-top: 24px; font-size: 13px; color: #999;">This notification was sent from barmagazine.com</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '<unreadable>');
      console.error(
        `[bar-submission] SEND FAILED to ${NOTIFICATION_EMAIL} — status ${res.status} ${res.statusText}: ${err}`
      );
    } else {
      console.log('Notification email sent to', NOTIFICATION_EMAIL);
    }
  } catch (e) {
    console.error('Failed to send notification email:', e);
  }
}

export async function POST(request: Request) {
  try {
    const data = normalizeBarFields(await request.json());

    // Validate required fields (after normalization, so a whitespace-only
    // value like "   " is correctly treated as missing)
    if (!data.name || !data.city || !data.country || !data.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upgrade of an existing listing: the slug is recorded on the submission
    // (bar_submissions has no dedicated column, so it rides in `notes`) so
    // review can attach the plan to the existing row instead of creating a
    // duplicate. Strict shape — this is client input headed for a DB row.
    const upgradeSlug =
      typeof data.upgrade_slug === 'string' && /^[a-z0-9-]{1,100}$/.test(data.upgrade_slug)
        ? data.upgrade_slug
        : null;
    // The email template reads data.upgrade_slug — make sure it can only ever
    // see the validated value, not whatever shape the client sent.
    if (upgradeSlug) (data as Record<string, unknown>).upgrade_slug = upgradeSlug;
    else delete (data as Record<string, unknown>).upgrade_slug;

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

    // Geocode the bar location. Upgrades skip it — the existing listing
    // already has coordinates, and `notes` is needed for the slug instead.
    const coords = upgradeSlug
      ? null
      : await geocodeBar({
          name: data.name,
          address: data.address,
          city: data.city,
          country: data.country,
        });

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
      photo_url: photoUrl || null,
      preferred_plan: data.preferred_plan || 'free',
      // Note: lat/lng stored in notes for future use — bar_submissions table doesn't have geo columns
      ...(coords && { notes: `geo:${coords.lat},${coords.lng}` }),
      ...(upgradeSlug && { notes: `upgrade:${upgradeSlug}` }),
    };

    // Send notification email FIRST — even if DB insert fails, we want the email
    await sendNotificationEmail(data, photoUrl);

    const { data: submission, error } = await supabaseAdmin
      .from('bar_submissions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error));
      // Still return success — the email was sent, submission is logged
      console.log('BAR_SUBMISSION_FALLBACK:', JSON.stringify({ ...insertData, photo_url: photoUrl }));
      return NextResponse.json({ success: true, note: 'Email sent, DB save failed — check logs' });
    }

    console.log('New bar submission saved:', submission.id, photoUrl ? `with photo: ${photoUrl}` : 'no photo');

    return NextResponse.json({ success: true, id: submission.id });
  } catch (e) {
    console.error('Bar submission error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
