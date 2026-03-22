'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  bar_id: string;
  owner_id: string;
  status: string;
  submitted_data: Record<string, unknown>;
  submission_type: string;
  admin_notes: string;
  created_at: string;
  bar_name?: string;
  owner_email?: string;
}

export default function AdminSubmissionsPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/submissions', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        setAuthenticated(true);
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function fetchSubmissions() {
    const res = await fetch(`/api/admin/submissions?status=${filter}`, {
      headers: { 'x-admin-password': password },
    });
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions || []);
    }
  }

  useEffect(() => {
    if (authenticated) fetchSubmissions();
  }, [filter, authenticated]);

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch('/api/admin/submissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ submission_id: id, action }),
    });
    fetchSubmissions();
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center">Admin Submissions</h1>
          <input
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2"
          />
          <button type="submit" disabled={loading} className="w-full bg-amber-600 py-2 rounded">
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin: Submissions</h1>
        <Link href="/admin/bars" className="text-gray-400 hover:text-white text-sm">Manage Bars</Link>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded text-sm capitalize ${filter === s ? 'bg-amber-600' : 'bg-gray-800'}`}>
              {s}
            </button>
          ))}
        </div>

        {submissions.length === 0 ? (
          <p className="text-gray-400">No {filter} submissions.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div key={sub.id} className="border border-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{sub.bar_name || sub.bar_id}</p>
                    <p className="text-gray-500 text-xs">By: {sub.owner_email || sub.owner_id}</p>
                    <p className="text-gray-500 text-xs">Type: {sub.submission_type} | {new Date(sub.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${sub.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : sub.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {sub.status}
                  </span>
                </div>
                <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto max-h-48 mb-3">
                  {JSON.stringify(sub.submitted_data, null, 2)}
                </pre>
                {sub.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(sub.id, 'approve')} className="bg-green-700 hover:bg-green-600 px-4 py-1 rounded text-sm">Approve</button>
                    <button onClick={() => handleAction(sub.id, 'reject')} className="bg-red-700 hover:bg-red-600 px-4 py-1 rounded text-sm">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}