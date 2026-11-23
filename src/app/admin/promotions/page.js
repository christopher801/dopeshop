'use client';

import { useState } from 'react';
import Field from '@/components/ui/Field';
import { AdminTable, DataState, PageHeader } from '@/components/admin/ui';
import { useToast } from '@/context/ToastContext';
import { useAdminData } from '@/hooks/useAdminData';
import { apiFetch } from '@/lib/utils/api';
import { formatDate, formatPrice } from '@/lib/utils/format';

const EMPTY = { name: '', code: '', type: 'percentage', value: '', minPurchase: 0, startDate: '', endDate: '', usageLimit: '', isActive: true };
const toInput = (ms) => (ms ? new Date(ms).toISOString().slice(0, 10) : '');

export default function PromotionsPage() {
  const { data, error, loading, reload } = useAdminData('/api/admin/promotions');
  const { toast } = useToast();
  const [f, setF] = useState(null);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const body = {
        name: f.name, code: f.code, type: f.type, value: Number(f.value), minPurchase: Number(f.minPurchase) || 0, isActive: f.isActive,
        startDate: f.startDate ? new Date(`${f.startDate}T00:00:00`).getTime() : null,
        endDate: f.endDate ? new Date(`${f.endDate}T23:59:59`).getTime() : null,
        usageLimit: f.usageLimit === '' ? null : Number(f.usageLimit),
      };
      await apiFetch(editId ? `/api/admin/promotions/${editId}` : '/api/admin/promotions', { method: editId ? 'PUT' : 'POST', body, auth: true });
      toast('Promoción guardada.');
      setF(null);
      reload();
    } catch (err) {
      setErrors(err.details || {});
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove(p) {
    if (!window.confirm(`¿Eliminar la promoción ${p.code}?`)) return;
    try {
      await apiFetch(`/api/admin/promotions/${p.id}`, { method: 'DELETE', auth: true });
      toast('Promoción eliminada.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageHeader title="Promociones" description="Los descuentos se calculan y validan siempre en el servidor al crear el pedido." action={<button type="button" className="btn btn-primary" onClick={() => { setEditId(null); setF({ ...EMPTY }); }}>Nueva promoción</button>} />
      {f && (
        <form onSubmit={save} noValidate className="card mb-6 space-y-4 p-5">
          <h2 className="text-lg">{editId ? 'Editar promoción' : 'Nueva promoción'}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field id="p-name" label="Nombre" error={errors.name?.[0]} required><input id="p-name" className="input" value={f.name} onChange={set('name')} /></Field>
            <Field id="p-code" label="Código" error={errors.code?.[0]} required><input id="p-code" className="input uppercase" value={f.code} onChange={set('code')} /></Field>
            <Field id="p-type" label="Tipo"><select id="p-type" className="input" value={f.type} onChange={set('type')}><option value="percentage">Porcentaje (%)</option><option value="fixed">Monto fijo (RD$)</option></select></Field>
            <Field id="p-value" label={f.type === 'percentage' ? 'Porcentaje' : 'Monto (RD$)'} error={errors.value?.[0]} required><input id="p-value" inputMode="decimal" className="input" value={f.value} onChange={set('value')} /></Field>
            <Field id="p-min" label="Compra mínima (RD$)"><input id="p-min" inputMode="decimal" className="input" value={f.minPurchase} onChange={set('minPurchase')} /></Field>
            <Field id="p-limit" label="Límite de usos" hint="Vacío = sin límite."><input id="p-limit" inputMode="numeric" className="input" value={f.usageLimit} onChange={set('usageLimit')} /></Field>
            <Field id="p-start" label="Inicio"><input id="p-start" type="date" className="input" value={f.startDate} onChange={set('startDate')} /></Field>
            <Field id="p-end" label="Fin" error={errors.endDate?.[0]}><input id="p-end" type="date" className="input" value={f.endDate} onChange={set('endDate')} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-ink" checked={f.isActive} onChange={set('isActive')} /> Activa</label>
          <div className="flex gap-2"><button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button><button type="button" className="btn btn-outline" onClick={() => setF(null)}>Cancelar</button></div>
        </form>
      )}
      <DataState loading={loading} error={error} reload={reload}>
        <AdminTable
          rows={data?.items || []}
          empty="Aún no hay promociones."
          columns={[
            { key: 'code', label: 'Código', render: (p) => <span className="font-mono font-semibold">{p.code}</span> },
            { key: 'name', label: 'Nombre' },
            { key: 'value', label: 'Descuento', render: (p) => (p.type === 'percentage' ? `${p.value}%` : formatPrice(p.value)) },
            { key: 'vigencia', label: 'Vigencia', render: (p) => (p.startDate || p.endDate ? `${formatDate(p.startDate)} – ${formatDate(p.endDate)}` : 'Siempre') },
            { key: 'usedCount', label: 'Usos', render: (p) => `${p.usedCount || 0}${p.usageLimit ? ` / ${p.usageLimit}` : ''}` },
            { key: 'isActive', label: 'Estado', render: (p) => <span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>{p.isActive ? 'Activa' : 'Inactiva'}</span> },
            { key: 'a', label: '', render: (p) => (
              <span className="flex gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditId(p.id); setF({ ...EMPTY, ...p, startDate: toInput(p.startDate), endDate: toInput(p.endDate), usageLimit: p.usageLimit ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Editar</button>
                <button type="button" className="btn btn-outline btn-sm text-red-700" onClick={() => remove(p)}>Eliminar</button>
              </span>
            ) },
          ]}
        />
      </DataState>
    </>
  );
}
