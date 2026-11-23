'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary/url';

const cldLoader = ({ src, width }) => cloudinaryUrl(src, { width });

/** Imagen optimizada con Cloudinary, con marcador de posición si no existe o falla la carga. */
export default function ProductImage({ src, alt, sizes = '(max-width: 768px) 50vw, 25vw', priority = false, className = '', fill = true, width, height }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 ${className}`} role="img" aria-label={alt || 'Imagen no disponible'}>
        <ImageOff className="h-8 w-8" aria-hidden="true" />
      </div>
    );
  }
  const common = {
    src,
    alt: alt || '',
    sizes,
    priority,
    className: `object-contain ${className}`,
    loader: isCloudinaryUrl(src) ? cldLoader : undefined,
    unoptimized: !isCloudinaryUrl(src),
    onError: () => setFailed(true),
  };
  return fill ? <Image {...common} fill /> : <Image {...common} width={width || 600} height={height || 600} />;
}
