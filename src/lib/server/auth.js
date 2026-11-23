import { getAdminAuth } from '@/lib/firebase/admin';
import { HttpError } from './http';

/** Devuelve el token decodificado del header Authorization, o null. */
export async function getUser(req) {
  const match = (req.headers.get('authorization') || '').match(/^Bearer (.+)$/);
  const auth = getAdminAuth();
  if (!match || !auth) return null;
  try {
    return await auth.verifyIdToken(match[1]);
  } catch {
    return null;
  }
}

/** Verifica en el servidor el custom claim `admin`. Nunca confía en el cliente. */
export async function requireAdmin(req) {
  if (!getAdminAuth()) throw new HttpError(503, 'El servidor no está configurado (Firebase Admin).');
  const user = await getUser(req);
  if (!user) throw new HttpError(401, 'Inicia sesión para continuar.');
  if (user.admin !== true) throw new HttpError(403, 'No tienes permisos de administrador.');
  return user;
}
