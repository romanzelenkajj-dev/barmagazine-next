'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authHeader, signOut } from '@/lib/owner-session';
import Link from 'next/link';
import { OWNER_EDITABLE_FIELDS } from '@/lib/owner-fields';

/**
 * Owner edit form.
 *
 * Two things kept in step here:
 *
 *  1. Styling uses the site's own system and the .add-bar-* family, the same
 *     classes /add-your-bar uses, instead of raw Tailwind.
 *  2. The fields match the server allowlist. It previously offered name,
 *     description, neighborhood and hours — the first two the server drops as
 *     editorial, and the last two are not columns on `bars` at all. An owner
 *     could carefully rewrite their description, get "submitted for review",
 *     and have it silently discarded.
 */

interface BarData {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  website: string;
  instagram: string;
  email: string;
  opening_hours: string;
  reservation_url: string;
  whatsapp: string;
  menu_url: string;
  featured_image: string;
  gallery_images: string[];
  photos?: string[];
}

/** Text fields an owner may edit, in the order they appear on the form. */
const TEXT_FIELDS = [
  { key: 'address', label: 'Address', placeholder: 'Street, number, postcode' },
  { key: 'phone', label: 'Phone', placeholder: '+34 900 000 000' },
  { key: 'email', label: 'Contact email', placeholder: 'hello@yourbar.com' },
  { key: 'website', label: 'Website', placeholder: 'https://yourbar.com' },
  { key: 'instagram', label: 'Instagram', placeholder: 'yourbar' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+34 900 000 000' },
  { key: 'reservation_url', label: 'Reservations link', placeholder: 'https://…' },
  { key: 'menu_url', label: 'Menu link', placeholder: 'https://…' },
] as const;

type FormState = Record<string, string>;

interface PendingSubmission {
  id: string;
  bar_id: string;
  status: string;
  submission_type: string;
  submitted_data: Record<string, unknown>;
  created_at: string;
}

const EMPTY: FormState = {
  address: '', phone: '', email: '', website: '', instagram: '',
  whatsapp: '', reservation_url: '', menu_url: '', opening_hours: '',
};

export default function EditBarPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [bar, setBar] = useState<BarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormState>(EMPTY);
  const [pending, setPending] = useState<PendingSubmission[]>([]);

  const fetchBar = useCallback(async () => {
    const headers = await authHeader();
    if (!headers) { router.push('/owner-dashboard/login'); return; }
    try {
      const res = await fetch('/api/owner/bars', { headers });
      if (res.status === 401) { await signOut(); router.push('/owner-dashboard/login'); return; }
      const data = await res.json();
      const found = data.bars?.find((b: BarData) => b.slug === slug);
      if (!found) { setError('Bar not found or not owned by you'); setLoading(false); return; }
      setBar(found);
      setPending(
        (data.submissions || []).filter(
          (s: PendingSubmission) => s.bar_id === found.id && s.status === 'pending'
        )
      );
      const next: FormState = { ...EMPTY };
      for (const key of Object.keys(EMPTY)) next[key] = found[key as keyof BarData]?.toString() || '';
      setFormData(next);
    } catch { setError('Failed to load bar data'); }
    finally { setLoading(false); }
  }, [slug, router]);

  useEffect(() => { fetchBar(); }, [fetchBar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const headers = await authHeader();
    if (!headers) { router.push('/owner-dashboard/login'); return; }
    try {
      // Only send what the server accepts. Belt and braces — the server
      // filters too — but it keeps the request honest about its intent.
      const updates: FormState = {};
      for (const key of Object.keys(EMPTY)) {
        if ((OWNER_EDITABLE_FIELDS as readonly string[]).includes(key)) updates[key] = formData[key];
      }
      const res = await fetch('/api/owner/bars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ bar_id: bar?.id, updates }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit'); return; }
      setSuccess(
        data.rejected?.length
          ? `Submitted for review. Not included (editorial fields): ${data.rejected.join(', ')}`
          : 'Sent for review — we’ll publish it once it’s checked.'
      );
      // Re-read so the pending banner below reflects what was just queued.
      // The form itself still shows live values, which is why that banner
      // exists: without it a pending edit looks like it never happened.
      fetchBar();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true); setError('');
    const headers = await authHeader();
    if (!headers) { router.push('/owner-dashboard/login'); return; }
    const fd = new FormData();
    fd.append('bar_id', bar?.id || '');
    Array.from(files).forEach((f) => fd.append('photos', f));
    try {
      const res = await fetch('/api/owner/photos', { method: 'POST', headers, body: fd });
      if (!res.ok) { setError('Photo upload failed'); return; }
      setSuccess('Photos uploaded and sent for review.');
      fetchBar();
    } catch { setError('Upload failed'); }
    finally { setUploading(false); }
  }

  if (loading) {
    return (
      <div className="add-bar-page">
        <div className="add-bar-form-card"><p>Loading…</p></div>
      </div>
    );
  }

  if (!bar) {
    return (
      <div className="add-bar-page">
        <div className="add-bar-form-card">
          <p className="add-bar-error">{error || 'Bar not found'}</p>
          <p style={{ marginTop: 16 }}>
            <Link href="/owner-dashboard" className="feature-link">Back to your bars</Link>
          </p>
        </div>
      </div>
    );
  }

  const gallery = bar.photos?.length ? bar.photos : bar.gallery_images || [];

  // Only show fields that actually differ from what's live — a submission
  // carries the whole form, so listing every key would imply changes the owner
  // never made.
  const changedIn = (sub: PendingSubmission) =>
    Object.entries(sub.submitted_data || {})
      .filter(([key, value]) => {
        const live = (bar[key as keyof BarData] ?? '').toString();
        return (value ?? '').toString() !== live;
      })
      .map(([key, value]) => ({
        key,
        label: TEXT_FIELDS.find(f => f.key === key)?.label || key.replace(/_/g, ' '),
        value: (value ?? '').toString(),
      }));

  return (
    <div className="add-bar-page owner-dash">
      <header className="owner-dash-head">
        <div>
          <Link href="/owner-dashboard" className="owner-dash-back">← Your bars</Link>
          <h1 className="owner-dash-title">{bar.name}</h1>
          <p className="owner-dash-sub">
            Changes are reviewed before they go live. Nothing here publishes straight away.
          </p>
        </div>
      </header>

      {error && <p className="add-bar-error">{error}</p>}
      {success && <p className="add-bar-success">{success}</p>}

      {pending.length > 0 && (
        <div className="owner-pending">
          <h2 className="owner-pending-title">
            {pending.length === 1 ? 'One change is waiting for review' : `${pending.length} changes are waiting for review`}
          </h2>
          <p className="owner-pending-lead">
            The form below still shows what&apos;s currently live on your listing —
            that&apos;s expected. Your edits publish once we&apos;ve checked them.
          </p>
          {pending.map(sub => {
            const changes = changedIn(sub);
            return (
              <div key={sub.id} className="owner-pending-item">
                <p className="owner-dash-card-meta">
                  {sub.submission_type === 'photo_upload' ? 'Photos' : 'Details'} · sent{' '}
                  {new Date(sub.created_at).toLocaleString()}
                </p>
                {sub.submission_type === 'photo_upload' ? (
                  <p>New photos awaiting review.</p>
                ) : changes.length > 0 ? (
                  <ul className="owner-pending-list">
                    {changes.map(c => (
                      <li key={c.key}>
                        <strong>{c.label}:</strong>{' '}
                        {c.value ? c.value : <em>cleared</em>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No differences from what&apos;s already live.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="add-bar-form-card">
        <form onSubmit={handleSubmit} className="add-bar-form">
          <div className="add-bar-form-section">
            <h2 className="owner-dash-section-title">Contact &amp; location</h2>
            {TEXT_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="form-label" htmlFor={`f-${key}`}>{label}</label>
                <input
                  id={`f-${key}`}
                  className="form-input"
                  value={formData[key]}
                  placeholder={placeholder}
                  onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="add-bar-form-section">
            <h2 className="owner-dash-section-title">Opening hours</h2>
            <label className="form-label" htmlFor="f-opening_hours">Hours</label>
            <textarea
              id="f-opening_hours"
              className="form-input"
              rows={4}
              placeholder={'Mon–Thu 18:00–01:00\nFri–Sat 18:00–03:00\nSun closed'}
              value={formData.opening_hours}
              onChange={e => setFormData({ ...formData, opening_hours: e.target.value })}
            />
          </div>

          <button type="submit" className="add-bar-submit" disabled={saving}>
            {saving ? 'Sending…' : 'Send changes for review'}
          </button>

          <p className="owner-dash-note">
            Your bar&apos;s name, description and awards are written by our editors, so
            they aren&apos;t editable here. Spotted something wrong?{' '}
            <a href="mailto:office@barmagazine.com" className="feature-link">Tell us</a>.
          </p>
        </form>
      </div>

      <section className="owner-dash-section">
        <h2 className="owner-dash-section-title">Photos</h2>
        <div className="add-bar-form-card">
          {gallery.length > 0 && (
            <div className="owner-dash-photos">
              {gallery.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt="" className="owner-dash-photo" />
              ))}
            </div>
          )}
          <label className="add-bar-photo-dropzone" style={{ cursor: 'pointer' }}>
            <strong>{uploading ? 'Uploading…' : 'Add photos'}</strong>
            <span className="add-bar-photo-dropzone-sub">
              JPG, PNG or WebP. New photos are reviewed before they appear.
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
