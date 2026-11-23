import { randomBytes } from 'crypto';
import { STOCK_COMMITTED_STATUSES, TERMINAL_STATUSES } from '@/constants';
import { FieldValue, docToObject, getAdminDb } from '@/lib/firebase/admin';
import { formatPrice } from '@/lib/utils/format';
import { getAvailableStock, getUnitPrice, hasVariants } from '@/lib/utils/product';
import { loadSettingsFresh } from './catalog';
import { HttpError, requireDb } from './http';

/**
 * Calcula el presupuesto del pedido EN EL SERVIDOR: precios, stock, promoción y envío
 * se leen siempre de Firestore. Los valores del navegador se ignoran por completo.
 */
export async function buildQuote({ items, customer, promoCode }) {
  const db = requireDb(getAdminDb());

  const merged = new Map();
  for (const it of items) {
    const key = `${it.productId}::${it.variantId || ''}`;
    const prev = merged.get(key);
    merged.set(key, { productId: it.productId, variantId: it.variantId || null, quantity: (prev?.quantity || 0) + it.quantity });
  }
  const lines = [...merged.values()];
  const ids = [...new Set(lines.map((l) => l.productId))];
  const snaps = await db.getAll(...ids.map((id) => db.collection('products').doc(id)));
  const products = new Map(snaps.filter((s) => s.exists).map((s) => [s.id, docToObject(s)]));

  const out = [];
  for (const l of lines) {
    const p = products.get(l.productId);
    if (!p || !p.isActive) throw new HttpError(409, 'Uno de los productos de tu carrito ya no está disponible. Actualiza tu carrito.');
    let variant = null;
    if (hasVariants(p)) {
      variant = p.variants.find((v) => v.id === l.variantId);
      if (!variant) throw new HttpError(409, `Selecciona una opción válida para "${p.name}".`);
    }
    const available = getAvailableStock(p, variant?.id);
    if (available <= 0) throw new HttpError(409, `"${p.name}" está agotado.`);
    if (l.quantity > available) throw new HttpError(409, `Solo hay ${available} unidad(es) disponibles de "${p.name}".`);
    const price = getUnitPrice(p, variant?.id);
    out.push({
      productId: p.id,
      variantId: variant?.id || null,
      variantLabel: variant?.label || '',
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      image: p.thumbnail || '',
      price,
      quantity: l.quantity,
      lineTotal: price * l.quantity,
    });
  }

  const subtotal = out.reduce((s, l) => s + l.lineTotal, 0);

  let discount = 0;
  let promo = null;
  if (promoCode) {
    const q = await db.collection('promotions').where('code', '==', promoCode).limit(1).get();
    if (q.empty) throw new HttpError(400, 'El código promocional no es válido.');
    promo = docToObject(q.docs[0]);
    const now = Date.now();
    if (!promo.isActive || (promo.startDate && promo.startDate > now) || (promo.endDate && promo.endDate < now)) {
      throw new HttpError(400, 'El código promocional no está vigente.');
    }
    if (promo.usageLimit && (promo.usedCount || 0) >= promo.usageLimit) {
      throw new HttpError(400, 'El código promocional alcanzó su límite de usos.');
    }
    if (subtotal < (promo.minPurchase || 0)) {
      throw new HttpError(400, `Este código requiere una compra mínima de ${formatPrice(promo.minPurchase)}.`);
    }
    discount = promo.type === 'percentage' ? Math.round((subtotal * promo.value) / 100) : Math.min(promo.value, subtotal);
  }

  const settings = await loadSettingsFresh();
  const afterDiscount = subtotal - discount;
  let shipping = 0;
  if (customer.deliveryMethod === 'delivery') {
    shipping = Number(settings.deliveryFee) || 0;
    if (Number(settings.freeDeliveryThreshold) > 0 && afterDiscount >= Number(settings.freeDeliveryThreshold)) shipping = 0;
  }

  return {
    items: out,
    subtotal,
    discount,
    promoCode: promo?.code || '',
    promoId: promo?.id || null,
    shipping,
    total: afterDiscount + shipping,
    currency: 'DOP',
    whatsapp: settings.whatsapp || '',
  };
}

function generateOrderNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `DS-${ymd}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function createOrder(quote, customer, user) {
  const db = requireDb(getAdminDb());
  const ref = db.collection('orders').doc();
  const orderNumber = generateOrderNumber();
  const status = 'pending_whatsapp_confirmation';
  await ref.set({
    orderNumber,
    userId: user?.uid || null,
    customer,
    items: quote.items,
    subtotal: quote.subtotal,
    discount: quote.discount,
    promoCode: quote.promoCode,
    promoId: quote.promoId,
    shipping: quote.shipping,
    total: quote.total,
    currency: quote.currency,
    status,
    statusHistory: [{ status, at: Date.now(), by: 'cliente', note: 'Pedido registrado desde la tienda' }],
    internalNotes: [],
    stockDeducted: false,
    whatsappState: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id, orderNumber };
}

/**
 * Actualiza estado / notas de un pedido en una transacción.
 * El stock se descuenta SOLO cuando el administrador confirma el pedido (y se restituye si se revierte/cancela).
 */
export async function updateOrder(id, { status, note }, admin) {
  const db = requireDb(getAdminDb());
  const ref = db.collection('orders').doc(id);
  const adminLabel = admin.email || admin.uid;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, 'Pedido no encontrado.');
    const order = snap.data();
    const now = Date.now();
    const update = { updatedAt: FieldValue.serverTimestamp() };

    if (note) update.internalNotes = [...(order.internalNotes || []), { text: note, at: now, by: adminLabel }];

    if (status && status !== order.status) {
      if (TERMINAL_STATUSES.includes(order.status)) throw new HttpError(409, 'Este pedido está cerrado y no puede cambiar de estado.');

      const committed = STOCK_COMMITTED_STATUSES.includes(status);
      const needDeduct = committed && !order.stockDeducted;
      const needRestore = !committed && order.stockDeducted;

      if (needDeduct || needRestore) {
        // Todas las lecturas antes de cualquier escritura.
        const productIds = [...new Set(order.items.map((i) => i.productId))];
        const pSnaps = await tx.getAll(...productIds.map((pid) => db.collection('products').doc(pid)));
        const products = new Map(pSnaps.filter((s) => s.exists).map((s) => [s.id, s.data()]));
        const promoRef = order.promoId ? db.collection('promotions').doc(order.promoId) : null;
        const promoSnap = promoRef ? await tx.get(promoRef) : null;

        const sign = needDeduct ? -1 : 1;
        const work = new Map();
        const history = [];
        for (const it of order.items) {
          let w = work.get(it.productId);
          if (!w) {
            const p = products.get(it.productId);
            if (!p) {
              if (needDeduct) throw new HttpError(409, `El producto "${it.name}" ya no existe.`);
              continue;
            }
            w = {
              ref: db.collection('products').doc(it.productId),
              stock: p.stock || 0,
              sold: p.soldCount || 0,
              variants: (p.variants || []).map((v) => ({ ...v })),
            };
            work.set(it.productId, w);
          }
          const delta = sign * it.quantity;
          let prev;
          let next;
          if (w.variants.length && it.variantId) {
            const v = w.variants.find((x) => x.id === it.variantId);
            if (!v) {
              if (needDeduct) throw new HttpError(409, `La opción de "${it.name}" ya no existe.`);
              continue;
            }
            prev = v.stock || 0;
            next = prev + delta;
            if (next < 0) throw new HttpError(409, `Stock insuficiente para "${it.name}" (${v.label}). Disponible: ${prev}.`);
            v.stock = next;
            w.stock = w.variants.reduce((s, x) => s + (x.stock || 0), 0);
          } else {
            prev = w.stock;
            next = prev + delta;
            if (next < 0) throw new HttpError(409, `Stock insuficiente para "${it.name}". Disponible: ${prev}.`);
            w.stock = next;
          }
          w.sold = Math.max(0, w.sold + (needDeduct ? it.quantity : -it.quantity));
          history.push({
            productId: it.productId,
            productName: it.name,
            variantId: it.variantId || null,
            previous: prev,
            newQuantity: next,
            adjustment: delta,
            reason: needDeduct ? `Pedido ${order.orderNumber} confirmado` : `Pedido ${order.orderNumber} revertido (${status})`,
            adminId: admin.uid,
            adminEmail: admin.email || '',
            orderId: id,
          });
        }

        for (const w of work.values()) {
          tx.update(w.ref, { stock: w.stock, variants: w.variants, soldCount: w.sold, updatedAt: FieldValue.serverTimestamp() });
        }
        for (const h of history) {
          tx.set(db.collection('inventoryHistory').doc(), { ...h, createdAt: FieldValue.serverTimestamp() });
        }
        if (promoSnap?.exists) {
          tx.update(promoRef, { usedCount: Math.max(0, (promoSnap.data().usedCount || 0) + (needDeduct ? 1 : -1)) });
        }
        update.stockDeducted = needDeduct;
      }

      update.status = status;
      update.statusHistory = [...(order.statusHistory || []), { status, at: now, by: adminLabel, note: note || '' }];
      if (status === 'confirmed') update.whatsappState = 'confirmed';
    }

    tx.update(ref, update);
  });
}
