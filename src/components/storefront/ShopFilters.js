'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { SORT_OPTIONS } from '@/constants';

const KEEP_KEYS = ['q', 'sort'];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="sr-only md:not-sr-only md:text-sm md:text-muted">
        Ordenar por
      </label>
      <select
        id="sort"
        className="input !min-h-[40px] !py-1.5 md:w-56"
        value={sp.get('sort') || 'recent'}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          next.set('sort', e.target.value);
          next.delete('page');
          router.push(`${pathname}?${next.toString()}`);
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Filtros reales: al aplicar, actualizan la URL y el servidor filtra el catálogo. */
export default function ShopFilters({ categories = [], brands = [], priceRange, showCategory = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const selectedBrands = (sp.get('brand') || '').split(',').filter(Boolean);
  const activeCount = ['category', 'brand', 'min', 'max', 'stock', 'promo'].filter((k) => sp.get(k)).length;

  function apply(form) {
    const fd = new FormData(form);
    const next = new URLSearchParams();
    for (const k of KEEP_KEYS) if (sp.get(k)) next.set(k, sp.get(k));
    const category = fd.get('category');
    const min = String(fd.get('min') || '').trim();
    const max = String(fd.get('max') || '').trim();
    const brandList = fd.getAll('brand');
    if (category) next.set('category', category);
    if (min) next.set('min', min);
    if (max) next.set('max', max);
    if (brandList.length) next.set('brand', brandList.join(','));
    if (fd.get('stock')) next.set('stock', '1');
    if (fd.get('promo')) next.set('promo', '1');
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setOpen(false);
  }

  return (
    <aside aria-label="Filtros" className="lg:sticky lg:top-24 lg:self-start">
      <button type="button" className="btn btn-outline w-full lg:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="filters-panel">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filtros{activeCount ? ` (${activeCount})` : ''}
      </button>

      <form
        id="filters-panel"
        key={sp.toString()}
        className={`${open ? 'block' : 'hidden'} card mt-3 space-y-6 p-4 lg:mt-0 lg:block`}
        onSubmit={(e) => {
          e.preventDefault();
          apply(e.currentTarget);
        }}
        onChange={(e) => {
          if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') e.currentTarget.requestSubmit();
        }}
      >
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="font-bold">Filtros</h2>
          <button type="button" className="btn-icon" onClick={() => setOpen(false)} aria-label="Cerrar filtros">
            <X className="h-5 w-5" />
          </button>
        </div>

        {showCategory && categories.length > 0 && (
          <div>
            <label htmlFor="f-category" className="label">Categoría</label>
            <select id="f-category" name="category" className="input" defaultValue={sp.get('category') || ''}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {brands.length > 0 && (
          <fieldset>
            <legend className="label">Marca</legend>
            <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
              {brands.map((b) => (
                <label key={b} className="flex min-h-[36px] cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" name="brand" value={b} defaultChecked={selectedBrands.some((x) => x.toLowerCase() === b.toLowerCase())} className="h-4 w-4 accent-ink" />
                  {b}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="label">Precio (RD$)</legend>
          <div className="flex items-center gap-2">
            <input name="min" inputMode="numeric" pattern="[0-9]*" placeholder={priceRange?.min ? String(priceRange.min) : 'Mín.'} defaultValue={sp.get('min') || ''} className="input" aria-label="Precio mínimo" />
            <span aria-hidden="true">–</span>
            <input name="max" inputMode="numeric" pattern="[0-9]*" placeholder={priceRange?.max ? String(priceRange.max) : 'Máx.'} defaultValue={sp.get('max') || ''} className="input" aria-label="Precio máximo" />
          </div>
        </fieldset>

        <div className="space-y-1">
          <label className="flex min-h-[36px] cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name="stock" defaultChecked={sp.get('stock') === '1'} className="h-4 w-4 accent-ink" /> Solo disponibles
          </label>
          <label className="flex min-h-[36px] cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name="promo" defaultChecked={sp.get('promo') === '1'} className="h-4 w-4 accent-ink" /> Solo en oferta
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">Aplicar</button>
          <button
            type="button"
            className="btn btn-outline flex-1"
            onClick={() => {
              router.push(pathname);
              setOpen(false);
            }}
          >
            Limpiar
          </button>
        </div>
      </form>
    </aside>
  );
}
