# Guía PWA

- **Manifest**: `public/manifest.webmanifest` (standalone, theme `#101114`, iconos 192/512 y maskable).
- **Iconos**: `public/icons/*`. Son una "D" tipográfica en los colores de marca; reemplázalos por tu logo o edita y ejecuta `npm run icons`.
- **Service worker**: `public/sw.js`, registrado solo en producción.
  - Las páginas HTML **siempre van a la red** (precios y stock no quedan obsoletos); sin conexión se muestra `/offline.html`.
  - **Nunca** intercepta `/api`, `/admin`, `/account`, `/cart` ni `/checkout`, por lo que no cachea datos privados ni respuestas de pedidos. Sin conexión nunca se confirma un pedido.
  - Solo cachea activos estáticos inmutables (`/_next/static`, `/icons`).
  - Actualizaciones: al detectar una versión nueva se muestra un aviso "Actualizar". Para forzar invalidación de cachés cambia `VERSION` en `sw.js`.
- **Instalación**: el botón "Instalar app" (pie de página) aparece solo si el navegador lo permite; en iOS muestra instrucciones (Compartir → Añadir a pantalla de inicio).
- **SEO y PWA**: el SW no bloquea rastreo ni indexación (no cachea HTML).
- **Probar**: `npm run build && npm start`, abre en Chrome → DevTools → Application (Manifest / Service Workers) y Lighthouse.
