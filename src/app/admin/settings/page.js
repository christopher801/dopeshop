import Link from 'next/link';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'Ajustes' };

export default function SettingsIndex() {
  return (
    <>
      <PageHeader title="Ajustes" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/settings/store" className="card block p-5 hover:shadow-lift"><h2 className="text-lg">Tienda</h2><p className="mt-1 text-sm text-muted">Contacto, WhatsApp, entrega, redes y anuncios.</p></Link>
        <Link href="/admin/settings/seo" className="card block p-5 hover:shadow-lift"><h2 className="text-lg">SEO</h2><p className="mt-1 text-sm text-muted">Título y descripción por defecto.</p></Link>
      </div>
    </>
  );
}
