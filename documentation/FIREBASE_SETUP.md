# Configuración de Firebase

1. Crea un proyecto en <https://console.firebase.google.com>.
2. **Authentication → Sign-in method**: habilita *Correo electrónico/contraseña*.
3. **Firestore Database**: crea la base (modo producción) en una región cercana.
4. **Configuración del proyecto → Tus apps → Web**: registra una app web y copia la configuración en `.env.local`:
   `NEXT_PUBLIC_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`. (No se usa Firebase Storage; las imágenes van en Cloudinary.)
5. **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**. Del JSON toma:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (entre comillas, conservando `\n`)
   Nunca subas este archivo ni estas variables a Git.
6. **Dominios autorizados** (Authentication → Settings): agrega tu dominio de producción.

## Reglas de seguridad

El archivo `firestore.rules` está listo. Publícalas desde la consola (Firestore → Reglas) o con Firebase CLI:

```bash
npm i -g firebase-tools
firebase login
firebase use <tu-project-id>
firebase deploy --only firestore:rules
```

Resumen del modelo de seguridad:

| Colección | Lectura | Escritura desde el navegador |
|---|---|---|
| `products`, `categories` | Público, solo `isActive == true` | Solo admin |
| `storeSettings` | Público (sin secretos) | Solo admin |
| `promotions`, `inventoryHistory` | Solo admin | Solo admin |
| `orders` | Dueño del pedido o admin | **Creación denegada** (la hace el servidor); actualización solo admin; nunca se eliminan |
| `users/{uid}` | Dueño o admin | Dueño: solo `name`, `phone`, `wishlist` |
| `reviews` | Solo aprobadas | Solo admin |

Las operaciones sensibles (crear pedido, cambiar estado, ajustar stock, CRUD de catálogo) pasan por rutas API que usan Firebase Admin y verifican el claim `admin` en el servidor.

## Colecciones

`users`, `products`, `categories`, `orders`, `promotions`, `storeSettings` (documento `main`), `inventoryHistory`, `reviews`. Se crean automáticamente al usarse; no se necesitan índices compuestos.

## Datos iniciales

No se insertan datos. Crea categorías y productos desde `/admin`. Categorías sugeridas: Smartphones, Laptops, Computadoras, Gaming, Audio, Accesorios, Dispositivos inteligentes, Redes.
