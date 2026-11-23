import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '@/components/products/ProductGrid';

export default function ProductSection({ title, href, products, id }) {
  if (!products?.length) return null;
  return (
    <section className="section" aria-labelledby={id}>
      <div className="container-page">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id={id} className="text-xl md:text-3xl">{title}</h2>
          {href && (
            <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-ink hover:underline">
              Ver todo <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
