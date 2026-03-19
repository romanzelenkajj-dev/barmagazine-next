import type { Metadata } from 'next';
import AdminBarsClient from './AdminBarsClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Admin — Bar Directory',
};

export default function AdminBarsPage() {
  return <AdminBarsClient />;
}
