'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface BarData {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  phone: string;
  website: string;
  instagram: string;
  description: string;
  hours: string;
  featured_image: string;
  gallery_images: string[];
}

export default function EditBarPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [bar, setBar] = useState<BarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '', address: '', neighborhood: '', phone: '',
    website: '', instagram: '', description: '', hours: '',
  });

  const fetchBar = useCallback(async () => {
    const token = localStorage.getItem('owner_token');
    if (!token) { router.push('/owner-dashboard/login'); return; }
    try {
      const res = await fetch('/api/owner/bars', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/owner-dashboard/login'); return; }
      const data = await res.json();
      const found = data.bars?.find((b: BarData) => b.slug === slug);
      if (!found) { setError('Bar not found or not owned by you'); setLoading(false); return; }
      setBar(found);
      setFormData({
        name: found.name || '', address: found.address || '',
        neighborhood: found.neighborhood || '', phone: found.phone || '',
        website: found.website || '', instagram: found.instagram || '',
        description: found.description || '', hours: found.hours || '',
      });
    } catch { setError('Failed to load bar data'); }
    finally { setLoading(false); }
  }, [slug, router]);

  useEffect(() => { fetchBar(); }, [fetchBar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const token = localStorage.getItem('owner_token');
    try {
      const res = await fetch('/api/owner/bars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bar_id: bar?.id, updates: formData }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit'); return; }
      setSuccess('Changes submitted for admin review!');
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true); setError('');
    const token = localStorage.getItem('owner_token');
    const fd = new FormData();
    fd.append('bar_id', bar?.id || '');
    Array.from(files).forEach((f) => fd.append('photos', f));
    try {
      const res = await fetch('/api/owner/photos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) { setError('Photo upload failed'); return; }
      setSuccess('Photos uploaded and submitted for review!');
      fetchBar();
    } catch { setError('Upload failed'); }
    finally { setUploading(false); }
  }

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><p>Loading...</p></div>;
  if (!bar) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><p className="text-red-500">{error || 'Bar not found'}</p></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <Link href="/owner-dashboard" className="text-gray-400 hover:text-white text-sm">← Back to Dashboard</Link>
          <h1 className="text-2xl font-bold mt-1">Edit: {bar.name}</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        {error && <p className="text-red-500 bg-red-900/20 p-3 rounded mb-4">{error}</p>}
        {success && <p className="text-green-500 bg-green-900/20 p-3 rounded mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['name','address','neighborhood','phone','website','instagram','hours'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm text-gray-400 mb-1 capitalize">{field}</label>
              <input
                value={formData[field]}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white"
            />
          </div>
          <button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-6 py-2 rounded font-medium">
            {saving ? 'Submitting...' : 'Submit Changes for Review'}
          </button>
        </form>

        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Photos</h2>
          {bar.featured_image && <img src={bar.featured_image} alt="Featured" className="w-full h-48 object-cover rounded mb-4" />}
          {bar.gallery_images && bar.gallery_images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {bar.gallery_images.map((img, i) => <img key={i} src={img} alt="" className="h-32 w-full object-cover rounded" />)}
            </div>
          )}
          <label className="block">
            <span className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded cursor-pointer inline-block">
              {uploading ? 'Uploading...' : 'Upload New Photos'}
            </span>
            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
          </label>
        </section>
      </main>
    </div>
  );
}