'use client';

import { useMemo, useState } from 'react';
import Field from '@/components/ui/Field';
import { AdminTable, DataState, PageHeader } from '@/components/admin/ui';
import { useToast } from '@/context/ToastContext';
import { useAdminData } from '@/hooks/useAdminData';
import { apiFetch } from '@/lib/utils/api';
import { formatDate, normalizeText } from '@/lib/utils/format';
import { getAvailableStock } from '@/lib/utils/product';

export default function InventoryPage() {
  const { data, error, loading, reload } = useAdminData('/api/admin/inventory');
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({ variantId: '', mode: 'adjust', quantity: '', reason: '' });
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const n = normalizeText(q);
    return (data?.products || []).filter((p) => {
      const s = getAvailableStock(p);
      if (filter === 'out' && s > 0) return false;
      if (filter === 'low' && !(s > 0 && s <= p.lowStockThreshold)) return false;
      return !n || normalizeText(`${p.name} ${p.sku} ${p.brand}`).includes(n);
    });
  }, [data, q, filter]);

  async function adjust(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch('/api/admin/inventory', { method: 'POST', auth: true, body: { productId: sel.id, variantId: form.variantId || null, mode: form.mode, quantity: Number(form.quantity), reason: form.reason } });
      toast('Inventario actualizado.');
      setSel(null);
      setForm({ variantId: '', mode: 'adjust', quantity: '', reason: '' });
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const products = new Map((data?.products || []).map((p) => [p.id, p]));
  return (
    <>
      <PageHeader title="Inventario" description="El stock solo se descuenta al confirmar pedidos o con ajustes manuales registrados." />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="min-w-[220px] flex-1"><label htmlFor="q" className="sr-only">Buscar</label><input id="q" type="search" className="input" placeholder="Buscar producto o SKU" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select aria-label="Filtro de stock" className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todo el stock</option><option value="low">Stock bajo</option><option value="out">Agotados</option>
        </select>
      </div>
      <DataState loading={loading} error={error} reload={reload}>
        {sel && (
          <form onSubmit={adjust} className="card mb-6 space-y-3 p-5">
            <h2 className="text-lg">Ajustar: {sel.name}</h2>
            <div className="grid gap-3 md:grid-cols-4">
              {sel.variants.length > 0 && (
                <Field id="variant" label="Variante" required>
                  <select id="variant" className="input" required value={form.variantId} onChange={(e) => setForm({ ...form, variantId: e.target.value })}>
                    <option value="">Selecciona…</option>{sel.variants.map((v) => <option key={v.id} value={v.id}>{v.label} ({v.stock})</option>)}
                  </select>
                </Field>
              )}
              <Field id="mode" label="Tipo">
                <select id="mode" className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                  <option value="adjust">Sumar / restar</option><option value="set">Fijar cantidad</option>
                </select>
              </Field>
              <Field id="qty" label={form.mode === 'set' ? 'Nueva cantidad' : 'Cantidad (+/-)'} required><input id="qty" required inputMode="numeric" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
              <Field id="reason" label="Motivo" required><input id="reason" required minLength={3} className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
            </div>
            <div className="flex gap-2"><button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar ajuste'}</button><button type="button" className="btn btn-outline" onClick={() => setSel(null)}>Cancelar</button></div>
          </form>
        )}
        <AdminTable
          rows={rows}
          empty="Sin productos."
          columns={[
            { key: 'name', label: 'Producto', render: (p) => <span className="font-semibold">{p.name}</span> },
            { key: 'sku', label: 'SKU' },
            { key: 'stock', label: 'Stock', render: (p) => { const s = getAvailableStock(p); return <span className={`badge ${s <= 0 ? 'badge-red' : s <= p.lowStockThreshold ? 'badge-amber' : 'badge-green'}`}>{s}</span>; } },
            { key: 'a', label: '', render: (p) => <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSel(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ajustar</button> },
          ]}
        />
        <h2 className="mb-3 mt-8 text-lg">Historial reciente</h2>
        <AdminTable
          rows={data?.history || []}
          empty="Aún no hay movimientos."
          columns={[
            { key: 'productName', label: 'Producto', render: (h) => h.productName || products.get(h.productId)?.name || h.productId },
            { key: 'previous', label: 'Antes' },
            { key: 'newQuantity', label: 'Después' },
            { key: 'adjustment', label: 'Ajuste', render: (h) => (h.adjustment > 0 ? `+${h.adjustment}` : h.adjustment) },
            { key: 'reason', label: 'Motivo' },
            { key: 'adminEmail', label: 'Admin', render: (h) => h.adminEmail || h.adminId },
            { key: 'createdAt', label: 'Fecha', render: (h) => formatDate(h.createdAt, true) },
          ]}
        />
      </DataState>
    </>
  );
}
