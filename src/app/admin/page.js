'use client';

import Link from 'next/link';
import { AdminTable, DataState, PageHeader, StatCard, StatusBadge } from '@/components/admin/ui';
import { useAdminData } from '@/hooks/useAdminData';
import { formatDate, formatPrice } from '@/lib/utils/format';

export default function DashboardPage() {
  const { data, error, loading, reload } = useAdminData('/api/admin/stats');
  return (
    <>
      <PageHeader title="Dashboard" description="Datos reales de tu tienda. Los ingresos solo cuentan pedidos confirmados por un administrador." />
      <DataState loading={loading} error={error} reload={reload}>
        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Productos" value={data.products.total} hint={`${data.products.active} activos`} href="/admin/products" />
              <StatCard label="Agotados" value={data.products.outOfStock} href="/admin/inventory" />
              <StatCard label="Stock bajo" value={data.products.lowStock} href="/admin/inventory" />
              <StatCard label="Ingresos confirmados" value={formatPrice(data.revenue)} />
              <StatCard label="Pedidos" value={data.orders.total} href="/admin/orders" />
              <StatCard label="Pendientes" value={data.orders.pending} href="/admin/orders" />
              <StatCard label="Confirmados / en curso" value={data.orders.confirmed} />
              <StatCard label="Entregados" value={data.orders.delivered} />
            </div>

            <section>
              <h2 className="mb-3 text-lg">Ventas confirmadas (últimos 6 meses)</h2>
              {data.revenue > 0 ? (
                <div className="card flex h-48 items-end gap-3 p-4" role="img" aria-label="Gráfico de ventas mensuales">
                  {(() => {
                    const max = Math.max(...data.monthly.map((m) => m.total), 1);
                    return data.monthly.map((m) => (
                      <div key={m.key} className="flex flex-1 flex-col items-center justify-end gap-1">
                        <span className="text-[10px] text-muted">{m.total ? formatPrice(m.total) : ''}</span>
                        <div className="w-full rounded-t bg-ink" style={{ height: `${Math.max((m.total / max) * 100, m.total ? 4 : 0)}%` }} />
                        <span className="text-xs capitalize text-muted">{m.label}</span>
                      </div>
                    ));
                  })()}
                </div>
              ) : <div className="card p-6 text-center text-sm text-muted">Aún no hay ventas confirmadas para graficar.</div>}
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section>
                <h2 className="mb-3 text-lg">Pedidos recientes</h2>
                <AdminTable
                  rows={data.recentOrders}
                  empty="Todavía no hay pedidos."
                  columns={[
                    { key: 'orderNumber', label: 'Pedido', render: (o) => <Link href={`/admin/orders/${o.id}`} className="font-semibold underline">{o.orderNumber}</Link> },
                    { key: 'status', label: 'Estado', render: (o) => <StatusBadge status={o.status} /> },
                    { key: 'total', label: 'Total', render: (o) => formatPrice(o.total) },
                    { key: 'createdAt', label: 'Fecha', render: (o) => formatDate(o.createdAt) },
                  ]}
                />
              </section>
              <section>
                <h2 className="mb-3 text-lg">Más vendidos (pedidos confirmados)</h2>
                <AdminTable
                  rows={data.topProducts}
                  rowKey={(r) => r.productId}
                  empty="Se mostrarán cuando existan pedidos confirmados."
                  columns={[
                    { key: 'name', label: 'Producto' },
                    { key: 'units', label: 'Unidades' },
                    { key: 'revenue', label: 'Ingresos', render: (r) => formatPrice(r.revenue) },
                  ]}
                />
              </section>
            </div>
          </div>
        )}
      </DataState>
    </>
  );
}
