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
    <div className="add-bar-page">
      {/* Hero */}
      <div className="add-bar-hero">
        <div className="add-bar-hero-inner">
          <div className="add-bar-hero-badge">Free Listing</div>
          <h1>Add Your Bar</h1>
          <p>Submit your bar to the BarMagazine directory. We&apos;ll review your submission and get back to you.</p>
        </div>
      </div>

      {submitted ? (
        <div className="add-bar-success">
          <div className="add-bar-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h2>Submission Received</h2>
          <p>Thank you for submitting your bar. Our team will review it and get in touch at the email you provided.</p>
          <a href="/" className="add-bar-success-link">Back to BarMagazine</a>
        </div>
      ) : (
        <div className="add-bar-layout">
          {/* Form */}
          <div className="add-bar-form-card">
            <form onSubmit={handleSubmit} className="add-bar-form">
              <div className="add-bar-form-section">
                <h2>Bar Details</h2>
                <div className="form-group">
                  <label className="form-label">Bar Name <span className="form-required">*</span></label>
                  <input name="barName" required className="form-input" placeholder="e.g. The Artisan Bar" />
                </div>

                <div className="add-bar-form-row">
                  <div className="form-group">
                    <label className="form-label">City <span className="form-required">*</span></label>
                    <input name="city" required className="form-input" placeholder="e.g. London" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country <span className="form-required">*</span></label>
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
              </div>

              <div className="add-bar-form-section">
                <h2>Online Presence</h2>
                <div className="add-bar-form-row">
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input name="website" type="url" className="form-input" placeholder="https://" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Instagram</label>
                    <input name="instagram" className="form-input" placeholder="@yourbar" />
                  </div>
                </div>
              </div>

              <div className="add-bar-form-section">
                <h2>Contact Information</h2>
                <div className="add-bar-form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Name <span className="form-required">*</span></label>
                    <input name="contactName" required className="form-input" placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email <span className="form-required">*</span></label>
                    <input name="contactEmail" required type="email" className="form-input" placeholder="your@email.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input name="phone" type="tel" className="form-input" placeholder="+1 234 567 890" />
                </div>
              </div>

              <div className="add-bar-form-section">
                <h2>About Your Bar</h2>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-input" rows={4} placeholder="Tell us about your bar — concept, specialty cocktails, atmosphere..." />
                  <span className="form-hint">A good description helps us feature your bar effectively.</span>
                </div>
              </div>

              {error && (
                <div className="add-bar-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="add-bar-submit"
              >
                {submitting ? 'Submitting...' : 'Submit Your Bar'}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="add-bar-sidebar">
            <div className="add-bar-info-card">
              <h3>What&apos;s Included</h3>
              <ul className="add-bar-benefits">
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Listed in the global directory
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Your own profile page
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Searchable by city &amp; type
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Link to your website
                </li>
              </ul>
            </div>

            <div className="add-bar-info-card">
              <h3>Questions?</h3>
              <p>Email us at <a href="mailto:office@barmagazine.com">office@barmagazine.com</a> and we&apos;ll help you get set up.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
