import { isAdminConfigured } from '@/lib/firebase/admin';
import { getUser } from '@/lib/server/auth';
import { HttpError, handle, json, rateLimit, readJson } from '@/lib/server/http';
import { buildQuote, createOrder } from '@/lib/server/orders';
import { orderRequestSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';

/**
 * Valida el carrito contra Firestore y (si dryRun es false) registra el pedido con estado
 * `pending_whatsapp_confirmation`. El cliente nunca envía precios ni totales: se recalculan aquí.
 */
export const POST = handle(async (req) => {
  rateLimit(req, 'orders', 8);
  if (!isAdminConfigured) {
    throw new HttpError(503, 'Los pedidos no están disponibles: la tienda aún no está conectada a Firebase.');
  }
  const body = orderRequestSchema.parse(await readJson(req));
  const quote = await buildQuote(body);
  const customer = body.customer;

  if (body.dryRun) return json({ quote, dryRun: true });

  const user = await getUser(req);
  const { id, orderNumber } = await createOrder(quote, customer, user);
  return json(
    {
      order: {
        id,
        orderNumber,
        customer,
        items: quote.items,
        subtotal: quote.subtotal,
        discount: quote.discount,
        promoCode: quote.promoCode,
        shipping: quote.shipping,
        total: quote.total,
      },
      whatsapp: quote.whatsapp,
    },
    201
  );
});
