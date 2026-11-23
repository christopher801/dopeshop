const FIREBASE_MESSAGES = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Error de red. Comprueba tu conexión a Internet.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'permission-denied': 'No tienes permiso para realizar esta acción.',
  unavailable: 'Servicio no disponible. Comprueba tu conexión.',
};

export function friendlyError(err, fallback = 'Ocurrió un error inesperado. Inténtalo de nuevo.') {
  if (!err) return fallback;
  if (err.code && FIREBASE_MESSAGES[err.code]) return FIREBASE_MESSAGES[err.code];
  if (typeof err.message === 'string' && err.message && !err.code) return err.message;
  return fallback;
}
