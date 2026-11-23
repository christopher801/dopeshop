export const ORDER_STATUSES = {
  pending_whatsapp_confirmation: { label: 'Pendiente de confirmación por WhatsApp', tone: 'amber' },
  pending_confirmation: { label: 'Pendiente de confirmación', tone: 'amber' },
  confirmed: { label: 'Confirmado', tone: 'blue' },
  processing: { label: 'En proceso', tone: 'blue' },
  ready_for_delivery: { label: 'Listo para entrega', tone: 'violet' },
  shipped: { label: 'Enviado', tone: 'violet' },
  delivered: { label: 'Entregado', tone: 'green' },
  cancelled: { label: 'Cancelado', tone: 'red' },
};
export const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUSES);
// Estados en los que el stock ya fue descontado (confirmación manual del administrador).
export const STOCK_COMMITTED_STATUSES = ['confirmed', 'processing', 'ready_for_delivery', 'shipped', 'delivered'];
export const REVENUE_STATUSES = STOCK_COMMITTED_STATUSES;
export const TERMINAL_STATUSES = ['delivered', 'cancelled'];

export const DELIVERY_METHODS = [
  { value: 'pickup', label: 'Retiro en tienda' },
  { value: 'delivery', label: 'Entrega a domicilio' },
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A–Z' },
  { value: 'popular', label: 'Más populares' },
];

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/shop', label: 'Tienda' },
  { href: '/shop?promo=1', label: 'Ofertas' },
];

export const STORAGE_KEYS = { cart: 'dope-cart-v1', wishlist: 'dope-wishlist-v1' };
