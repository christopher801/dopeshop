'use client';

import { useState } from 'react';
import { Heart, Minus, MessageCircle, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils/format';
import { getAvailableStock, getUnitPrice, hasVariants, isOnSale } from '@/lib/utils/product';
import { buildProductMessage, buildWhatsAppLink } from '@/lib/whatsapp';

export default function ProductPurchase({ product, url, whatsapp }) {
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const variantsOn = hasVariants(product);
  const [variantId, setVariantId] = useState(variantsOn ? product.variants.find((v) => v.stock > 0)?.id || null : null);
  const [qty, setQty] = useState(1);

  const stock = getAvailableStock(product, variantId);
  const price = getUnitPrice(product, variantId);
  const soldOut = stock <= 0;
  const wished = wishlist.has(product.id);
  const waLink = buildWhatsAppLink(buildProductMessage(product, url), whatsapp);
  const showCompare = isOnSale(product) && !variantsOn;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-extrabold text-ink">{formatPrice(price)}</span>
        {showCompare && <span className="text-base text-muted line-through">{formatPrice(product.compareAtPrice)}</span>}
      </div>

      {variantsOn && (
        <fieldset>
          <legend className="label">Opción</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const out = v.stock <= 0;
              const selected = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  aria-pressed={selected}
                  onClick={() => {
                    setVariantId(v.id);
                    setQty(1);
                  }}
                  className={`min-h-[44px] rounded-control border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${
                    selected ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="text-sm" aria-live="polite">
        {soldOut ? (
          <span className="font-semibold text-red-600">Agotado</span>
        ) : stock <= (product.lowStockThreshold || 5) ? (
          <span className="font-semibold text-amber-700">Solo quedan {stock} unidades</span>
        ) : (
          <span className="font-semibold text-green-700">Disponible</span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-control border border-line bg-white" role="group" aria-label="Cantidad">
          <button type="button" className="btn-icon" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Disminuir cantidad">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-base font-semibold" aria-live="polite">{qty}</span>
          <button type="button" className="btn-icon" onClick={() => setQty((q) => Math.min(stock || 1, q + 1))} disabled={soldOut || qty >= stock} aria-label="Aumentar cantidad">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button type="button" className="btn btn-primary min-w-[160px] flex-1 sm:flex-none" disabled={soldOut} onClick={() => addItem(product, { variantId, quantity: qty })}>
          <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Agregar al carrito
        </button>
        <button
          type="button"
          className="btn btn-outline !px-3"
          aria-pressed={wished}
          aria-label={wished ? 'Quitar de la lista de deseos' : 'Agregar a la lista de deseos'}
          onClick={() => wishlist.toggle(product.id)}
        >
          <Heart className={`h-5 w-5 ${wished ? 'fill-ink' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {waLink ? (
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-accent w-full sm:w-auto">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Consultar por WhatsApp
        </a>
      ) : (
        <p className="text-xs text-muted">El WhatsApp de la tienda aún no está configurado.</p>
      )}

      {/* Barra fija en móvil: acción de compra siempre accesible */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 pb-safe backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <span className="text-lg font-extrabold">{formatPrice(price)}</span>
          <button type="button" className="btn btn-primary flex-1" disabled={soldOut} onClick={() => addItem(product, { variantId, quantity: qty })}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" /> {soldOut ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
