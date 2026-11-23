'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, MessageCircle, ShoppingBag } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Field from '@/components/ui/Field';
import Spinner from '@/components/ui/Spinner';
import { DELIVERY_METHODS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { customerSchema } from '@/lib/validations/schemas';
import { apiFetch } from '@/lib/utils/api';
import { formatPrice } from '@/lib/utils/format';
import { buildOrderMessage, buildWhatsAppLink } from '@/lib/whatsapp';

const EMPTY = { name: '', phone: '', email: '', deliveryMethod: 'pickup', province: '', address: '', notes: '' };

export default function CheckoutClient() {
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...EMPTY });
  const [promoCode, setPromoCode] = useState('');
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('data'); // data | review | done
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const prefilled = { name: form.name || user?.displayName || '', email: form.email || user?.email || '' };
  const body = (dryRun) => ({
    items: cart.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    customer: { ...form, ...prefilled },
    promoCode: promoCode.trim(),
    dryRun,
  });

  if (!cart.ready) return <Spinner />;
  if (step !== 'done' && !cart.items.length) {
    return <EmptyState icon={ShoppingBag} title="Tu carrito está vacío" description="Agrega productos para generar tu pedido." actionHref="/shop" actionLabel="Explorar productos" />;
  }

  async function review(e) {
    e.preventDefault();
    setServerError('');
    const parsed = customerSchema.safeParse({ ...form, ...prefilled });
    if (!parsed.success) {
      const errs = {};
      for (const issue of parsed.error.issues) errs[issue.path[0]] ||= issue.message;
      setErrors(errs);
      toast('Revisa los campos marcados.', 'error');
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const data = await apiFetch('/api/orders', { method: 'POST', body: body(true), auth: Boolean(user) });
      setQuote(data.quote);
      setStep('review');
      window.scrollTo({ top: 0 });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setServerError('');
    setBusy(true);
    try {
      const data = await apiFetch('/api/orders', { method: 'POST', body: body(false), auth: Boolean(user) });
      const message = buildOrderMessage(data.order);
      const link = buildWhatsAppLink(message, data.whatsapp);
      setResult({ order: data.order, message, link });
      setStep('done');
      cart.clear();
      if (link) window.open(link, '_blank', 'noopener');
    } catch (err) {
      setServerError(err.message);
      setStep('data');
    } finally {
      setBusy(false);
    }
  }

  if (step === 'done' && result) {
    return (
      <div className="card mx-auto max-w-xl space-y-4 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden="true" />
        <h2 className="text-xl">Pedido registrado: {result.order.orderNumber}</h2>
        <p className="rounded-control bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>Importante:</strong> tu pedido aún <strong>no está confirmado</strong>. Debes enviar el mensaje por WhatsApp; la tienda confirmará disponibilidad, entrega y pago contigo.
        </p>
        {result.link ? (
          <a href={result.link} target="_blank" rel="noopener noreferrer" className="btn btn-accent w-full"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Abrir WhatsApp y enviar pedido</a>
        ) : (
          <p className="text-sm text-red-700" role="alert">El WhatsApp de la tienda aún no está configurado. Copia el mensaje y envíalo al negocio.</p>
        )}
        <button type="button" className="btn btn-outline w-full" onClick={() => navigator.clipboard?.writeText(result.message).then(() => toast('Mensaje copiado.'), () => toast('No se pudo copiar.', 'error'))}>
          <Copy className="h-4 w-4" aria-hidden="true" /> Copiar mensaje del pedido
        </button>
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-control bg-gray-50 p-3 text-left text-xs text-gray-700">{result.message}</pre>
        <Link href="/shop" className="btn btn-ghost">Seguir comprando</Link>
      </div>
    );
  }

  const isDelivery = form.deliveryMethod === 'delivery';
  const summary = quote || null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        {serverError && (
          <p className="mb-4 flex items-start gap-2 rounded-control bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200" role="alert">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {serverError}{' '}
            <Link href="/cart" className="font-semibold underline">Ver carrito</Link>
          </p>
        )}

        {step === 'data' && (
          <form onSubmit={review} noValidate className="card space-y-4 p-5">
            <h2 className="text-lg">Tus datos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Nombre completo" error={errors.name} required>
                <input id="name" className="input" autoComplete="name" value={prefilled.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
              </Field>
              <Field id="phone" label="Número de WhatsApp" error={errors.phone} required>
                <input id="phone" className="input" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="809 000 0000" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />
              </Field>
            </div>
            <Field id="email" label="Correo electrónico (opcional)" error={errors.email}>
              <input id="email" className="input" type="email" autoComplete="email" value={prefilled.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
            </Field>

            <fieldset>
              <legend className="label">Método de entrega</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {DELIVERY_METHODS.map((m) => (
                  <label key={m.value} className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-control border px-4 text-sm font-medium ${form.deliveryMethod === m.value ? 'border-ink bg-gray-50 ring-1 ring-ink' : 'border-line'}`}>
                    <input type="radio" name="deliveryMethod" value={m.value} checked={form.deliveryMethod === m.value} onChange={set('deliveryMethod')} className="h-4 w-4 accent-ink" />
                    {m.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="province" label={isDelivery ? 'Provincia o ciudad' : 'Provincia o ciudad (opcional)'} error={errors.province} required={isDelivery}>
              <input id="province" className="input" autoComplete="address-level1" value={form.province} onChange={set('province')} aria-invalid={Boolean(errors.province)} aria-describedby={errors.province ? 'province-error' : undefined} />
            </Field>
            {isDelivery && (
              <Field id="address" label="Dirección de entrega" error={errors.address} required>
                <textarea id="address" rows={2} className="input" autoComplete="street-address" value={form.address} onChange={set('address')} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'address-error' : undefined} />
              </Field>
            )}
            <Field id="notes" label="Instrucciones adicionales (opcional)">
              <textarea id="notes" rows={2} maxLength={500} className="input" value={form.notes} onChange={set('notes')} />
            </Field>
            <Field id="promo" label="Código promocional (opcional)" hint="Se valida en el servidor al revisar tu pedido.">
              <input id="promo" className="input uppercase" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} autoComplete="off" />
            </Field>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>{busy ? 'Verificando…' : 'Revisar pedido'}</button>
          </form>
        )}

        {step === 'review' && summary && (
          <div className="card space-y-4 p-5">
            <h2 className="text-lg">Revisa tu pedido</h2>
            <p className="rounded-control bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
              Al continuar se abrirá WhatsApp con tu pedido. <strong>Abrir WhatsApp no confirma tu pedido</strong>: la tienda verificará disponibilidad, entrega y pago contigo.
            </p>
            <dl className="grid gap-1 text-sm">
              <div className="flex gap-2"><dt className="w-28 text-muted">Nombre</dt><dd>{prefilled.name}</dd></div>
              <div className="flex gap-2"><dt className="w-28 text-muted">WhatsApp</dt><dd>{form.phone}</dd></div>
              <div className="flex gap-2"><dt className="w-28 text-muted">Entrega</dt><dd>{isDelivery ? `Domicilio — ${form.address}, ${form.province}` : 'Retiro en tienda'}</dd></div>
              {form.notes && <div className="flex gap-2"><dt className="w-28 text-muted">Notas</dt><dd>{form.notes}</dd></div>}
            </dl>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn btn-outline flex-1" onClick={() => setStep('data')} disabled={busy}>Editar datos</button>
              <button type="button" className="btn btn-accent flex-1" onClick={submit} disabled={busy}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> {busy ? 'Enviando…' : 'Enviar pedido por WhatsApp'}
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="card h-fit space-y-3 p-5 lg:sticky lg:top-24" aria-label="Resumen">
        <h2 className="text-lg">Resumen</h2>
        <ul className="divide-y divide-line text-sm">
          {(summary?.items || cart.items).map((it) => (
            <li key={`${it.productId}-${it.variantId}`} className="flex justify-between gap-3 py-2">
              <span className="min-w-0">{it.name}{it.variantLabel ? ` (${it.variantLabel})` : ''} <span className="text-muted">× {it.quantity}</span></span>
              <span className="shrink-0 font-semibold">{formatPrice(it.price * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(summary ? summary.subtotal : cart.subtotal)}</dd></div>
          {summary?.discount > 0 && <div className="flex justify-between text-green-700"><dt>Descuento ({summary.promoCode})</dt><dd>-{formatPrice(summary.discount)}</dd></div>}
          {summary && <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd>{summary.shipping > 0 ? formatPrice(summary.shipping) : isDelivery ? 'Por confirmar' : 'Sin costo'}</dd></div>}
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total estimado</dt><dd>{formatPrice(summary ? summary.total : cart.subtotal)}</dd></div>
        </dl>
        <p className="text-xs text-muted">El total final y el pago los confirma la tienda por WhatsApp. No se procesa ningún pago en línea.</p>
      </aside>
    </div>
  );
}
