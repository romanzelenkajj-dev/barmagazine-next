'use client';

import { useState, FormEvent } from 'react';

export default function AddYourBarPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const barName = data.get('barName') as string;
    const city = data.get('city') as string;
    const country = data.get('country') as string;
    const address = data.get('address') as string;
    const website = data.get('website') as string;
    const contactName = data.get('contactName') as string;
    const contactEmail = data.get('contactEmail') as string;
    const description = data.get('description') as string;

    const subject = encodeURIComponent(`New Bar Submission: ${barName}`);
    const body = encodeURIComponent(
      `Bar Name: ${barName}\nCity: ${city}\nCountry: ${country}\nAddress: ${address}\nWebsite: ${website}\n\nContact Name: ${contactName}\nContact Email: ${contactEmail}\n\nDescription:\n${description}`
    );

    window.location.href = `mailto:office@barmagazine.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div style={{ marginTop: 'var(--gap)', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Add Your Bar
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
        Submit your bar to the Bar Magazine directory. Fill out the form below and we&apos;ll review your submission.
      </p>

      {submitted ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: 48,
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Thank you!</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            Your email client should have opened with the submission details. If not, please send the details directly to{' '}
            <a href="mailto:office@barmagazine.com" style={{ color: 'var(--accent)' }}>office@barmagazine.com</a>.
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
            <label className="form-label">Website</label>
            <input name="website" type="url" className="form-input" placeholder="https://" />
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
            <label className="form-label">About Your Bar</label>
            <textarea name="description" className="form-input" rows={4} placeholder="Tell us about your bar — concept, specialty cocktails, atmosphere..." />
          </div>

          <button type="submit" className="cta-submit" style={{ alignSelf: 'flex-start', cursor: 'pointer', border: 'none' }}>
            Submit Bar
          </button>
        </form>
      )}
    </div>
  );
}
