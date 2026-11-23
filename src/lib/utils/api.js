import { getAuthClient } from '@/lib/firebase/client';

/** fetch con token de Firebase (si hay sesión) y manejo uniforme de errores en español. */
export async function apiFetch(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const user = getAuthClient()?.currentUser;
    if (!user) throw new Error('Debes iniciar sesión.');
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  let res;
  try {
    res = await fetch(path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal, cache: 'no-store' });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error('No se pudo conectar con el servidor. Comprueba tu conexión.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respuesta sin cuerpo */
  }
  if (!res.ok) {
    const err = new Error(data?.error || 'Ocurrió un error inesperado.');
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}
