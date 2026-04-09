'use client';

import { Suspense, useState, FormEvent, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Stripe payment links by currency
const STRIPE_LINKS: Record<string, Record<string, string>> = {
  featured: {
    EUR: 'https://buy.stripe.com/4gM28r1TSaCz9CYfOLaAw00',
    USD: 'https://buy.stripe.com/cNieVdbuseSPeXi463aAw03',
  },
  featured_social: {
    EUR: 'https://buy.stripe.com/7sYeVd2XWaCzdTe5a7aAw01',
    USD: 'https://buy.stripe.com/14A28r564cKH7uQ31ZaAw02',
  },
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free Listing',
  featured: 'Featured',
  featured_social: 'Featured + Social',
};

function getCurrencyFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )geo_currency=([^;]*)/);
  return match ? match[1] : null;
}

export default function AddYourBarPage() {
  return (
    <Suspense fallback={<div className="add-bar-page"><div className="add-bar-hero"><div className="add-bar-hero-inner"><h1>Add Your Bar</h1></div></div></div>}>
      <AddYourBarForm />
    </Suspense>
  );
}

function AddYourBarForm() {
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'free';
  const initialPlan = ['free', 'featured', 'featured_social'].includes(planFromUrl)
    ? planFromUrl
    : 'free';

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [currency, setCurrency] = useState<string>('EUR');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect currency on mount
  useEffect(() => {
    const cookieCurrency = getCurrencyFromCookie();
    if (cookieCurrency) {
      setCurrency(cookieCurrency === 'EUR' ? 'EUR' : 'USD');
      return;
    }
    fetch('/api/geo')
      .then((r) => r.json())
      .then((data) => {
        setCurrency(data.isEU ? 'EUR' : 'USD');
      })
      .catch(() => {});
  }, []);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setPhotoFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);

    let photoBase64: string | undefined;
    if (photoFile) {
      photoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(photoFile);
      });
    }

    const plan = data.get('preferredPlan') as string || 'free';

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
      preferred_plan: plan,
      photo: photoBase64,
    };

    try {
      const response = await fetch('/api/bar-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const result = await response.json();
      if (result.success) {
        // If paid plan, create Stripe Checkout Session with coupon applied
        if (plan !== 'free') {
          try {
            const checkoutRes = await fetch('/api/create-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                plan,
                currency,
                barName: data.get('barName') as string || '',
                email: data.get('contactEmail') as string || '',
              }),
            });
            const checkoutData = await checkoutRes.json();
            if (checkoutData.url) {
              window.location.href = checkoutData.url;
              return;
            }
          } catch (checkoutErr) {
            console.error('Checkout session error:', checkoutErr);
          }
          // Fallback to payment links if checkout session fails
          if (STRIPE_LINKS[plan]) {
            const stripeUrl = STRIPE_LINKS[plan][currency] || STRIPE_LINKS[plan]['USD'];
            window.location.href = stripeUrl;
            return;
          }
        }
        // Free plan: show success message
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError('Something went wrong. Please try again or email us directly at office@barmagazine.com.');
      }
    } catch {
      setError('Something went wrong. Please try again or email us directly at office@barmagazine.com.');
    }

    setSubmitting(false);
  }

  const isPaidPlan = selectedPlan !== 'free';

  return (
    <div className="add-bar-page">
      {/* Hero */}
      <div className="add-bar-hero">
        <div className="add-bar-hero-inner">
          <div className="add-bar-hero-badge">{PLAN_LABELS[selectedPlan] || 'Free Listing'}</div>
          <h1>Add Your Bar</h1>
          <p>
            {isPaidPlan
              ? 'Fill out your bar details below. After submitting, you\u2019ll be redirected to complete payment.'
              : 'Submit your bar to the BarMagazine directory. We\u2019ll review your submission and get back to you.'}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="add-bar-post-submit">
          {/* Success message */}
          <div className="add-bar-success">
            <div className="add-bar-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h2>Submission Received</h2>
            <p>Thank you for submitting your bar. Our team will review it and get in touch at the email you provided.</p>
          </div>

          {/* Pricing Tiers — only show for free plan submissions */}
          <div className="add-bar-tiers">
            <h2 className="add-bar-tiers-heading">Want More Visibility?</h2>
            <p className="add-bar-tiers-sub">Upgrade your listing to stand out and reach more customers.</p>

            <div className="add-bar-tiers-grid">
              {/* Free */}
              <div className="add-bar-tier-card">
                <div className="add-bar-tier-name">Listed</div>
                <div className="add-bar-tier-price">Free</div>
                <ul className="add-bar-tier-features">
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Directory profile page
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Name, location, type
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    1 interior photo
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Website &amp; Instagram link
                  </li>
                </ul>
                <div className="add-bar-tier-current">Your current plan</div>
              </div>

              {/* Featured */}
              <div className="add-bar-tier-card add-bar-tier-card--featured">
                <div className="add-bar-tier-popular">Most Popular</div>
                <div className="add-bar-tier-name">Featured</div>
                <div className="add-bar-tier-price"><span style={{textDecoration:'line-through',opacity:0.4,fontSize:'0.6em',marginRight:4}}>{currency === 'EUR' ? '€39' : '$39'}</span>{currency === 'EUR' ? '€19.50' : '$19.50'}<span>/mo</span></div>
                <div className="add-bar-tier-annual">Billed annually {currency === 'EUR' ? '€234' : '$234'}/year (50% off first year)</div>
                <ul className="add-bar-tier-features">
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Everything in Free
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    BarMagazine feature article
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Priority placement in directory
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Multiple photos &amp; menu
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Unlimited profile updates
                  </li>
                </ul>
                <a href={STRIPE_LINKS.featured[currency] || STRIPE_LINKS.featured.USD} className="add-bar-tier-btn">Get Featured</a>
              </div>

              {/* Featured + Social */}
              <div className="add-bar-tier-card add-bar-tier-card--premium">
                <div className="add-bar-tier-name">Featured + Social</div>
                <div className="add-bar-tier-price"><span style={{textDecoration:'line-through',opacity:0.4,fontSize:'0.6em',marginRight:4}}>{currency === 'EUR' ? '€79' : '$79'}</span>{currency === 'EUR' ? '€39.50' : '$39.50'}<span>/mo</span></div>
                <div className="add-bar-tier-annual">Billed annually {currency === 'EUR' ? '€474' : '$474'}/year (50% off first year)</div>
                <ul className="add-bar-tier-features">
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Everything in Featured
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Instagram post or Reel
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    3 Instagram Stories
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Cross-promotion collab
                  </li>
                </ul>
                <a href={STRIPE_LINKS.featured_social[currency] || STRIPE_LINKS.featured_social.USD} className="add-bar-tier-btn add-bar-tier-btn--premium">Get Started</a>
              </div>
            </div>
          </div>

          <div className="add-bar-success-back">
            <Link href="/bars" className="add-bar-success-link">&larr; Back to Bar Directory</Link>
          </div>
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
                  <input name="address" autoComplete="street-address" className="form-input" placeholder="Street address" />
                </div>

                <div className="form-group">
                  <label className="form-label">Bar Type</label>
                  <select name="barType" className="form-input" defaultValue="Cocktail Bar">
                    <option value="Cocktail Bar">Cocktail Bar</option>
                    <option value="Speakeasy">Speakeasy</option>
                    <option value="Hotel Bar">Hotel Bar</option>
                    <option value="Rooftop Bar">Rooftop Bar</option>
                    <option value="Wine Bar">Wine Bar</option>
                    <option value="Pub">Pub</option>
                    <option value="Tiki Bar">Tiki Bar</option>
                    <option value="Whiskey Bar">Whiskey Bar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Plan</label>
                  <select
                    name="preferredPlan"
                    className="form-input"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  >
                    <option value="free">Listed (Free)</option>
                    <option value="featured">Featured ({currency === 'EUR' ? '€19.50' : '$19.50'}/mo &mdash; 50% off first year)</option>
                    <option value="featured_social">Featured + Social ({currency === 'EUR' ? '€39.50' : '$39.50'}/mo &mdash; 50% off first year)</option>
                  </select>
                  <span className="form-hint">
                    {isPaidPlan
                      ? 'You\u2019ll be redirected to Stripe to complete payment after submitting.'
                      : 'Not sure? Start with Free \u2014 you can upgrade anytime.'}
                    {' '}<a href="/claim-your-bar" style={{textDecoration: 'underline'}}>Compare plans</a>
                  </span>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="add-bar-form-section">
                <h2>Interior Photo</h2>
                <p className="add-bar-photo-hint">Upload one photo of your bar&apos;s interior. JPG, PNG, or WebP, max 5MB.</p>
                <div className="add-bar-photo-upload">
                  {photoPreview ? (
                    <div className="add-bar-photo-preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Bar interior preview" />
                      <button type="button" className="add-bar-photo-remove" onClick={removePhoto}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="add-bar-photo-dropzone">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoSelect}
                        style={{ display: 'none' }}
                      />
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span>Click to upload a photo</span>
                      <span className="add-bar-photo-dropzone-sub">JPG, PNG, or WebP &middot; Max 5MB</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="add-bar-form-section">
                <h2>Online Presence</h2>
                <div className="add-bar-form-row">
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input name="website" type="url" autoComplete="url" className="form-input" placeholder="https://" />
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
                    <input name="contactName" required autoComplete="name" className="form-input" placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email <span className="form-required">*</span></label>
                    <input name="contactEmail" required type="email" autoComplete="email" className="form-input" placeholder="your@email.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input name="phone" type="tel" autoComplete="tel" className="form-input" placeholder="+1 234 567 890" />
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
                {submitting
                  ? (isPaidPlan ? 'Submitting & redirecting to payment...' : 'Submitting...')
                  : (isPaidPlan ? 'Submit & Continue to Payment' : 'Submit Your Bar')}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="add-bar-sidebar">
            <div className="add-bar-info-card">
              <h3>{isPaidPlan ? `${PLAN_LABELS[selectedPlan]} Plan` : 'What\u2019s Included'}</h3>
              {selectedPlan === 'featured_social' ? (
                <ul className="add-bar-benefits">
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Everything in Featured
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Instagram post or Reel
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    3 Instagram Stories
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Cross-promotion collab
                  </li>
                </ul>
              ) : selectedPlan === 'featured' ? (
                <ul className="add-bar-benefits">
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    BarMagazine feature article
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    SEO-optimized profile page
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Priority placement in directory
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Multiple photos &amp; menu
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Featured badge &amp; unlimited updates
                  </li>
                </ul>
              ) : (
                <ul className="add-bar-benefits">
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Listed in the global directory
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Your own profile page
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Searchable by city &amp; type
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    1 interior photo
                  </li>
                  <li>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Website &amp; Instagram link
                  </li>
                </ul>
              )}
            </div>

            {isPaidPlan && (
              <div className="add-bar-info-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)' }}>
                <h3 style={{ color: 'var(--accent)' }}>
                  <span style={{textDecoration:'line-through',opacity:0.4,fontSize:'0.7em',marginRight:4}}>{currency === 'EUR' ? '€' : '$'}{selectedPlan === 'featured_social' ? '79' : '39'}</span>
                  {currency === 'EUR' ? '€' : '$'}{selectedPlan === 'featured_social' ? '39.50' : '19.50'}/mo
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  50% off first year. Billed annually {currency === 'EUR' ? '€' : '$'}{selectedPlan === 'featured_social' ? '474' : '234'}/year.
                  Renews at standard rate.
                </p>
              </div>
            )}

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
