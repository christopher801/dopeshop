'use client';

import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import ProductImage from '@/components/ui/ProductImage';
import { useToast } from '@/context/ToastContext';
import { cloudinaryThumb } from '@/lib/cloudinary/url';
import { apiFetch } from '@/lib/utils/api';

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_MB = 5;

/**
 * Subida firmada a Cloudinary: el servidor firma, el navegador sube el archivo directamente.
 * `images` = [{ url, publicId, alt }]. Con `single` solo admite una imagen.
 */
export default function ImageUploader({ images, onChange, folder = 'products', single = false, max = 10 }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const sessionUploads = useRef(new Set());

  async function uploadOne(file) {
    if (!TYPES.includes(file.type)) throw new Error(`"${file.name}": formato no permitido (usa JPG, PNG, WebP o AVIF).`);
    if (file.size > MAX_MB * 1024 * 1024) throw new Error(`"${file.name}" supera ${MAX_MB} MB.`);
    const sig = await apiFetch('/api/admin/upload-sign', { method: 'POST', body: { folder }, auth: true });
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', sig.timestamp);
    fd.append('signature', sig.signature);
    fd.append('folder', sig.folder);
    fd.append('allowed_formats', sig.allowedFormats);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'No se pudo subir la imagen.');
    sessionUploads.current.add(data.public_id);
    return { url: data.secure_url, publicId: data.public_id, alt: '' };
  }

  async function onFiles(e) {
    const files = [...e.target.files].slice(0, single ? 1 : max - images.length);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    const added = [];
    for (const f of files) {
      try {
        added.push(await uploadOne(f));
      } catch (err) {
        toast(err.message, 'error');
      }
    }
    if (added.length) onChange(single ? added : [...images, ...added]);
    setBusy(false);
  }

  function remove(i) {
    const img = images[i];
    onChange(images.filter((_, idx) => idx !== i));
    // Imágenes subidas en esta sesión y nunca guardadas se eliminan de inmediato; las guardadas las limpia el servidor al guardar.
    if (sessionUploads.current.has(img.publicId)) {
      apiFetch('/api/admin/images', { method: 'DELETE', body: { publicId: img.publicId }, auth: true }).catch(() => {});
      sessionUploads.current.delete(img.publicId);
    }
  }

  function move(i, d) {
    const next = [...images];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      {images.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.publicId} className="card space-y-2 p-2">
              <div className="relative aspect-square overflow-hidden rounded-control bg-gray-50">
                <ProductImage src={cloudinaryThumb(img.url, 300)} alt={img.alt || `Imagen ${i + 1}`} sizes="200px" className="p-1" />
                {i === 0 && !single && <span className="badge badge-lime absolute left-1 top-1">Principal</span>}
              </div>
              <input
                className="input !min-h-[36px] !py-1 text-xs"
                placeholder="Texto alternativo (SEO)"
                aria-label={`Texto alternativo de la imagen ${i + 1}`}
                value={img.alt || ''}
                onChange={(e) => onChange(images.map((x, idx) => (idx === i ? { ...x, alt: e.target.value } : x)))}
                maxLength={200}
              />
              <div className="flex justify-between">
                {!single && (
                  <span className="flex">
                    <button type="button" className="btn-icon !h-9 !w-9" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover antes"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" className="btn-icon !h-9 !w-9" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Mover después"><ArrowDown className="h-4 w-4" /></button>
                  </span>
                )}
                <button type="button" className="btn-icon !h-9 !w-9 text-red-600" onClick={() => remove(i)} aria-label="Quitar imagen"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {(single ? images.length === 0 : images.length < max) && (
        <>
          <input ref={inputRef} type="file" accept={TYPES.join(',')} multiple={!single} className="sr-only" onChange={onFiles} aria-label="Seleccionar imágenes" />
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
            {busy ? 'Subiendo…' : single ? 'Subir imagen' : 'Subir imágenes'}
          </button>
          <p className="field-hint">JPG, PNG, WebP o AVIF · máx. {MAX_MB} MB por archivo.</p>
        </>
      )}
    </div>
  );
}
