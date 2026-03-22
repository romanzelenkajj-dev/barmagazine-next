'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Bar {
  id: string;
  name: string;
  slug: string;
  status: string;
  address: string;
  neighborhood: string;
  featured_image: string;
  updated_at: string;
}

interface Submission {
  id: string;
  bar_id: string;
  status: string;
  submitted_data: Record<string, unknown>;
  created_at: string;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [bars, setBars] = useState<Bar[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('owner_token');
    if (!token) {
      router.push('/owner-dashboard/login');
      return;
    }
    fetchDashboardData(token);
  }, [router]);

  async function fetchDashboardData(token: string) {
    try {
      const res = await fetch('/api/owner/bars', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('owner_token');
        router.push('/owner-dashboard/login');
        return;
      }
      const data = await res.json();
      setBars(data.bars || []);
      setSubmissions(data.submissions || []);
      setOwnerEmail(data.email || '');
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('owner_token');
    router.push('/owner-dashboard/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="text-gray-400 text-sm">{ownerEmail}</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">Back to Site</Link>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Your Bars</h2>
          {bars.length === 0 ? (
            <p className="text-gray-400">No bars linked to your account yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bars.map((bar) => (
                <div key={bar.id} className="border border-gray-800 rounded-lg p-4">
                  {bar.featured_image && (
                    <img src={bar.featured_image} alt={bar.name} className="w-full h-40 object-cover rounded mb-3" />
                  )}
                  <h3 className="font-semibold text-lg">{bar.name}</h3>
                  <p className="text-gray-400 text-sm">{bar.address}</p>
                  <p className="text-gray-500 text-xs mt-1">{bar.neighborhood}</p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/owner-dashboard/edit/${bar.slug}`}
                      className="bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded text-sm"
                    >
                      Edit Bar
                    </Link>
                    <Link
                      href={`/bars/${bar.slug}`}
                      className="border border-gray-600 hover:border-gray-400 px-3 py-1 rounded text-sm"
                    >
                      View Page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Your Submissions</h2>
          {submissions.length === 0 ? (
            <p className="text-gray-400">No pending submissions.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className="border border-gray-800 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Submission for bar: {sub.bar_id}</p>
                    <p className="text-gray-500 text-xs">Submitted: {new Date(sub.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    sub.status === 'approved' ? 'bg-green-900 text-green-300' :
                    sub.status === 'rejected' ? 'bg-red-900 text-red-300' :
                    'bg-yellow-900 text-yellow-300'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Submit Changes</h2>
          <p className="text-gray-400 mb-4">Want to update your bar info or upload new photos? Select a bar above and click Edit.</p>
        </section>
      </main>
    </div>
  );
}