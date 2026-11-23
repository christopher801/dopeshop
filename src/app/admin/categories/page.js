'use client';

import { useState } from 'react';
import Field from '@/components/ui/Field';
import ImageUploader from '@/components/admin/ImageUploader';
import { AdminTable, DataState, PageHeader } from '@/components/admin/ui';
import { useToast } from '@/context/ToastContext';
import { useAdminData } from '@/hooks/useAdminData';
import { apiFetch } from '@/lib/utils/api';
import { slugify } from '@/lib/utils/format';

const EMPTY = { name: '', slug: '', description: '', image: null, seoTitle: '', seoDescription: '', isActive: true, sortOrder: 0 };

export default function CategoriesPage() {
  const { data, error, loading, reload } = useAdminData('/api/admin/categories');
  const { toast } = useToast();
  const [f, setF] = useState(null); // null = cerrado
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const body = { ...f, slug: f.slug || slugify(f.name), sortOrder: Number(f.sortOrder) || 0 };
      ['id', 'createdAt', 'updatedAt'].forEach((k) => delete body[k]);
      await apiFetch(editId ? `/api/admin/categories/${editId}` : '/api/admin/categories', { method: editId ? 'PUT' : 'POST', body, auth: true });
      toast('Categoría guardada.');
      setF(null);
      reload();
    } catch (err) {
      setErrors(err.details || {});
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove(c) {
    if (!window.confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    try {
      await apiFetch(`/api/admin/categories/${c.id}`, { method: 'DELETE', auth: true });
      toast('Categoría eliminada.');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageHeader title="Categorías" action={<button type="button" className="btn btn-primary" onClick={() => { setEditId(null); setF({ ...EMPTY }); }}>Nueva categoría</button>} />
      {f && (
        <form onSubmit={save} noValidate className="card mb-6 space-y-4 p-5">
          <h2 className="text-lg">{editId ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field id="c-name" label="Nombre" error={errors.name?.[0]} required><input id="c-name" className="input" value={f.name} onChange={set('name')} /></Field>
            <Field id="c-slug" label="Slug" error={errors.slug?.[0]} hint={`/categories/${f.slug || slugify(f.name) || '…'}`}><input id="c-slug" className="input" value={f.slug} onChange={set('slug')} /></Field>
            <Field id="c-order" label="Orden"><input id="c-order" inputMode="numeric" className="input" value={f.sortOrder} onChange={set('sortOrder')} /></Field>
          </div>
          <Field id="c-desc" label="Descripción"><textarea id="c-desc" rows={2} className="input" value={f.description} onChange={set('description')} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="c-st" label="Título SEO"><input id="c-st" className="input" maxLength={70} value={f.seoTitle} onChange={set('seoTitle')} /></Field>
            <Field id="c-sd" label="Descripción SEO"><input id="c-sd" className="input" maxLength={170} value={f.seoDescription} onChange={set('seoDescription')} /></Field>
          </div>
          <div>
            <p className="label">Imagen</p>
            <ImageUploader single folder="categories" images={f.image ? [f.image] : []} onChange={(imgs) => setF((s) => ({ ...s, image: imgs[0] || null }))} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-ink" checked={f.isActive} onChange={set('isActive')} /> Activa (visible en la tienda)</label>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setF(null)}>Cancelar</button>
          </div>
        </form>
      )}
      <DataState loading={loading} error={error} reload={reload}>
        <AdminTable
          rows={data?.items || []}
          empty="Aún no hay categorías."
          columns={[
            { key: 'name', label: 'Nombre', render: (c) => <span className="font-semibold">{c.name}</span> },
            { key: 'slug', label: 'Slug' },
            { key: 'sortOrder', label: 'Orden', render: (c) => c.sortOrder ?? 0 },
            { key: 'isActive', label: 'Estado', render: (c) => <span className={`badge ${c.isActive ? 'badge-green' : 'badge-gray'}`}>{c.isActive ? 'Activa' : 'Inactiva'}</span> },
            { key: 'actions', label: '', render: (c) => (
              <span className="flex gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditId(c.id); setF({ ...EMPTY, ...c }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Editar</button>
                <button type="button" className="btn btn-outline btn-sm text-red-700" onClick={() => remove(c)}>Eliminar</button>
              </span>
            ) },
          ]}
        />
      </DataState>
    </>
  );
}
