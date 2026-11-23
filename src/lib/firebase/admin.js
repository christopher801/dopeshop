// SOLO servidor. Nunca importar desde componentes 'use client'.
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/^"|"$/g, '');

export const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

function getAdminApp() {
  if (!isAdminConfigured) return null;
  return getApps().length ? getApps()[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export function getAdminDb() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminAuth() {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export { FieldValue };

/** Convierte Timestamps de Firestore a milisegundos para poder enviarlos a componentes cliente. */
export function serialize(value) {
  if (value === null || value === undefined) return value;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = serialize(value[k]);
    return out;
  }
  return value;
}

export function docToObject(snap) {
  return { id: snap.id, ...serialize(snap.data()) };
}
