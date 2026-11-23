const moneyFormatter = new Intl.NumberFormat('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** Formatea un monto en pesos dominicanos: RD$35,000 */
export function formatPrice(value) {
  const n = Number(value) || 0;
  return `RD$${moneyFormatter.format(n)}`;
}

export function formatDate(ms, withTime = false) {
  if (!ms) return '—';
  return new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(new Date(ms));
}

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function toWhatsAppDigits(value) {
  return String(value || '').replace(/\D/g, '');
}
