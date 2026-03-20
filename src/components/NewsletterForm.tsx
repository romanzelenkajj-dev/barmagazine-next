'use client';

import { useState, useRef, useCallback, type FormEvent } from 'react';

// Mailchimp audience config
const MC_URL = 'https://barmagazine.us22.list-manage.com/subscribe/post';
const MC_U = '7abc9521cafc177653476a2f9';
const MC_ID = '7857dc28c0';

interface NewsletterFormProps {
  className?: string;
}

export function NewsletterForm({ className }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    // Don't prevent default — let the form submit naturally to the iframe target
    const form = e.currentTarget;
    const email = new FormData(form).get('EMAIL') as string;

    if (!email) {
      e.preventDefault();
      return;
    }

    setStatus('submitting');

    // The form will POST to Mailchimp via the hidden iframe.
    // After submission, show success after a short delay
    // (we can't read the iframe response due to cross-origin, but the POST itself works)
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  }, []);

  if (status === 'success') {
    return (
      <p style={{ fontWeight: 600, fontSize: 15 }}>
        Thanks for subscribing!
      </p>
    );
  }

  return (
    <>
      {/* Hidden iframe to receive the Mailchimp form submission */}
      <iframe
        ref={iframeRef}
        name="mc-iframe"
        style={{ display: 'none' }}
        tabIndex={-1}
        aria-hidden="true"
      />
      <form
        ref={formRef}
        className={className}
        action={MC_URL}
        method="POST"
        target="mc-iframe"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="u" value={MC_U} />
        <input type="hidden" name="id" value={MC_ID} />
        <input type="email" name="EMAIL" required placeholder="Your email address" />
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
    </>
  );
}
