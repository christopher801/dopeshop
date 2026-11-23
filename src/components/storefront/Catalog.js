import Link from 'next/link';
import { Suspense } from 'react';
import { SearchX } from 'lucide-react';
import ProductGrid from '@/components/products/ProductGrid';
import EmptyState from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import Pagination from './Pagination';
import ShopFilters, { SortSelect } from './ShopFilters';

/** Listado de catálogo con filtros, orden, conteo y paginación (renderizado en el servidor). */
export default function Catalog({ result, params, basePath, showCategoryFilter = true }) {
  const { items, total, page, pages, brands, categories, priceRange } = result;
  const hasFilters = Object.keys(params).some((k) => ['q', 'category', 'brand', 'min', 'max', 'stock', 'promo'].includes(k) && params[k]);
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Suspense fallback={<div className="skeleton h-12 w-full lg:h-96" />}>
        <ShopFilters categories={categories} brands={brands} priceRange={priceRange} showCategory={showCategoryFilter} />
      </Suspense>

      <section aria-label="Resultados">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {total} {total === 1 ? 'producto' : 'productos'}
            {params.q ? <> para “<span className="font-semibold text-ink">{params.q}</span>”</> : null}
            {hasFilters && (
              <>
                {' · '}
                <Link href={basePath} className="font-semibold text-ink underline">Limpiar filtros</Link>
              </>
            )}
          </p>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={params.q ? 'Sin resultados para tu búsqueda' : 'No hay productos disponibles'}
            description={hasFilters ? 'Prueba con otras palabras o ajusta los filtros.' : 'Pronto agregaremos nuevos productos.'}
            actionHref={hasFilters ? basePath : '/'}
            actionLabel={hasFilters ? 'Limpiar búsqueda y filtros' : 'Volver al inicio'}
          />
        ) : (
          <>
            <ProductGrid products={items} priorityCount={4} />
            <Pagination page={page} pages={pages} basePath={basePath} params={params} />
          </>
        )}
      </section>
    </div>
  );
}

export { ProductGridSkeleton };
