'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminTable, DataState, PageHeader } from '@/components/admin/ui';
import { useAdminData } from '@/hooks/useAdminData';
import { formatPrice, normalizeText } from '@/lib/utils/format';
import { getAvailableStock } from '@/lib/utils/product';

export default function ProductsAdminPage() {
  const { data, error, loading, reload } = useAdminData('/api/admin/products');
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const n = normalizeText(q);
    return (data?.items || []).filter((p) => !n || normalizeText(`${p.name} ${p.sku} ${p.brand}`).includes(n));
  }, [data, q]);

  return (
    <>
      <PageHeader title="Productos" action={<Link href="/admin/products/new" className="btn btn-primary"><Plus className="h-4 w-4" aria-hidden="true" /> Nuevo producto</Link>} />
      <div className="mb-4 max-w-sm">
        <label htmlFor="q" className="sr-only">Buscar productos</label>
        <input id="q" type="search" className="input" placeholder="Buscar por nombre, SKU o marca" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <DataState loading={loading} error={error} reload={reload}>
        <AdminTable
          rows={rows}
          empty={q ? 'Sin resultados.' : 'Aún no hay productos. Crea el primero.'}
          columns={[
            { key: 'name', label: 'Producto', render: (p) => <Link href={`/admin/products/${p.id}`} className="font-semibold underline">{p.name}</Link> },
            { key: 'sku', label: 'SKU' },
            { key: 'price', label: 'Precio', render: (p) => formatPrice(p.price) },
            { key: 'stock', label: 'Stock', render: (p) => getAvailableStock(p) },
            { key: 'isActive', label: 'Estado', render: (p) => <span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>{p.isActive ? 'Publicado' : 'Borrador'}</span> },
          ]}
        />
      </DataState>
    </>
  );
}
