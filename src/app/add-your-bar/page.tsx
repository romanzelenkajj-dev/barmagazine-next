'use client';

import { useState, FormEvent } from 'react';

export default function AddYourBarPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);

    const submission = {
      name: data.get('barName') as string,
      city: data.get('city') as string,
      country: data.get('country') as string,
      address: (data.get('address') as string) || undefined,
      type: (data.get('barType') as string) || 'Cocktail Bar',
      website: (data.get('website') as string) || undefined,
      instagram: (data.get('instagram') as string) || undefined,
      email: data.get('contactEmail') as string,
      phone: (data.get('phone') as string) || undefined,
      description: (data.get('description') as string) || undefined,
      contact_name: (data.get('contactName') as string) || undefined,
    };

    // Submit via server-side API route
    try {
      const response = await fetch('/api/bar-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again or email us directly at office@barmagazine.com.');
      }
    } catch {
      setError('Something went wrong. Please try again or email us directly at office@barmagazine.com.');
    }

    setSubmitting(false);
  }

  return (
    <div style={{ marginTop: 'var(--gap)', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', paddingBottom: 64 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Add Your Bar
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
        Submit your bar to the Bar Magazine directory. We&apos;ll review your submission and get back to you.
      </p>

      {submitted ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: 48,
          textAlign: 'center',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ marginBottom: 16 }}>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Submission Received</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            Thank you for submitting your bar. Our team will review it and get in touch at the email you provided.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Bar Name *</label>
            <input name="barName" required className="form-input" placeholder="e.g. The Artisan Bar" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input name="city" required className="form-input" placeholder="e.g. London" />
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input name="country" required className="form-input" placeholder="e.g. United Kingdom" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input name="address" className="form-input" placeholder="Street address" />
          </div>

          <div className="form-group">
            <label className="form-label">Bar Type</label>
            <select name="barType" className="form-input" defaultValue="Cocktail Bar">
              <option value="Cocktail Bar">Cocktail Bar</option>
              <option value="Hotel Bar">Hotel Bar</option>
              <option value="Speakeasy">Speakeasy</option>
              <option value="Wine Bar">Wine Bar</option>
              <option value="Rooftop Bar">Rooftop Bar</option>
              <option value="Dive Bar">Dive Bar</option>
              <option value="Tiki Bar">Tiki Bar</option>
              <option value="Pub">Pub</option>
              <option value="Lounge">Lounge</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input name="website" type="url" className="form-input" placeholder="https://" />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram</label>
              <input name="instagram" className="form-input" placeholder="@yourbar" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Contact Name *</label>
              <input name="contactName" required className="form-input" placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email *</label>
              <input name="contactEmail" required type="email" className="form-input" placeholder="your@email.com" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input name="phone" type="tel" className="form-input" placeholder="+1 234 567 890" />
          </div>

          <div className="form-group">
            <label className="form-label">About Your Bar</label>
            <textarea name="description" className="form-input" rows={4} placeholder="Tell us about your bar — concept, specialty cocktails, atmosphere..." />
          </div>

          {error && (
            <p style={{ color: '#e53e3e', fontSize: 14 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="cta-submit"
            style={{ alignSelf: 'flex-start', cursor: submitting ? 'wait' : 'pointer', border: 'none', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Submitting...' : 'Submit Bar'}
          </button>
        </form>
      )}
    </div>
  );
}
