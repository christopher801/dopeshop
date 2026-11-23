import { REVENUE_STATUSES } from '@/constants';
import { docToObject, getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/server/auth';
import { handle, json, requireDb } from '@/lib/server/http';
import { getAvailableStock } from '@/lib/utils/product';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const db = requireDb(getAdminDb());
  const [pSnap, oSnap] = await Promise.all([db.collection('products').limit(2000).get(), db.collection('orders').limit(2000).get()]);
  const products = pSnap.docs.map(docToObject);
  const orders = oSnap.docs.map(docToObject).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const productStats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    outOfStock: products.filter((p) => getAvailableStock(p) <= 0).length,
    lowStock: products.filter((p) => {
      const s = getAvailableStock(p);
      return s > 0 && s <= (p.lowStockThreshold ?? 5);
    }).length,
  };

  const count = (...statuses) => orders.filter((o) => statuses.includes(o.status)).length;
  const orderStats = {
    total: orders.length,
    pending: count('pending_whatsapp_confirmation', 'pending_confirmation'),
    confirmed: count('confirmed', 'processing', 'ready_for_delivery', 'shipped'),
    delivered: count('delivered'),
    cancelled: count('cancelled'),
  };

  // Ingresos: solo pedidos confirmados por el administrador (nunca pendientes ni cancelados).
  const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const revenue = revenueOrders.reduce((s, o) => s + (o.total || 0), 0);

  const top = new Map();
  for (const o of revenueOrders) {
    for (const it of o.items || []) {
      const cur = top.get(it.productId) || { productId: it.productId, name: it.name, units: 0, revenue: 0 };
      cur.units += it.quantity;
      cur.revenue += it.lineTotal || it.price * it.quantity;
      top.set(it.productId, cur);
    }
  }

  const months = [];
  const base = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('es-DO', { month: 'short' }), total: 0 });
  }
  for (const o of revenueOrders) {
    const d = new Date(o.createdAt || 0);
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m.total += o.total || 0;
  }

  return json({
    products: productStats,
    orders: orderStats,
    revenue,
    recentOrders: orders.slice(0, 6).map((o) => ({ id: o.id, orderNumber: o.orderNumber, customer: o.customer?.name, total: o.total, status: o.status, createdAt: o.createdAt })),
    topProducts: [...top.values()].sort((a, b) => b.units - a.units).slice(0, 5),
    monthly: months,
  });
});
