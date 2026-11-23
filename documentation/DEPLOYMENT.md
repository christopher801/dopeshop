# Despliegue en Vercel

1. Sube el proyecto a un repositorio Git (`.env.local` está en `.gitignore`).
2. En Vercel: *Add New → Project* e importa el repositorio (Framework: Next.js).
3. En *Settings → Environment Variables* agrega todas las variables de `.env.example`:
   - `NEXT_PUBLIC_SITE_URL` = tu dominio final con `https://`.
   - `FIREBASE_ADMIN_PRIVATE_KEY`: pega la clave con sus `\n` (Vercel acepta el valor en una línea).
   - `NEXT_PUBLIC_ENABLE_DEMO_DATA=false`.
4. Despliega. Luego agrega tu dominio en *Settings → Domains*.
5. En Firebase → Authentication → Settings → Dominios autorizados, agrega el dominio.
6. Publica `firestore.rules` (ver FIREBASE_SETUP.md).
7. Crea el administrador ([ADMIN_SETUP.md](ADMIN_SETUP.md)) y configura la tienda en `/admin/settings/store` (WhatsApp, contacto, envío).

Antes de lanzar: revisa y completa las plantillas de políticas (`src/data/policies.js`), prueba un pedido de extremo a extremo, verifica `https://TU-DOMINIO/sitemap.xml` y `/robots.txt`, y sigue [SEO_GUIDE.md](SEO_GUIDE.md).

Pruebas locales de producción (ejecútalas tú): `npm run build && npm start`.
