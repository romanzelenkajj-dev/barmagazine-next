'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import PhotoManager from './PhotoManager';

interface Bar {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  region: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  type: string;
  website: string | null;
  instagram: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  short_excerpt: string | null;
  photos: string[];
  tier: string;
  featured_until: string | null;
  is_verified: boolean;
  is_active: boolean;
  opening_hours: string | null;
  wp_article_slug: string | null;
  created_at: string;
  updated_at: string;
}

type EditableField = 'name' | 'slug' | 'city' | 'country' | 'type' | 'tier' | 'address' | 'website' | 'instagram' | 'phone' | 'email' | 'opening_hours' | 'description' | 'short_excerpt' | 'wp_article_slug' | 'is_active' | 'is_verified';

const EDITABLE_FIELDS: EditableField[] = [
  'name', 'slug', 'city', 'country', 'type', 'tier', 'address',
  'website', 'instagram', 'phone', 'email', 'opening_hours', 'description', 'short_excerpt',
  'wp_article_slug', 'is_active', 'is_verified',
];

const TYPE_OPTIONS = [
  'Cocktail Bar', 'Hotel Bar', 'Speakeasy', 'Rooftop Bar', 'Wine Bar',
  'Dive Bar', 'Tiki Bar', 'Restaurant Bar', 'Lounge', 'Pub', 'Beer Bar',
  'Mezcal Bar', 'Rum Bar', 'Gin Bar', 'Whisky Bar', 'Sake Bar',
];

const TIER_OPTIONS = ['free', 'featured', 'premium', 'top10'];

// Visible columns in the main table
const TABLE_COLUMNS: { key: keyof Bar; label: string; width: string }[] = [
  { key: 'name', label: 'Name', width: '180px' },
  { key: 'city', label: 'City', width: '120px' },
  { key: 'country', label: 'Country', width: '120px' },
  { key: 'type', label: 'Type', width: '130px' },
  { key: 'tier', label: 'Tier', width: '90px' },
  { key: 'is_active', label: 'Active', width: '60px' },
  { key: 'photos', label: 'Photo', width: '55px' },
  { key: 'wp_article_slug', label: 'Article', width: '55px' },
];

export default function AdminBarsClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingBar, setEditingBar] = useState<Bar | null>(null);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sortKey, setSortKey] = useState<keyof Bar>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchBars = useCallback(async (secret: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage-bar', {
        headers: { 'x-admin-secret': secret },
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setBars(data.bars || []);
    } catch {
      showToast('Failed to load bars', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage-bar', {
        headers: { 'x-admin-secret': password },
      });
      if (!res.ok) throw new Error('Wrong password');
      const data = await res.json();
      setBars(data.bars || []);
      setAdminSecret(password);
      setAuthed(true);
      sessionStorage.setItem('admin_secret', password);
    } catch {
      showToast('Incorrect password', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret');
    if (saved) {
      setAdminSecret(saved);
      setAuthed(true);
      fetchBars(saved);
    }
  }, [fetchBars]);

  const openEditor = (bar: Bar) => {
    setEditingBar(bar);
    const vals: Record<string, unknown> = {};
    EDITABLE_FIELDS.forEach(f => { vals[f] = bar[f]; });
    setEditValues(vals);
  };

  const saveChanges = async () => {
    if (!editingBar) return;
    setSaving(true);

    // Build only changed fields
    const updates: Record<string, unknown> = {};
    EDITABLE_FIELDS.forEach(f => {
      const original = editingBar[f];
      const edited = editValues[f];
      if (edited !== original) {
        updates[f] = edited === '' ? null : edited;
      }
    });

    if (Object.keys(updates).length === 0) {
      setEditingBar(null);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/manage-bar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ action: 'update', barId: editingBar.id, updates }),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      if (data.updated?.[0]) {
        setBars(prev => prev.map(b => b.id === editingBar.id ? data.updated[0] : b));
        showToast(`${editingBar.name} updated`, 'success');
      }
      setEditingBar(null);
    } catch {
      showToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle for boolean fields directly in table
  const quickToggle = async (bar: Bar, field: 'is_active' | 'is_verified') => {
    const newVal = !bar[field];
    try {
      const res = await fetch('/api/admin/manage-bar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ action: 'update', barId: bar.id, updates: { [field]: newVal } }),
      });
      if (!res.ok) throw new Error('Toggle failed');
      const data = await res.json();
      if (data.updated?.[0]) {
        setBars(prev => prev.map(b => b.id === bar.id ? data.updated[0] : b));
      }
    } catch {
      showToast(`Failed to toggle ${field}`, 'error');
    }
  };

  const deleteBar = async (bar: Bar) => {
    if (!confirm(`Delete \"${bar.name}\"? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/manage-bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify({ action: 'delete', barId: bar.id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setBars(prev => prev.filter(b => b.id !== bar.id));
      setEditingBar(null);
      showToast(`${bar.name} deleted`, 'success');
    } catch {
      showToast('Failed to delete bar', 'error');
    }
  };

  // Filtered + sorted bars
  const filteredBars = useMemo(() => {
    const q = search.toLowerCase();
    const result = bars.filter(bar => {
      const matchSearch = !search ||
        bar.name.toLowerCase().includes(q) ||
        bar.city.toLowerCase().includes(q) ||
        bar.country.toLowerCase().includes(q) ||
        (bar.slug && bar.slug.toLowerCase().includes(q));
      const matchCountry = !countryFilter || bar.country === countryFilter;
      const matchType = !typeFilter || bar.type === typeFilter;
      return matchSearch && matchCountry && matchType;
    });

    result.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [bars, search, countryFilter, typeFilter, sortKey, sortAsc]);

  const countries = useMemo(() => Array.from(new Set(bars.map(b => b.country))).sort(), [bars]);
  const types = useMemo(() => Array.from(new Set(bars.map(b => b.type))).sort(), [bars]);

  const toggleSort = (key: keyof Bar) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // --- Login screen ---
  if (!authed) {
    return (
      <div style={styles.loginWrap}>
        <div style={styles.loginCard}>
          <h1 style={styles.loginTitle}>Bar Directory Admin</h1>
          <p style={styles.loginSub}>Enter admin password to continue</p>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={styles.loginInput}
              autoFocus
            />
            <button type="submit" style={styles.loginBtn} disabled={loading}>
              {loading ? 'Checking...' : 'Sign In'}
            </button>
          </form>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );
  }

  // --- Main admin UI ---
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Bar Directory Admin</h1>
          <span style={styles.badge}>{filteredBars.length} / {bars.length} bars</span>
            <Link href="/admin/submissions" style={styles.submissionsLink}>Submissions</Link>
        </div>
        <button
          style={styles.logoutBtn}
          onClick={() => { sessionStorage.removeItem('admin_secret'); setAuthed(false); setAdminSecret(''); }}
        >
          Sign Out
        </button>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, opacity: 0.4 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search bars..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} style={styles.clearBtn}>✕</button>
          )}
        </div>
        <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} style={styles.select}>
          <option value="">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={styles.select}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.loading}>Loading bars...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {TABLE_COLUMNS.map(col => (
                  <th
                    key={col.key}
                    style={{ ...styles.th, width: col.width, cursor: 'pointer' }}
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span style={{ marginLeft: 4, fontSize: 10 }}>{sortAsc ? '▲' : '▼'}</span>
                    )}
                  </th>
                ))}
                <th style={{ ...styles.th, width: '60px' }}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredBars.map(bar => (
                <tr key={bar.id} style={styles.tr}>
                  <td style={styles.td}>
                    <a href={`/bars/${bar.slug}`} target="_blank" rel="noopener noreferrer" style={styles.nameLink}>
                      {bar.name}
                    </a>
                  </td>
                  <td style={styles.td}>{bar.city}</td>
                  <td style={styles.td}>{bar.country}</td>
                  <td style={styles.td}>{bar.type}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.tierBadge,
                      ...(bar.tier === 'premium' ? styles.tierPremium : bar.tier === 'featured' ? styles.tierFeatured : {}),
                    }}>
                      {bar.tier}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => quickToggle(bar, 'is_active')}
                      style={{ ...styles.toggleBtn, background: bar.is_active ? '#22c55e' : '#ef4444' }}
                      title={bar.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                    >
                      {bar.is_active ? '✓' : '✕'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    {bar.photos?.length > 0 ? (
                      <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>{bar.photos.length}</span>
                    ) : (
                      <span style={{ color: '#9a9089', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {bar.wp_article_slug ? (
                      <span style={{ color: '#22c55e', fontSize: 12 }}>✓</span>
                    ) : (
                      <span style={{ color: '#9a9089', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => openEditor(bar)} style={styles.editBtn}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingBar && (
        <div style={styles.modalOverlay} onClick={() => !saving && setEditingBar(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit: {editingBar.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => deleteBar(editingBar)} style={styles.deleteBtn} disabled={saving}>Delete Bar</button>
              <button onClick={() => !saving && setEditingBar(null)} style={styles.modalClose}>✕</button>
            </div>
            </div>
            <div style={styles.modalBody}>
              {EDITABLE_FIELDS.map(field => {
                if (field === 'is_active' || field === 'is_verified') {
                  return (
                    <label key={field} style={styles.fieldRow}>
                      <span style={styles.fieldLabel}>{field}</span>
                      <input
                        type="checkbox"
                        checked={editValues[field] as boolean}
                        onChange={e => setEditValues(prev => ({ ...prev, [field]: e.target.checked }))}
                        style={{ width: 18, height: 18 }}
                      />
                    </label>
                  );
                }
                if (field === 'type') {
                  return (
                    <label key={field} style={styles.fieldRow}>
                      <span style={styles.fieldLabel}>{field}</span>
                      <select
                        value={(editValues[field] as string) || ''}
                        onChange={e => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
                        style={styles.fieldInput}
                      >
                        {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        {!TYPE_OPTIONS.includes(editValues[field] as string) && (
                          <option value={editValues[field] as string}>{editValues[field] as string}</option>
                        )}
                      </select>
                    </label>
                  );
                }
                if (field === 'tier') {
                  return (
                    <label key={field} style={styles.fieldRow}>
                      <span style={styles.fieldLabel}>{field}</span>
                      <select
                        value={(editValues[field] as string) || 'free'}
                        onChange={e => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
                        style={styles.fieldInput}
                      >
                        {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                  );
                }
                if (field === 'description') {
                  return (
                    <label key={field} style={styles.fieldRow}>
                      <span style={styles.fieldLabel}>{field}</span>
                      <textarea
                        value={(editValues[field] as string) || ''}
                        onChange={e => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
                        style={{ ...styles.fieldInput, minHeight: 80, resize: 'vertical' as const }}
                        rows={3}
                      />
                    </label>
                  );
                }
                return (
                  <label key={field} style={styles.fieldRow}>
                    <span style={styles.fieldLabel}>{field}</span>
                    <input
                      type="text"
                      value={(editValues[field] as string) || ''}
                      onChange={e => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
                      style={styles.fieldInput}
                    />
                  </label>
                );
              })}
            <PhotoManager
              barId={editingBar.id}
                             photos={editingBar.photos || []}
              adminSecret={adminSecret}
              onUpdate={(updatedBar) => {
                setBars(prev => prev.map(b => b.id === editingBar.id ? { ...b, photos: updatedBar.photos } : b));
                setEditingBar(prev => prev ? { ...prev, photos: updatedBar.photos } : prev);
              }}
            />
          </div>
          <div style={styles.modalFooter}>
              <button onClick={() => setEditingBar(null)} style={styles.cancelBtn} disabled={saving}>Cancel</button>
              <button onClick={saveChanges} style={styles.saveBtn} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      padding: '12px 20px',
      borderRadius: 10,
      background: type === 'success' ? '#1a1a1a' : '#dc2626',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      zIndex: 10000,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    }}>
      {message}
    </div>
  );
}

// Inline styles to avoid touching globals.css
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '24px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#1a1a1a',
  },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6b6b6b',
    background: '#f0ebe5',
    padding: '4px 10px',
    borderRadius: 100,
  },
  logoutBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: '#6b6b6b',
    background: 'transparent',
    border: '1px solid #e0d8d0',
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap' as const,
  },
  searchWrap: {
    flex: 1,
    minWidth: 200,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    border: '1.5px solid #e0d8d0',
    borderRadius: 10,
    background: '#fff',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'none',
    width: '100%',
    fontSize: 14,
    fontFamily: 'inherit',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#9a9089',
    cursor: 'pointer',
    fontSize: 14,
    padding: 0,
  },
  select: {
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 30px 8px 14px',
    borderRadius: 10,
    border: '1.5px solid #e0d8d0',
    background: '#fff',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B6B6B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    cursor: 'pointer',
    color: '#1a1a1a',
  },
  tableWrap: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e0d8d0',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#9a9089',
    borderBottom: '1px solid #e0d8d0',
    background: '#faf7f4',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1,
    whiteSpace: 'nowrap' as const,
    userSelect: 'none' as const,
  },
  tr: {
    borderBottom: '1px solid #f0ebe5',
  },
  td: {
    padding: '9px 12px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 200,
  },
  nameLink: {
    color: '#1a1a1a',
    fontWeight: 600,
    textDecoration: 'none',
  },
  tierBadge: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
    padding: '3px 8px',
    borderRadius: 6,
    background: '#f0ebe5',
    color: '#6b6b6b',
  },
  tierPremium: {
    background: '#C4603C',
    color: '#fff',
  },
  tierFeatured: {
    background: '#1a1a1a',
    color: '#fff',
  },
  toggleBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: 'none',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  editBtn: {
    fontSize: 12,
    fontWeight: 600,
    color: '#C4603C',
    background: 'none',
    border: '1px solid #C4603C',
    borderRadius: 6,
    padding: '4px 12px',
    cursor: 'pointer',
  },
  loading: {
    padding: 40,
    textAlign: 'center' as const,
    color: '#9a9089',
    fontSize: 14,
  },
  // Modal
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e0d8d0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    color: '#9a9089',
    padding: 4,
  },
  modalBody: {
    padding: '20px 24px',
    overflowY: 'auto' as const,
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6b6b6b',
    width: 110,
    flexShrink: 0,
    paddingTop: 8,
    textTransform: 'capitalize' as const,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    padding: '7px 12px',
    border: '1.5px solid #e0d8d0',
    borderRadius: 8,
    outline: 'none',
    fontFamily: 'inherit',
    color: '#1a1a1a',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 24px',
    borderTop: '1px solid #e0d8d0',
  },
  cancelBtn: {
    fontSize: 14,
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #e0d8d0',
    background: '#fff',
    color: '#6b6b6b',
    cursor: 'pointer',
  },
  saveBtn: {
    fontSize: 14,
    fontWeight: 600,
    padding: '10px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#1a1a1a',
    color: '#fff',
    cursor: 'pointer',
  },
  // Login
  loginWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F5F0EB',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loginCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 380,
    textAlign: 'center' as const,
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: 6,
  },
  loginSub: {
    fontSize: 14,
    color: '#6b6b6b',
    marginBottom: 24,
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  loginInput: {
    fontSize: 15,
    padding: '12px 16px',
    border: '1.5px solid #e0d8d0',
    borderRadius: 10,
    outline: 'none',
    fontFamily: 'inherit',
    textAlign: 'center' as const,
  },
  submissionsLink: {
    fontSize: 13,
    fontWeight: 600,
    color: '#C4603C',
    border: '1px solid #C4603C',
    borderRadius: 100,
    padding: '4px 14px',
    textDecoration: 'none',
  },
  deleteBtn: {
    fontSize: 12,
    fontWeight: 600,
    color: '#dc2626',
    background: 'none',
    border: '1px solid #dc2626',
    borderRadius: 8,
    padding: '6px 14px',
    cursor: 'pointer',
  },
  loginBtn: {
    fontSize: 15,
    fontWeight: 600,
    padding: '12px 20px',
    borderRadius: 10,
    border: 'none',
    background: '#1a1a1a',
    color: '#fff',
    cursor: 'pointer',
  },
};
