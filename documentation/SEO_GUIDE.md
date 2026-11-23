# Guía SEO

## Qué incluye
Metadata por página (título, descripción, canonical, Open Graph, Twitter), metadata dinámica de productos y categorías, JSON-LD (Organization, WebSite, Product/Offer con precio y disponibilidad reales, BreadcrumbList, ItemList), `sitemap.xml` y `robots.txt` generados (`src/app/sitemap.js`, `src/app/robots.js`) a partir de los productos y categorías activos. Páginas privadas (admin, cuenta, carrito, checkout) llevan `noindex` y están excluidas del sitemap. Las URL con filtros/búsqueda usan `noindex, follow` para evitar contenido duplicado. No se inventan calificaciones, reseñas ni stock.

## Pasos de lanzamiento
1. Define `NEXT_PUBLIC_SITE_URL` con tu dominio definitivo.
2. **Google Search Console**: añade la propiedad (dominio o prefijo de URL). Para verificar por etiqueta HTML, copia el valor de `content` a `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` y redespliega; luego pulsa *Verificar*.
3. Envía el sitemap: *Sitemaps → `sitemap.xml`*.
4. Solicita indexación de la página principal y productos clave con la *Inspección de URLs → Solicitar indexación*.
5. Monitorea: *Páginas* (indexadas/excluidas), *Mejoras → Productos* (datos estructurados) y *Core Web Vitals*.
6. **Bing Webmaster Tools**: importa el sitio desde Search Console o verifica con `NEXT_PUBLIC_BING_SITE_VERIFICATION` (meta `msvalidate.01`) y envía el sitemap.
7. **Google Analytics 4**: crea una propiedad y define `NEXT_PUBLIC_GA_ID` (`G-XXXXXXX`). Si usas analítica, actualiza la política de privacidad.
8. Completa `Título SEO` y `Descripción SEO` de cada producto y categoría desde el admin.

Ninguna verificación ni indexación está hecha: dependen de tu dominio publicado.
