/** Construye una query string conservando parámetros y aplicando cambios (valores vacíos se eliminan). */
export function buildQuery(params = {}, overrides = {}) {
  const merged = { ...params, ...overrides };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === null || v === '' || (k === 'page' && String(v) === '1')) continue;
    sp.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}
