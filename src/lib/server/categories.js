import { destroyImages } from '@/lib/cloudinary/server';
import { slugify } from '@/lib/utils/format';
import { assertUnique, createCrud } from './crud';
import { HttpError } from './http';

async function prepareCategory(data, { id, db, existing, afterSave }) {
  const slug = data.slug || slugify(data.name);
  if (!slug) throw new HttpError(400, 'No se pudo generar el slug de la categoría.');
  await assertUnique(db, 'categories', 'slug', slug, id, 'Ya existe una categoría con ese slug.');
  if (existing?.image?.publicId && existing.image.publicId !== data.image?.publicId) {
    afterSave(() => destroyImages([existing.image.publicId]));
  }
  // Una categoría con productos no puede desactivarse sin aviso: se permite, pero los productos dejan de listarse.
  return { ...data, slug, image: data.image || null };
}

async function beforeDeleteCategory(category, { db }) {
  const used = await db.collection('products').where('categoryId', '==', category.id).limit(1).get();
  if (!used.empty) {
    throw new HttpError(409, 'No puedes eliminar una categoría que tiene productos. Reasigna o elimina sus productos primero.');
  }
}

export function categoryCrud(schema) {
  return createCrud({
    collection: 'categories',
    schema,
    prepare: prepareCategory,
    beforeDelete: beforeDeleteCategory,
    afterDelete: (c) => (c.image?.publicId ? destroyImages([c.image.publicId]) : null),
    sort: (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  });
}
