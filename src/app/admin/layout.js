import AdminShell from '@/components/admin/AdminShell';

export const metadata = { title: { default: 'Administración', template: '%s | Admin DOPE SHOP' }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
