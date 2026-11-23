import { docToObject, getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/server/auth';
import { handle, json, requireDb } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const db = requireDb(getAdminDb());
  const [uSnap, oSnap] = await Promise.all([db.collection('users').limit(1000).get(), db.collection('orders').limit(2000).get()]);
  const orders = oSnap.docs.map(docToObject);
  const items = uSnap.docs.map(docToObject).map((u) => {
    const mine = orders.filter((o) => o.userId === u.id).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return {
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      createdAt: u.createdAt || null,
      orderCount: mine.length,
      orders: mine.slice(0, 20).map((o) => ({ id: o.id, orderNumber: o.orderNumber, total: o.total, status: o.status, createdAt: o.createdAt })),
    };
  });
  items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return json({ items });
});
