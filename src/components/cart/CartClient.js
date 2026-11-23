'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Info, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import ProductImage from '@/components/ui/ProductImage';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/utils/api';
import { formatPrice } from '@/lib/utils/format';

export default function CartClient() {
  const cart = useCart();
  const [notices, setNotices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [syncError, setSyncError] = useState('');

  // Revalida precios y stock actuales (no se confía en lo guardado en el navegador).
  useEffect(() => {
    if (!cart.ready) return;
    const ids = [...new Set(cart.items.map((i) => i.productId))];
    let cancelled = false;
    apiFetch('/api/products/lookup', { method: 'POST', body: { ids } })
      .then((data) => {
        if (cancelled) return;
        setSettings(data.settings);
        if (ids.length) setNotices(cart.syncWithServer(data.products));
      })
      .catch(() => !cancelled && setSyncError('No pudimos verificar los precios actuales. Se validarán al enviar el pedido.'));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.ready]);

  if (!cart.ready) return <Spinner />;
  if (!cart.items.length) {
    return <EmptyState icon={ShoppingBag} title="Tu carrito está vacío" description="Agrega productos para continuar con tu pedido." actionHref="/shop" actionLabel="Explorar productos" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {[...notices, ...(syncError ? [syncError] : [])].map((n, i) => (
          <p key={i} className="flex items-start gap-2 rounded-control bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200" role="status">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {n}
          </p>
        ))}
        <ul className="space-y-3">
          {cart.items.map((it) => (
            <li key={it.key} className="card flex gap-3 p-3 sm:gap-4 sm:p-4">
              <Link href={`/products/${it.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-white ring-1 ring-line sm:h-24 sm:w-24">
                <ProductImage src={it.image} alt={it.name} sizes="96px" className="p-1" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/products/${it.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline sm:text-base">{it.name}</Link>
                    {it.variantLabel && <p className="text-xs text-muted">{it.variantLabel}</p>}
                  </div>
                  <button type="button" onClick={() => cart.removeItem(it.key)} className="btn-icon !h-9 !w-9 shrink-0" aria-label={`Eliminar ${it.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-control border border-line" role="group" aria-label={`Cantidad de ${it.name}`}>
                    <button type="button" className="btn-icon !h-10 !w-10" disabled={it.quantity <= 1} onClick={() => cart.setQuantity(it.key, it.quantity - 1)} aria-label="Disminuir cantidad"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{it.quantity}</span>
                    <button type="button" className="btn-icon !h-10 !w-10" disabled={it.quantity >= it.stock} onClick={() => cart.setQuantity(it.key, it.quantity + 1)} aria-label="Aumentar cantidad"><Plus className="h-4 w-4" /></button>
                  </div>
                  <p className="text-right">
                    <span className="block text-base font-bold">{formatPrice(it.price * it.quantity)}</span>
                    {it.quantity > 1 && <span className="text-xs text-muted">{formatPrice(it.price)} c/u</span>}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => cart.clear()} className="btn btn-ghost btn-sm text-red-600">Vaciar carrito</button>
      </div>

      <aside className="card h-fit space-y-3 p-5 lg:sticky lg:top-24" aria-label="Resumen del pedido">
        <h2 className="text-lg">Resumen</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal ({cart.count} {cart.count === 1 ? 'artículo' : 'artículos'})</dt><dd className="font-semibold">{formatPrice(cart.subtotal)}</dd></div>
          {cart.savings > 0 && <div className="flex justify-between text-green-700"><dt>Ahorro en ofertas</dt><dd className="font-semibold">{formatPrice(cart.savings)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd className="text-right text-xs text-muted">
            {settings?.deliveryFee > 0 ? `Desde ${formatPrice(settings.deliveryFee)} (entrega a domicilio)` : 'Se confirma por WhatsApp'}
          </dd></div>
        </dl>
        <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><span>Total estimado</span><span>{formatPrice(cart.subtotal)}</span></div>
        <Link href="/checkout" className="btn btn-primary w-full">Continuar con el pedido</Link>
        <p className="text-xs text-muted">Los precios y el stock se verifican de nuevo al enviar el pedido. Tu pedido no se confirma hasta que la tienda lo valide por WhatsApp.</p>
      </aside>
    </div>
  );
}
