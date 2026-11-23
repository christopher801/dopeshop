import { docToObject, getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/server/auth';
import { handle, json, requireDb } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const snap = await requireDb(getAdminDb()).collection('orders').limit(1000).get();
  const items = snap.docs.map(docToObject).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return json({ items });
});
