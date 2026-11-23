// SOLO servidor.
import { v2 as cloudinary } from 'cloudinary';

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

export const UPLOAD_FOLDER_ROOT = 'dope-shop';
export const ALLOWED_FORMATS = 'jpg,jpeg,png,webp,avif';

export function getCloudinary() {
  if (!isCloudinaryConfigured) return null;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

/** Elimina imágenes (mejor esfuerzo). Solo acepta publicIds dentro de la carpeta de la tienda. */
export async function destroyImages(publicIds = []) {
  const cld = getCloudinary();
  if (!cld) return;
  const safe = publicIds.filter((id) => typeof id === 'string' && id.startsWith(`${UPLOAD_FOLDER_ROOT}/`));
  await Promise.allSettled(safe.map((id) => cld.uploader.destroy(id, { invalidate: true })));
}
