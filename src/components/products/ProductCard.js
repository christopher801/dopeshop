'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductImage from '@/components/ui/ProductImage';
import { getAvailableStock, hasVariants, isOnSale, productImage } from '@/lib/utils/product';
import PriceTag from './PriceTag';
import StockBadge from './StockBadge';

export default function ProductCard({ product, priority = false }) {
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const wished = wishlist.has(product.id);
  const soldOut = getAvailableStock(product) <= 0;
  const needsOptions = hasVariants(product);
  const href = `/products/${product.slug}`;

  return (
    <article className="card group relative flex flex-col overflow-hidden transition hover:shadow-lift">
      <div className="relative aspect-square w-full bg-white">
        <Link href={href} className="absolute inset-0 block" aria-label={`Ver detalles de ${product.name}`}>
          <ProductImage
            src={productImage(product)}
            alt={product.name}
            priority={priority}
            className="p-3 transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {product.isDemo && <span className="badge badge-ink">DEMO</span>}
          {isOnSale(product) && <span className="badge badge-lime">Oferta</span>}
        </div>
        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={wished}
          aria-label={wished ? `Quitar ${product.name} de la lista de deseos` : `Agregar ${product.name} a la lista de deseos`}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-card transition hover:bg-white"
        >
          <Heart className={`h-5 w-5 ${wished ? 'fill-ink' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink md:text-base">
          <Link href={href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <PriceTag product={product} />
        <div className="mt-0.5">
          <StockBadge product={product} />
        </div>
        <div className="mt-auto flex gap-2 pt-3">
          {needsOptions ? (
            <Link href={href} className="btn btn-outline flex-1 !px-2 text-xs sm:text-sm">
              Ver opciones
            </Link>
          ) : (
            <button
              type="button"
              disabled={soldOut}
              onClick={() => addItem(product)}
              className="btn btn-primary flex-1 !px-2 text-xs sm:text-sm"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {soldOut ? 'Agotado' : 'Agregar'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
