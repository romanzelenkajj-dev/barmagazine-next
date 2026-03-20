'use client';

import { useState, useCallback, type FormEvent } from 'react';

// Mailchimp audience config
const MC_U = '7abc9521cafc177653476a2f9';
const MC_ID = '7857dc28c0';
const MC_DC = 'us22';

interface NewsletterFormProps {
  className?: string;
}

export function NewsletterForm({ className }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
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
      // Use Mailchimp's JSONP endpoint via fetch + callback extraction
      const url = `https://${MC_DC}.list-manage.com/subscribe/post-json?u=${MC_U}&id=${MC_ID}&EMAIL=${encodeURIComponent(email)}&c=__mcCallback`;

      // JSONP: inject a script tag since Mailchimp doesn't support CORS
      const result = await new Promise<{ result: string; msg: string }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Request timed out'));
        }, 10000);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__mcCallback = (data: { result: string; msg: string }) => {
          cleanup();
          resolve(data);
        };

        const script = document.createElement('script');
        script.src = url;
        script.onerror = () => {
          cleanup();
          reject(new Error('Network error'));
        };
        document.body.appendChild(script);

        function cleanup() {
          clearTimeout(timeout);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (window as any).__mcCallback;
          if (script.parentNode) script.parentNode.removeChild(script);
        }
      });

      if (result.result === 'success') {
        setStatus('success');
        form.reset();
      } else {
        // Mailchimp returns HTML in msg — strip tags for cleaner display
        const cleanMsg = result.msg
          ?.replace(/<[^>]*>/g, '')
          ?.replace(/^0 - /, '') || 'Something went wrong. Please try again.';

        // "already subscribed" is not really an error
        if (result.msg?.toLowerCase().includes('already subscribed')) {
          setStatus('success');
          form.reset();
        } else {
          setStatus('error');
          setErrorMsg(cleanMsg);
        }
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }, []);

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
