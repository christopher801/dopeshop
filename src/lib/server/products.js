import { destroyImages } from '@/lib/cloudinary/server';
import { FieldValue } from '@/lib/firebase/admin';
import { slugify } from '@/lib/utils/format';
import { assertUnique } from './crud';
import { HttpError } from './http';

export async function prepareProduct(data, { id, db, admin, existing, afterSave }) {
  const slug = data.slug || slugify(data.name);
  if (!slug) throw new HttpError(400, 'No se pudo generar el slug del producto.');
  await assertUnique(db, 'products', 'slug', slug, id, 'Ya existe un producto con ese slug.');
  await assertUnique(db, 'products', 'sku', data.sku, id, 'Ya existe un producto con ese SKU.');

  const cat = await db.collection('categories').doc(data.categoryId).get();
  if (!cat.exists) throw new HttpError(400, 'La categoría seleccionada no existe.');

  if (data.compareAtPrice != null && data.compareAtPrice <= data.price) {
    throw new HttpError(400, 'El precio anterior debe ser mayor que el precio actual.');
  }

  const variantIds = data.variants.map((v) => v.id);
  if (new Set(variantIds).size !== variantIds.length) throw new HttpError(400, 'Las variantes tienen identificadores repetidos.');
  const stock = data.variants.length ? data.variants.reduce((s, v) => s + v.stock, 0) : data.stock;

  const prevStock = existing ? existing.stock || 0 : 0;
  if (stock !== prevStock) {
    afterSave(async (productId) => {
      await db.collection('inventoryHistory').add({
        productId,
        productName: data.name,
        variantId: null,
        previous: prevStock,
        newQuantity: stock,
        adjustment: stock - prevStock,
        reason: existing ? 'Edición de producto' : 'Creación de producto',
        adminId: admin.uid,
        adminEmail: admin.email || '',
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  }

  if (existing) {
    const removed = (existing.images || []).filter((i) => !data.images.some((n) => n.publicId === i.publicId)).map((i) => i.publicId);
    if (removed.length) afterSave(() => destroyImages(removed));
  }

  return {
    ...data,
    slug,
    stock,
    currency: 'DOP',
    thumbnail: data.images[0]?.url || '',
    isOnSale: data.isOnSale || (data.compareAtPrice != null && data.compareAtPrice > data.price),
    variants: data.variants.map((v) => ({ id: v.id, label: v.label, stock: v.stock, price: v.price ?? null })),
  };
}

export async function cleanupProductImages(product) {
  await destroyImages((product.images || []).map((i) => i.publicId));
}
