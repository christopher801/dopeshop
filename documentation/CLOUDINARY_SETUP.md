# Configuración de Cloudinary

1. Crea una cuenta en <https://cloudinary.com> y copia del *Dashboard*: Cloud name, API Key y API Secret.
2. Colócalos en `.env.local` (y en el hosting):
   ```env
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```
3. Listo. No necesitas upload presets: la subida es **firmada**.

## Cómo funciona

1. El panel pide una firma a `POST /api/admin/upload-sign` (solo admin; el secret nunca sale del servidor).
2. El navegador sube el archivo directamente a Cloudinary con esa firma. La firma incluye `allowed_formats` (jpg, jpeg, png, webp, avif) y la carpeta `dope-shop/{products|categories|store}`.
3. El formulario valida además tipo y tamaño (máx. 5 MB) antes de subir.
4. El servidor solo acepta URLs `https://res.cloudinary.com/...` al guardar productos/categorías.
5. Al quitar imágenes de un producto/categoría guardado o eliminarlo, el servidor borra las imágenes en Cloudinary (mejor esfuerzo, solo dentro de `dope-shop/`).
6. En la tienda, las imágenes se sirven con `f_auto,q_auto` y anchos responsivos mediante un loader de `next/image`.

Opcional: en Cloudinary → Settings → Security, activa restricciones de entrega según tus necesidades.
