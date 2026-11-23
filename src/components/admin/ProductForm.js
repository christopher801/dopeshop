'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Field from '@/components/ui/Field';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/utils/api';
import { slugify } from '@/lib/utils/format';
import { DataState } from './ui';
import ImageUploader from './ImageUploader';
import { useAdminData } from '@/hooks/useAdminData';

const EMPTY = {
  name: '', slug: '', brand: '', categoryId: '', sku: '', price: '', compareAtPrice: '', stock: 0, lowStockThreshold: 5,
  shortDescription: '', description: '', images: [], specifications: [], variants: [],
  isActive: false, isFeatured: false, isBestSeller: false, isNewArrival: false, isOnSale: false, seoTitle: '', seoDescription: '',
};

const FLAGS = [
  ['isActive', 'Publicado (visible en la tienda)'],
  ['isFeatured', 'Destacado'],
  ['isBestSeller', 'Más vendido'],
  ['isNewArrival', 'Nuevo ingreso'],
  ['isOnSale', 'Marcar como oferta'],
];

export default function ProductForm({ id }) {
  const router = useRouter();
  const { toast } = useToast();
  const cats = useAdminData('/api/admin/categories');
  const existing = useAdminData(id ? `/api/admin/products/${id}` : null);
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (existing.data?.item) setF({ ...EMPTY, ...existing.data.item, compareAtPrice: existing.data.item.compareAtPrice ?? '' });
  }, [existing.data]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const hasVariants = f.variants.length > 0;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const payload = {
        ...f,
        slug: f.slug || slugify(f.name),
        price: Number(f.price),
        compareAtPrice: f.compareAtPrice === '' ? null : Number(f.compareAtPrice),
        stock: Number(f.stock) || 0,
        lowStockThreshold: Number(f.lowStockThreshold) || 0,
        variants: f.variants.map((v) => ({ ...v, stock: Number(v.stock) || 0, price: v.price === '' || v.price == null ? null : Number(v.price) })),
      };
      delete payload.id; delete payload.createdAt; delete payload.updatedAt; delete payload.thumbnail; delete payload.soldCount; delete payload.currency;
      await apiFetch(id ? `/api/admin/products/${id}` : '/api/admin/products', { method: id ? 'PUT' : 'POST', body: payload, auth: true });
      toast(id ? 'Producto actualizado.' : 'Producto creado.');
      router.push('/admin/products');
    } catch (err) {
      setErrors(err.details || {});
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('¿Eliminar este producto definitivamente? Los pedidos existentes conservan su información.')) return;
    try {
      await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE', auth: true });
      toast('Producto eliminado.');
      router.push('/admin/products');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const err = (k) => errors[k]?.[0];
  const listEdit = (key, i, patch) => setF((s) => ({ ...s, [key]: s[key].map((x, idx) => (idx === i ? { ...x, ...patch } : x)) }));

  return (
    <DataState loading={cats.loading || (id && existing.loading)} error={cats.error || existing.error} reload={() => { cats.reload(); existing.reload(); }}>
      <form onSubmit={save} className="space-y-6" noValidate>
        <section className="card space-y-4 p-5">
          <h2 className="text-lg">Información básica</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="name" label="Nombre" error={err('name')} required><input id="name" className="input" value={f.name} onChange={set('name')} maxLength={160} /></Field>
            <Field id="slug" label="Slug (URL)" error={err('slug')} hint={`/products/${f.slug || slugify(f.name) || '…'}`}><input id="slug" className="input" value={f.slug} onChange={set('slug')} placeholder="Se genera del nombre" /></Field>
            <Field id="brand" label="Marca" error={err('brand')} required><input id="brand" className="input" value={f.brand} onChange={set('brand')} /></Field>
            <Field id="sku" label="SKU" error={err('sku')} required><input id="sku" className="input" value={f.sku} onChange={set('sku')} /></Field>
            <Field id="categoryId" label="Categoría" error={err('categoryId')} required>
              <select id="categoryId" className="input" value={f.categoryId} onChange={set('categoryId')}>
                <option value="">Selecciona…</option>
                {(cats.data?.items || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field id="shortDescription" label="Descripción corta" error={err('shortDescription')}><input id="shortDescription" className="input" maxLength={300} value={f.shortDescription} onChange={set('shortDescription')} /></Field>
          <Field id="description" label="Descripción" error={err('description')}><textarea id="description" rows={5} className="input" value={f.description} onChange={set('description')} /></Field>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-lg">Precio e inventario</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="price" label="Precio (RD$)" error={err('price')} required><input id="price" inputMode="decimal" className="input" value={f.price} onChange={set('price')} /></Field>
            <Field id="compareAtPrice" label="Precio anterior (RD$)" error={err('compareAtPrice')} hint="Mayor al precio actual."><input id="compareAtPrice" inputMode="decimal" className="input" value={f.compareAtPrice} onChange={set('compareAtPrice')} /></Field>
            <Field id="stock" label="Stock" error={err('stock')} hint={hasVariants ? 'Se calcula con las variantes.' : undefined}><input id="stock" inputMode="numeric" className="input" value={hasVariants ? f.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0) : f.stock} onChange={set('stock')} disabled={hasVariants} /></Field>
            <Field id="lowStockThreshold" label="Alerta de stock bajo" error={err('lowStockThreshold')}><input id="lowStockThreshold" inputMode="numeric" className="input" value={f.lowStockThreshold} onChange={set('lowStockThreshold')} /></Field>
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-lg">Imágenes</h2>
          <ImageUploader images={f.images} onChange={(images) => setF((s) => ({ ...s, images }))} folder="products" />
          {err('images') && <p className="field-error">{err('images')}</p>}
        </section>

        <section className="card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Variantes (opcional)</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setF((s) => ({ ...s, variants: [...s.variants, { id: `v${Date.now().toString(36)}`, label: '', stock: 0, price: '' }] }))}><Plus className="h-4 w-4" aria-hidden="true" /> Agregar</button>
          </div>
          {f.variants.map((v, i) => (
            <div key={v.id} className="grid grid-cols-[1fr_90px_110px_44px] items-end gap-2">
              <div><label className="label" htmlFor={`vl${i}`}>Opción</label><input id={`vl${i}`} className="input" placeholder="Ej. 256 GB / Negro" value={v.label} onChange={(e) => listEdit('variants', i, { label: e.target.value })} /></div>
              <div><label className="label" htmlFor={`vs${i}`}>Stock</label><input id={`vs${i}`} inputMode="numeric" className="input" value={v.stock} onChange={(e) => listEdit('variants', i, { stock: e.target.value })} /></div>
              <div><label className="label" htmlFor={`vp${i}`}>Precio</label><input id={`vp${i}`} inputMode="decimal" className="input" placeholder="Base" value={v.price ?? ''} onChange={(e) => listEdit('variants', i, { price: e.target.value })} /></div>
              <button type="button" className="btn-icon text-red-600" aria-label="Quitar variante" onClick={() => setF((s) => ({ ...s, variants: s.variants.filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {err('variants') && <p className="field-error">{err('variants')}</p>}
        </section>

        <section className="card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Especificaciones técnicas</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setF((s) => ({ ...s, specifications: [...s.specifications, { label: '', value: '' }] }))}><Plus className="h-4 w-4" aria-hidden="true" /> Agregar</button>
          </div>
          {f.specifications.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_44px] gap-2">
              <input className="input" placeholder="Ej. RAM" aria-label={`Nombre de especificación ${i + 1}`} value={s.label} onChange={(e) => listEdit('specifications', i, { label: e.target.value })} />
              <input className="input" placeholder="Ej. 12 GB" aria-label={`Valor de especificación ${i + 1}`} value={s.value} onChange={(e) => listEdit('specifications', i, { value: e.target.value })} />
              <button type="button" className="btn-icon text-red-600" aria-label="Quitar especificación" onClick={() => setF((st) => ({ ...st, specifications: st.specifications.filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-lg">Visibilidad y SEO</h2>
          <div className="grid gap-1 sm:grid-cols-2">
            {FLAGS.map(([k, label]) => (
              <label key={k} className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-ink" checked={Boolean(f[k])} onChange={set(k)} /> {label}</label>
            ))}
          </div>
          <Field id="seoTitle" label="Título SEO" error={err('seoTitle')} hint={`${f.seoTitle.length}/70`}><input id="seoTitle" className="input" maxLength={70} value={f.seoTitle} onChange={set('seoTitle')} /></Field>
          <Field id="seoDescription" label="Descripción SEO" error={err('seoDescription')} hint={`${f.seoDescription.length}/170`}><textarea id="seoDescription" rows={2} className="input" maxLength={170} value={f.seoDescription} onChange={set('seoDescription')} /></Field>
        </section>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear producto'}</button>
          <button type="button" className="btn btn-outline" onClick={() => router.push('/admin/products')}>Cancelar</button>
          {id && <button type="button" className="btn btn-danger ml-auto" onClick={remove}>Eliminar</button>}
        </div>
      </form>
    </DataState>
  );
}
