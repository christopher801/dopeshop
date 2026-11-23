'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useWishlist } from '@/context/WishlistContext';
import { apiFetch } from '@/lib/utils/api';

export default function WishlistClient() {
  const { ids, ready } = useWishlist();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const key = ids.join(',');

  useEffect(() => {
    if (!ready) return;
    if (!ids.length) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    apiFetch('/api/products/lookup', { method: 'POST', body: { ids: ids.slice(0, 60) } })
      .then((d) => !cancelled && (setProducts(d.products), setError('')))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key]);

  if (!ready) return <Spinner />;
  if (error) return <p className="card p-6 text-center text-sm text-red-700" role="alert">{error}</p>;
  if (products === null) return <ProductGridSkeleton count={4} />;
  const visible = products.filter((p) => ids.includes(p.id));
  if (!visible.length) {
    return <EmptyState icon={Heart} title="Tu lista de deseos está vacía" description="Toca el corazón en un producto para guardarlo aquí." actionHref="/shop" actionLabel="Explorar productos" />;
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {visible.map((p) => (
        <li key={p.id} className="flex"><div className="w-full"><ProductCard product={p} /></div></li>
      ))}
    </ul>
  );
}
