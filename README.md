# DOPE SHOP — E-commerce de tecnología

**Tech. Style. Innovation.**

Tienda en línea de una sola marca (no es un marketplace) para vender electrónicos, computadoras, smartphones, gaming, audio y accesorios en República Dominicana. Interfaz en español, moneda **DOP (RD$)**, pedidos finalizados por **WhatsApp**, PWA instalable y panel de administración protegido.

> **Estado del proyecto:** el código fue creado y revisado estáticamente (sintaxis, imports, límites cliente/servidor). **No se ha compilado, ejecutado ni probado en un navegador**, ni está conectado a un proyecto real de Firebase/Cloudinary. No hay pagos en línea: el pago se acuerda por WhatsApp.

## Características

- Tienda: inicio, catálogo con filtros reales (categoría, marca, precio, disponibilidad, ofertas), orden, paginación y búsqueda (nombre, marca, modelo/especificaciones, categoría, SKU).
- Productos con galería, variantes, especificaciones, stock, relacionados, JSON-LD y metadatos dinámicos.
- Carrito persistente (localStorage, sin datos personales) y lista de deseos (sincronizada con Firestore al iniciar sesión).
- **Checkout por WhatsApp**: el servidor revalida precios, stock, promoción y envío; registra el pedido (`pending_whatsapp_confirmation`) y genera el mensaje en español. Abrir WhatsApp **no** confirma el pedido.
- Cuentas de cliente (Firebase Auth): registro, login, recuperación, perfil, historial de pedidos. Compra como invitado disponible.
- Panel `/admin`: dashboard con datos reales, productos, categorías, inventario con historial, pedidos con historial de estados y notas, clientes, promociones y ajustes (tienda y SEO).
- Subidas a **Cloudinary** con firma en servidor (el API secret nunca llega al navegador).
- **PWA**: manifest, service worker seguro (nunca cachea HTML, API, admin ni cuenta), página offline, instalación y aviso de actualización.
- **SEO**: metadata, canonical, Open Graph, `sitemap.xml` y `robots.txt` dinámicos, JSON-LD (Organization, WebSite, Product/Offer, BreadcrumbList, ItemList).
- Accesibilidad: HTML semántico, foco visible, formularios etiquetados, `prefers-reduced-motion`, objetivos táctiles ≥ 44 px.

## Stack

Next.js (App Router) · React · JavaScript (sin TypeScript) · Tailwind CSS · Firebase Auth + Cloud Firestore · Firebase Admin SDK · Cloudinary · Lucide React · Zod. Compatible con Vercel.

## Estructura

```text
dope-shop/
├── public/            manifest, sw.js, offline.html, iconos, og-default.png
├── src/
│   ├── app/           rutas (App Router)
│   │   ├── (store)/   tienda pública (header/footer)
│   │   ├── admin/     panel protegido
│   │   ├── api/       API: pedidos, lookup, admin/*
│   │   ├── robots.js · sitemap.js
│   ├── components/    layout, products, storefront, cart, checkout, admin, forms, ui, seo
│   ├── context/       Auth, Cart, Wishlist, Toast
│   ├── lib/           firebase (client/admin), cloudinary, whatsapp, seo, validations, server, utils
│   ├── hooks/ config/ constants/ data/ (data/demo.js = demo aislada)
├── documentation/     guías de configuración
├── firestore.rules · firestore.indexes.json · firebase.json
├── set-admin.js       concede/revoca permiso de administrador
├── genIcons.js        regenera iconos PWA
└── .env.example
```

## Requisitos

Node.js ≥ 20.6, una cuenta de Firebase, una cuenta de Cloudinary y el número de WhatsApp de la tienda.

## Instalación

```bash
npm install
cp .env.example .env.local     # completa las variables
npm run dev                    # http://localhost:3000
```

## Variables de entorno

Ver `.env.example`. Las que **no** llevan `NEXT_PUBLIC_` (`FIREBASE_ADMIN_*`, `CLOUDINARY_*`) son secretas y solo se usan en el servidor. Nunca las subas a Git.

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública (canonical, sitemap, OG) |
| `NEXT_PUBLIC_STORE_WHATSAPP` | WhatsApp de la tienda (dígitos con código de país). También editable en Admin → Ajustes |
| `NEXT_PUBLIC_FIREBASE_*` | Configuración web de Firebase |
| `FIREBASE_ADMIN_*` | Credenciales de servicio (servidor) |
| `CLOUDINARY_*` | Credenciales Cloudinary (servidor) |
| `NEXT_PUBLIC_GA_ID`, `*_SITE_VERIFICATION` | Analítica y verificación (opcional) |
| `NEXT_PUBLIC_ENABLE_DEMO_DATA` | `true` = catálogo DEMO en memoria si Firebase Admin no está configurado |

## Configuración paso a paso

1. [Firebase](documentation/FIREBASE_SETUP.md) — proyecto, Auth, Firestore y reglas.
2. [Administrador inicial](documentation/ADMIN_SETUP.md) — custom claim `admin`.
3. [Cloudinary](documentation/CLOUDINARY_SETUP.md) — subida de imágenes.
4. WhatsApp — define `NEXT_PUBLIC_STORE_WHATSAPP` (ej. `1809XXXXXXX`) o Admin → Ajustes → Tienda.
5. [PWA](documentation/PWA_GUIDE.md) y [SEO](documentation/SEO_GUIDE.md) (Google Search Console, Bing Webmaster Tools).
6. [Despliegue](documentation/DEPLOYMENT.md) en Vercel.

## Comandos

```bash
npm run dev          # desarrollo
npm run lint         # ESLint (next lint)
npm run build        # producción (ejecútalo tú; no se ejecutó durante la creación)
npm start            # servir build
npm run icons        # regenerar iconos PWA
npm run set-admin -- correo@ejemplo.com [--revoke]
```

## Datos de demostración

Con `NEXT_PUBLIC_ENABLE_DEMO_DATA=true` y **sin** credenciales de Firebase Admin se muestra un catálogo de ejemplo en memoria (productos marcados *DEMO*, banner visible). No escribe en Firestore y los pedidos se rechazan en ese modo. Para producción: configura Firebase Admin y deja la variable en `false`; opcionalmente elimina `src/data/demo.js`.

## Solución de problemas

- **"El servidor no está configurado"** → faltan `FIREBASE_ADMIN_*`. Revisa que la clave privada conserve los `\n`.
- **Acceso denegado en /admin** → el usuario no tiene el claim; ejecuta `set-admin` y vuelve a iniciar sesión.
- **Cambios del admin no se ven de inmediato** → el catálogo se cachea hasta 60 s; las escrituras del admin invalidan la caché.
- **El service worker no actualiza** → solo se registra en producción; acepta el aviso "Actualizar".
- **Imágenes no cargan** → verifica `CLOUDINARY_*` y que las URLs sean `https://res.cloudinary.com/...`.

## Limitaciones conocidas

- Sin pasarela de pago (por diseño). El pago y la confirmación son manuales por WhatsApp.
- El catálogo público se filtra en memoria sobre hasta 1000 productos activos (cacheado). Para catálogos mucho mayores, migra a consultas indexadas o un buscador (Algolia/Typesense).
- Estadísticas del dashboard leen hasta 2000 pedidos/productos; para mayor volumen usa contadores agregados.
- Límite de peticiones en memoria por instancia; en alto tráfico usa un servicio compartido (p. ej. Upstash).
- Las políticas son **plantillas** que el propietario debe revisar (no constituyen asesoría legal).
- Newsletter y formulario de contacto no se incluyen (requieren backend de correo); la página de contacto usa WhatsApp/correo/teléfono.
- Reseñas: la regla de Firestore existe, pero no hay interfaz (no se muestran calificaciones inventadas).
- Los iconos son una "D" tipográfica reemplazable (`genIcons.js` / `public/icons`).
