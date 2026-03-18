'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';

interface NewsletterFormProps {
  className?: string;
}

export function NewsletterForm({ className }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const timestampRef = useRef('');

  useEffect(() => {
    timestampRef.current = String(Math.floor(Date.now() / 1000));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    // Ensure timestamp is fresh at submission time
    formData.set('_mc4wp_timestamp', String(Math.floor(Date.now() / 1000)));

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        const text = await res.text().catch(() => '');
        setStatus('error');
        setErrorMsg(text || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <p style={{ fontWeight: 600, fontSize: 15 }}>
        Thanks for subscribing! Check your inbox to confirm.
      </p>
    );
  }

  return (
    <form
      method="post"
      action="https://romanzelenka-wjgek.wpcomstaging.com/"
      className={className}
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="_mc4wp_form_id" value="84" />
      <input type="hidden" name="_mc4wp_timestamp" value={timestampRef.current} />
      <input type="hidden" name="_mc4wp_honeypot" value="" />
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
