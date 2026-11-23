import { revalidateTag } from 'next/cache';
import { FieldValue, docToObject, getAdminDb } from '@/lib/firebase/admin';
import { CATALOG_TAG } from './catalog';
import { requireAdmin } from './auth';
import { HttpError, handle, json, readJson, requireDb } from './http';

/** Genera los handlers CRUD protegidos (solo administradores) para una colección. */
export function createCrud({ collection, schema, prepare, beforeDelete, afterDelete, sort }) {
  const col = () => requireDb(getAdminDb()).collection(collection);

  const list = handle(async (req) => {
    await requireAdmin(req);
    const snap = await col().limit(1000).get();
    const items = snap.docs.map(docToObject);
    if (sort) items.sort(sort);
    return json({ items });
  });

  const create = handle(async (req) => {
    const admin = await requireAdmin(req);
    const data = schema.parse(await readJson(req));
    const db = getAdminDb();
    const ref = col().doc();
    const afters = [];
    const payload = prepare ? await prepare(data, { id: ref.id, db, admin, existing: null, afterSave: (f) => afters.push(f) }) : data;
    await ref.set({ ...payload, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    for (const f of afters) await f(ref.id);
    revalidateTag(CATALOG_TAG);
    return json({ id: ref.id }, 201);
  });

  const getOne = handle(async (req, ctx) => {
    await requireAdmin(req);
    const { id } = await ctx.params;
    const snap = await col().doc(id).get();
    if (!snap.exists) throw new HttpError(404, 'No encontrado.');
    return json({ item: docToObject(snap) });
  });

  const update = handle(async (req, ctx) => {
    const admin = await requireAdmin(req);
    const { id } = await ctx.params;
    const data = schema.parse(await readJson(req));
    const db = getAdminDb();
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, 'No encontrado.');
    const afters = [];
    const payload = prepare ? await prepare(data, { id, db, admin, existing: docToObject(snap), afterSave: (f) => afters.push(f) }) : data;
    await ref.update({ ...payload, updatedAt: FieldValue.serverTimestamp() });
    for (const f of afters) await f(id);
    revalidateTag(CATALOG_TAG);
    return json({ id });
  });

  const remove = handle(async (req, ctx) => {
    const admin = await requireAdmin(req);
    const { id } = await ctx.params;
    const db = getAdminDb();
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, 'No encontrado.');
    const existing = docToObject(snap);
    if (beforeDelete) await beforeDelete(existing, { db, admin });
    await ref.delete();
    if (afterDelete) await afterDelete(existing);
    revalidateTag(CATALOG_TAG);
    return json({ ok: true });
  });

  return { list, create, getOne, update, remove };
}

export async function assertUnique(db, collection, field, value, selfId, message) {
  const snap = await db.collection(collection).where(field, '==', value).limit(2).get();
  if (snap.docs.some((d) => d.id !== selfId)) throw new HttpError(409, message);
}
