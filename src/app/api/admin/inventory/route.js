import { revalidateTag } from 'next/cache';
import { FieldValue, docToObject, getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/server/auth';
import { CATALOG_TAG } from '@/lib/server/catalog';
import { HttpError, handle, json, readJson, requireDb } from '@/lib/server/http';
import { inventoryAdjustSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const db = requireDb(getAdminDb());
  const [pSnap, hSnap] = await Promise.all([
    db.collection('products').limit(2000).get(),
    db.collection('inventoryHistory').orderBy('createdAt', 'desc').limit(60).get(),
  ]);
  const products = pSnap.docs.map(docToObject).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    brand: p.brand,
    stock: p.stock || 0,
    lowStockThreshold: p.lowStockThreshold ?? 5,
    variants: p.variants || [],
    isActive: p.isActive,
    thumbnail: p.thumbnail || '',
  }));
  return json({ products, history: hSnap.docs.map(docToObject) });
});

// Ajuste manual de stock (nunca permite stock negativo) con registro en el historial.
export const POST = handle(async (req) => {
  const admin = await requireAdmin(req);
  const body = inventoryAdjustSchema.parse(await readJson(req));
  const db = requireDb(getAdminDb());
  const ref = db.collection('products').doc(body.productId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, 'Producto no encontrado.');
    const p = snap.data();
    const variants = (p.variants || []).map((v) => ({ ...v }));
    let previous;
    let next;
    if (variants.length) {
      if (!body.variantId) throw new HttpError(400, 'Selecciona la variante a ajustar.');
      const v = variants.find((x) => x.id === body.variantId);
      if (!v) throw new HttpError(404, 'Variante no encontrada.');
      previous = v.stock || 0;
      next = body.mode === 'set' ? body.quantity : previous + body.quantity;
      if (next < 0) throw new HttpError(400, 'El stock no puede ser negativo.');
      v.stock = next;
    } else {
      previous = p.stock || 0;
      next = body.mode === 'set' ? body.quantity : previous + body.quantity;
      if (next < 0) throw new HttpError(400, 'El stock no puede ser negativo.');
    }
    const total = variants.length ? variants.reduce((s, v) => s + (v.stock || 0), 0) : next;
    tx.update(ref, { stock: total, variants, updatedAt: FieldValue.serverTimestamp() });
    tx.set(db.collection('inventoryHistory').doc(), {
      productId: body.productId,
      productName: p.name,
      variantId: body.variantId || null,
      previous,
      newQuantity: next,
      adjustment: next - previous,
      reason: body.reason,
      adminId: admin.uid,
      adminEmail: admin.email || '',
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  revalidateTag(CATALOG_TAG);
  return json({ ok: true });
});
