import { siteConfig } from '@/config/site';
import { formatPrice, toWhatsAppDigits } from '@/lib/utils/format';

export function buildWhatsAppLink(message, phone = siteConfig.whatsapp) {
  const digits = toWhatsAppDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message || '')}`;
}

export function buildSupportMessage() {
  return 'Hola, estoy interesado en este producto de DOPE SHOP.';
}

export function buildGeneralMessage() {
  return 'Hola, quisiera más información sobre los productos de DOPE SHOP.';
}

export function buildProductMessage(product, url) {
  return `Hola, estoy interesado en este producto de DOPE SHOP.\n\nProducto: ${product.name}${product.sku ? `\nSKU: ${product.sku}` : ''}\nEnlace: ${url}\n\n¿Me confirman disponibilidad y precio? Gracias.`;
}

/** Mensaje de pedido en español generado a partir de un pedido ya validado por el servidor. */
export function buildOrderMessage(order) {
  if (!order?.items?.length) throw new Error('No hay productos en el pedido.');
  const lines = order.items
    .map(
      (it, i) =>
        `${i + 1}. ${it.name}${it.variantLabel ? ` (${it.variantLabel})` : ''}\n   Cantidad: ${it.quantity}\n   Precio: ${formatPrice(it.price)}`
    )
    .join('\n\n');
  const c = order.customer;
  const delivery = c.deliveryMethod === 'delivery' ? 'Entrega a domicilio' : 'Retiro en tienda';
  const parts = [
    'Hola, quiero realizar un pedido en DOPE SHOP.',
    '',
    `PEDIDO ${order.orderNumber}`,
    '',
    lines,
    '',
    `Subtotal: ${formatPrice(order.subtotal)}`,
  ];
  if (order.discount > 0) parts.push(`Descuento${order.promoCode ? ` (${order.promoCode})` : ''}: -${formatPrice(order.discount)}`);
  if (order.shipping > 0) parts.push(`Envío estimado: ${formatPrice(order.shipping)}`);
  parts.push(`Total estimado: ${formatPrice(order.total)}`, '', 'INFORMACIÓN DEL CLIENTE', '');
  parts.push(`Nombre: ${c.name}`, `WhatsApp: ${c.phone}`);
  if (c.email) parts.push(`Correo: ${c.email}`);
  parts.push(`Entrega: ${delivery}`);
  if (c.province) parts.push(`Provincia/Ciudad: ${c.province}`);
  if (c.deliveryMethod === 'delivery' && c.address) parts.push(`Dirección: ${c.address}`);
  if (c.notes) parts.push('', 'Nota:', c.notes);
  parts.push('', 'Me gustaría confirmar la disponibilidad de los productos,', 'el costo de envío y los detalles del pedido.', '', 'Gracias.');
  return parts.join('\n');
}
