'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminTable, DataState, PageHeader, StatusBadge } from '@/components/admin/ui';
import { ORDER_STATUSES } from '@/constants';
import { useAdminData } from '@/hooks/useAdminData';
import { formatDate, formatPrice, normalizeText } from '@/lib/utils/format';

export default function OrdersAdminPage() {
  const { data, error, loading, reload } = useAdminData('/api/admin/orders');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const rows = useMemo(() => {
    const n = normalizeText(q);
    return (data?.items || []).filter((o) => (!status || o.status === status) && (!n || normalizeText(`${o.orderNumber} ${o.customer?.name} ${o.customer?.phone}`).includes(n)));
  }, [data, q, status]);
  return (
    <>
      <PageHeader title="Pedidos" description="Los pedidos se registran antes de abrir WhatsApp y nunca se eliminan." />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="min-w-[220px] flex-1"><label htmlFor="q" className="sr-only">Buscar pedidos</label><input id="q" type="search" className="input" placeholder="Número, cliente o teléfono" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div><label htmlFor="st" className="sr-only">Estado</label>
          <select id="st" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(ORDER_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select></div>
      </div>
      <DataState loading={loading} error={error} reload={reload}>
        <AdminTable
          rows={rows}
          empty="No hay pedidos con esos criterios."
          columns={[
            { key: 'orderNumber', label: 'Pedido', render: (o) => <Link href={`/admin/orders/${o.id}`} className="font-semibold underline">{o.orderNumber}</Link> },
            { key: 'customer', label: 'Cliente', render: (o) => o.customer?.name },
            { key: 'status', label: 'Estado', render: (o) => <StatusBadge status={o.status} /> },
            { key: 'total', label: 'Total', render: (o) => formatPrice(o.total) },
            { key: 'createdAt', label: 'Fecha', render: (o) => formatDate(o.createdAt, true) },
          ]}
        />
      </DataState>
    </>
  );
}
