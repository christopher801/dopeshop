/**
 * Concede o revoca el permiso de administrador (custom claim `admin`) a un usuario existente.
 *
 * Uso:
 *   npm run set-admin -- correo@ejemplo.com           (conceder)
 *   npm run set-admin -- correo@ejemplo.com --revoke  (revocar)
 *
 * Requiere FIREBASE_ADMIN_* en .env.local. El usuario debe cerrar sesión y volver a
 * iniciarla para que su token incluya el nuevo permiso.
 */
const { cert, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

async function main() {
  const email = process.argv[2];
  const revoke = process.argv.includes('--revoke');
  if (!email || email.startsWith('--')) {
    console.error('Uso: npm run set-admin -- correo@ejemplo.com [--revoke]');
    process.exit(1);
  }
  const { FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY } = process.env;
  if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
    console.error('Faltan variables FIREBASE_ADMIN_* en .env.local');
    process.exit(1);
  }
  initializeApp({
    credential: cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: !revoke });
  console.log(`${revoke ? 'Permiso de administrador revocado' : 'Permiso de administrador concedido'} para ${email} (uid ${user.uid}).`);
  console.log('El usuario debe cerrar sesión e iniciarla de nuevo.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
