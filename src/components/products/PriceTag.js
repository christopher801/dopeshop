import { formatPrice } from '@/lib/utils/format';
import { discountPercent, isOnSale } from '@/lib/utils/product';

export default function PriceTag({ product, size = 'md' }) {
  const sale = isOnSale(product);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-bold text-ink ${size === 'lg' ? 'text-2xl md:text-3xl' : 'text-base md:text-lg'}`}>{formatPrice(product.price)}</span>
      {sale && (
        <>
          <span className="text-xs text-muted line-through md:text-sm">{formatPrice(product.compareAtPrice)}</span>
          <span className="badge badge-lime">-{discountPercent(product)}%</span>
        </>
      )}
    </div>
  );
}
