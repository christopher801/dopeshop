import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Envuelve un handler de ruta para devolver errores JSON uniformes en español. */
export function handle(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message, details: e.details }, e.status);
      if (e?.name === 'ZodError') {
        const first = e.issues?.[0]?.message;
        return json({ error: first || 'Datos inválidos', details: e.flatten().fieldErrors }, 400);
      }
      console.error('[api]', e);
      return json({ error: 'Error interno del servidor' }, 500);
    }
  };
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, 'Solicitud inválida');
  }
}

// Límite de peticiones en memoria (por instancia). Para tráfico alto usa un servicio compartido (p. ej. Upstash).
const buckets = new Map();
export function rateLimit(req, scope, limit = 10, windowMs = 60_000) {
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return;
  }
  entry.count += 1;
  if (entry.count > limit) throw new HttpError(429, 'Demasiadas solicitudes. Inténtalo de nuevo en un minuto.');
}

export function requireDb(db) {
  if (!db) throw new HttpError(503, 'El servidor no está configurado (Firebase Admin). Revisa la documentación de configuración.');
  return db;
}
