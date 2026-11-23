/** Utilidades de producto compartidas entre servidor y cliente. */
export function hasVariants(p) {
  return Array.isArray(p?.variants) && p.variants.length > 0;
}

export function getAvailableStock(p, variantId) {
  if (!p) return 0;
  if (hasVariants(p)) {
    if (variantId) return Number(p.variants.find((v) => v.id === variantId)?.stock) || 0;
    return p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }
  return Number(p.stock) || 0;
}

export function getUnitPrice(p, variantId) {
  const v = hasVariants(p) && variantId ? p.variants.find((x) => x.id === variantId) : null;
  return v && v.price != null && v.price !== '' ? Number(v.price) : Number(p.price) || 0;
}

export function isOnSale(p) {
  return Number(p?.compareAtPrice) > Number(p?.price);
}

export function discountPercent(p) {
  if (!isOnSale(p)) return 0;
  return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
}

export function stockState(p) {
  const stock = getAvailableStock(p);
  if (stock <= 0) return { key: 'out', label: 'Agotado' };
  if (stock <= (Number(p.lowStockThreshold) || 5)) return { key: 'low', label: 'Pocas unidades' };
  return { key: 'in', label: 'Disponible' };
}

export function productImage(p) {
  return p?.thumbnail || p?.images?.[0]?.url || '';
}
