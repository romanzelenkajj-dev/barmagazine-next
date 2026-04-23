'use client';
import { useState, useRef } from 'react';

interface PhotoManagerProps {
  barId: string;
  photos: string[];
  adminSecret: string;
  onUpdate: (updatedBar: { photos: string[] }) => void;
}

export default function PhotoManager({ barId, photos, adminSecret, onUpdate }: PhotoManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('barId', barId);
      const res = await fetch('/api/admin/upload-photo', {
        method: 'POST',
        headers: { 'x-admin-secret': adminSecret },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.bar) onUpdate(data.bar);
      showMsg('Photo uploaded');
    } catch {
      showMsg('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const deletePhoto = async (photoUrl: string) => {
    if (!confirm('Delete this photo?')) return;
    setDeleting(photoUrl);
    try {
      const res = await fetch('/api/admin/upload-photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify({ barId, photoUrl }),
      });
      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();
      if (data.bar) onUpdate(data.bar);
      showMsg('Photo deleted');
    } catch {
      showMsg('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6b6b', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
        Photos ({photos.length})
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 10 }}>
        {photos.length === 0 && <div style={{ fontSize: 13, color: '#9a9089' }}>No photos yet</div>}
        {photos.map((url, i) => (
          <div key={i} style={{ position: 'relative' as const, width: 80, height: 80 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover' as const, borderRadius: 8, border: '1px solid #e0d8d0' }} />
            <button
              onClick={() => deletePhoto(url)}
              disabled={deleting === url}
              style={{ position: 'absolute' as const, top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#dc2626', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              {deleting === url ? '...' : 'x'}
            </button>
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display: 'none' }} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1.5px dashed #7B1E1E', background: 'transparent', color: '#7B1E1E', cursor: 'pointer' }}
      >
        {uploading ? 'Uploading...' : '+ Upload Photo'}
      </button>
      {toast && (
        <div style={{ marginTop: 8, fontSize: 13, color: toast.includes('failed') ? '#dc2626' : '#22c55e', fontWeight: 600 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
