'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminTable, DataState, PageHeader, StatusBadge } from '@/components/admin/ui';
import { useAdminData } from '@/hooks/useAdminData';
import { formatDate, formatPrice, normalizeText } from '@/lib/utils/format';

export default function CustomersPage() {
  const { data, error, loading, reload } = useAdminData('/api/admin/customers');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const rows = useMemo(() => {
    const n = normalizeText(q);
    return (data?.items || []).filter((c) => !n || normalizeText(`${c.name} ${c.email} ${c.phone}`).includes(n));
  }, [data, q]);
  const selected = rows.find((c) => c.id === openId);
  return (
    <>
      <PageHeader title="Clientes" description="Clientes con cuenta. Los pedidos de invitados se ven en Pedidos." />
      <div className="mb-4 max-w-sm"><label htmlFor="q" className="sr-only">Buscar clientes</label><input id="q" type="search" className="input" placeholder="Nombre, correo o teléfono" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <DataState loading={loading} error={error} reload={reload}>
        <AdminTable
          rows={rows}
          empty="Aún no hay clientes registrados."
          onRowClick={(c) => setOpenId(c.id === openId ? null : c.id)}
          columns={[
            { key: 'name', label: 'Nombre', render: (c) => <span className="font-semibold">{c.name || '—'}</span> },
            { key: 'email', label: 'Correo' },
            { key: 'phone', label: 'Teléfono', render: (c) => c.phone || '—' },
            { key: 'orderCount', label: 'Pedidos' },
            { key: 'createdAt', label: 'Registro', render: (c) => formatDate(c.createdAt) },
          ]}
        />
        {selected && (
          <section className="card mt-6 p-5" aria-live="polite">
            <h2 className="text-lg">Pedidos de {selected.name || selected.email}</h2>
            {selected.orders.length ? (
              <ul className="mt-3 divide-y divide-line text-sm">
                {selected.orders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <Link href={`/admin/orders/${o.id}`} className="font-semibold underline">{o.orderNumber}</Link>
                    <StatusBadge status={o.status} /><span>{formatPrice(o.total)}</span><span className="text-muted">{formatDate(o.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-muted">Sin pedidos.</p>}
          </section>
        )}
      </DataState>
    </>
  );
}
