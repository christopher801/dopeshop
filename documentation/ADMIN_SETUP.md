# Crear el primer administrador

El permiso de administrador es un **custom claim** (`admin: true`) de Firebase Auth. No depende de campos editables, localStorage ni URLs, y **ningún usuario recibe admin automáticamente**. No existe un endpoint público de registro de administradores.

1. Crea el proyecto Firebase y habilita Email/Password ([FIREBASE_SETUP.md](FIREBASE_SETUP.md)).
2. Registra la cuenta del administrador en `/account/register` (o créala en Authentication → Users).
3. Configura `FIREBASE_ADMIN_*` en `.env.local`.
4. Concede el permiso:
   ```bash
   npm run set-admin -- correo-del-admin@ejemplo.com
   ```
   (Requiere Node ≥ 20.6 por `--env-file`.)
5. Cierra sesión y vuelve a iniciar para refrescar el token.
6. Entra a `/admin`. Para probar el rechazo, entra con otra cuenta: verás "Acceso denegado" y las rutas `/api/admin/*` responderán 403.
7. Higiene: guarda la clave de servicio solo en `.env.local` y en las variables del hosting; elimina cualquier copia descargada del JSON. Para revocar: `npm run set-admin -- correo@ejemplo.com --revoke`.
