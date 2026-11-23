import { revalidateTag } from 'next/cache';
import { FieldValue, getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/server/auth';
import { CATALOG_TAG, loadSettingsFresh } from '@/lib/server/catalog';
import { handle, json, readJson, requireDb } from '@/lib/server/http';
import { settingsSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  await requireAdmin(req);
  requireDb(getAdminDb());
  return json({ item: await loadSettingsFresh() });
});

export const PUT = handle(async (req) => {
  await requireAdmin(req);
  const db = requireDb(getAdminDb());
  const data = settingsSchema.parse(await readJson(req));
  await db.collection('storeSettings').doc('main').set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  revalidateTag(CATALOG_TAG);
  return json({ ok: true });
});
