/** Utilidades de URL de Cloudinary (seguras para cliente y servidor). */
export function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.startsWith('https://res.cloudinary.com/') && url.includes('/upload/');
}

/** Inserta transformaciones de optimización (formato/calidad/ancho automáticos). */
export function cloudinaryUrl(url, { width, crop = 'limit' } = {}) {
  if (!isCloudinaryUrl(url)) return url;
  const t = ['f_auto', 'q_auto', width ? `w_${Math.round(width)}` : null, width ? `c_${crop}` : null].filter(Boolean).join(',');
  return url.replace('/upload/', `/upload/${t}/`);
}

export function cloudinaryThumb(url, size = 160) {
  if (!isCloudinaryUrl(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${size},h_${size},c_fill/`);
}
