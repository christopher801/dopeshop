'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { DataState, PageHeader, StatusBadge } from '@/components/admin/ui';
import { ORDER_STATUSES, TERMINAL_STATUSES } from '@/constants';
import { useToast } from '@/context/ToastContext';
import { useAdminData } from '@/hooks/useAdminData';
import { apiFetch } from '@/lib/utils/api';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const { data, error, loading, reload } = useAdminData(`/api/admin/orders/${id}`);
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const o = data?.item;

  async function apply(payload) {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: payload, auth: true });
      toast('Pedido actualizado.');
      setNote('');
      setStatus('');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const closed = o && TERMINAL_STATUSES.includes(o.status);
  const wa = o ? buildWhatsAppLink(`Hola ${o.customer?.name}, te escribimos de DOPE SHOP sobre tu pedido ${o.orderNumber}.`, String(o.customer?.phone || '').replace(/\D/g, '')) : null;

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Pedidos</Link>
      <DataState loading={loading} error={error} reload={reload}>
        {o && (
          <>
            <PageHeader title={`Pedido ${o.orderNumber}`} description={formatDate(o.createdAt, true)} action={<StatusBadge status={o.status} />} />
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <section className="card p-5">
                  <h2 className="mb-3 text-lg">Productos</h2>
                  <ul className="divide-y divide-line text-sm">
                    {o.items.map((it, i) => (
                      <li key={i} className="flex justify-between gap-3 py-2">
                        <span>{it.name}{it.variantLabel ? ` (${it.variantLabel})` : ''} <span className="text-muted">× {it.quantity} · SKU {it.sku}</span></span>
                        <span className="font-semibold">{formatPrice(it.price * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                    <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
                    {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Descuento {o.promoCode && `(${o.promoCode})`}</dt><dd>-{formatPrice(o.discount)}</dd></div>}
                    <div className="flex justify-between"><dt className="text-muted">Envío estimado</dt><dd>{formatPrice(o.shipping)}</dd></div>
                    <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(o.total)}</dd></div>
                  </dl>
                </section>

                <section className="card p-5">
                  <h2 className="mb-3 text-lg">Cliente y entrega</h2>
                  <dl className="grid gap-1 text-sm sm:grid-cols-[130px_1fr]">
                    <dt className="text-muted">Nombre</dt><dd>{o.customer?.name}</dd>
                    <dt className="text-muted">WhatsApp</dt><dd>{o.customer?.phone}</dd>
                    {o.customer?.email && <><dt className="text-muted">Correo</dt><dd>{o.customer.email}</dd></>}
                    <dt className="text-muted">Entrega</dt><dd>{o.customer?.deliveryMethod === 'delivery' ? 'Entrega a domicilio' : 'Retiro en tienda'}</dd>
                    {o.customer?.province && <><dt className="text-muted">Provincia/Ciudad</dt><dd>{o.customer.province}</dd></>}
                    {o.customer?.address && <><dt className="text-muted">Dirección</dt><dd>{o.customer.address}</dd></>}
                    {o.customer?.notes && <><dt className="text-muted">Nota del cliente</dt><dd>{o.customer.notes}</dd></>}
                    <dt className="text-muted">Cuenta</dt><dd>{o.userId ? 'Cliente registrado' : 'Invitado'}</dd>
                  </dl>
                  {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm mt-4"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Escribir al cliente</a>}
                </section>

                <section className="card p-5">
                  <h2 className="mb-3 text-lg">Historial de estados</h2>
                  <ol className="space-y-2 text-sm">
                    {[...(o.statusHistory || [])].reverse().map((h, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-2"><StatusBadge status={h.status} /><span className="text-muted">{formatDate(h.at, true)} · {h.by}{h.note ? ` — ${h.note}` : ''}</span></li>
                    ))}
                  </ol>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="card space-y-3 p-5">
                  <h2 className="text-lg">Actualizar estado</h2>
                  {closed ? <p className="text-sm text-muted">Este pedido está cerrado.</p> : (
                    <>
                      <label htmlFor="status" className="sr-only">Nuevo estado</label>
                      <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">Selecciona un estado…</option>
                        {Object.entries(ORDER_STATUSES).filter(([k]) => k !== o.status).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <p className="text-xs text-muted">{o.stockDeducted ? 'El stock ya fue descontado. Cancelar o volver a pendiente lo restituye.' : 'Al confirmar el pedido se descuenta el stock automáticamente.'}</p>
                      <button type="button" className="btn btn-primary w-full" disabled={!status || busy} onClick={() => apply({ status, ...(note ? { note } : {}) })}>{busy ? 'Guardando…' : 'Aplicar estado'}</button>
                    </>
                  )}
                </section>
                <section className="card space-y-3 p-5">
                  <h2 className="text-lg">Notas internas</h2>
                  <ul className="space-y-2 text-sm">
                    {(o.internalNotes || []).map((n, i) => <li key={i} className="rounded-control bg-gray-50 p-2">{n.text}<span className="mt-1 block text-xs text-muted">{n.by} · {formatDate(n.at, true)}</span></li>)}
                    {!(o.internalNotes || []).length && <li className="text-muted">Sin notas.</li>}
                  </ul>
                  <label htmlFor="note" className="sr-only">Nueva nota</label>
                  <textarea id="note" rows={2} className="input" maxLength={500} placeholder="Agregar nota interna…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button type="button" className="btn btn-outline w-full" disabled={!note.trim() || busy} onClick={() => apply({ note: note.trim() })}>Guardar nota</button>
                </section>
              </aside>
            </div>
          </>
        )}
      </DataState>
    </>
  );
}
