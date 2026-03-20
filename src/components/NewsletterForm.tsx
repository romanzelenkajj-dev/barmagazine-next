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
      <p style={{ fontWeight: 600, fontSize: 15 }}>
        Thanks for subscribing!
      </p>
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
