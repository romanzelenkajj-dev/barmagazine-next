'use client';

import { useState, type FormEvent } from 'react';

interface NewsletterFormProps {
  className?: string;
}

export function NewsletterForm({ className }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const email = new FormData(form).get('EMAIL') as string;

    if (!email) {
      setStatus('error');
      setErrorMsg('Please enter your email address.');
      return;
    }

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="newsletter-success">
        <div className="newsletter-success-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.12" />
            <path d="M6 10.5L8.5 13L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="newsletter-success-text">You&apos;re in! Stay tuned for the latest from the bar world.</p>
      </div>
    );
  }

  return (
    <form
      className={className}
      onSubmit={handleSubmit}
    >
      <input type="email" name="EMAIL" required placeholder="Your email address" />
      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p style={{ color: '#e74c3c', fontSize: 13, marginTop: 8 }}>{errorMsg}</p>
      )}
    </form>
  );
}
