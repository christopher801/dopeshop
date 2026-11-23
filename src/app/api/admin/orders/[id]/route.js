import { docToObject, getAdminDb } from '@/lib/firebase/admin';
import { requireAdmin } from '@/lib/server/auth';
import { HttpError, handle, json, readJson, requireDb } from '@/lib/server/http';
import { updateOrder } from '@/lib/server/orders';
import { orderStatusSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  const snap = await requireDb(getAdminDb()).collection('orders').doc(id).get();
  if (!snap.exists) throw new HttpError(404, 'Pedido no encontrado.');
  return json({ item: docToObject(snap) });
});

// Cambia estado y/o agrega nota interna. Los pedidos nunca se eliminan.
export const PATCH = handle(async (req, ctx) => {
  const admin = await requireAdmin(req);
  const { id } = await ctx.params;
  const body = orderStatusSchema.parse(await readJson(req));
  if (!body.status && !body.note) throw new HttpError(400, 'Indica un estado o una nota.');
  await updateOrder(id, body, admin);
  const snap = await getAdminDb().collection('orders').doc(id).get();
  return json({ item: docToObject(snap) });
});
