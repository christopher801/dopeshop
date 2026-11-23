'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductImage from '@/components/ui/ProductImage';
import { cloudinaryThumb } from '@/lib/cloudinary/url';

export default function ProductGallery({ images = [], name }) {
  const [index, setIndex] = useState(0);
  const list = images.length ? images : [{ url: '', alt: name }];
  const current = list[index] || list[0];
  const go = (d) => setIndex((i) => (i + d + list.length) % list.length);

  return (
    <div>
      <div className="card relative aspect-square w-full overflow-hidden bg-white">
        <ProductImage src={current.url} alt={current.alt || `${name} — imagen ${index + 1}`} priority sizes="(max-width: 1024px) 100vw, 50vw" className="p-4" />
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Imagen anterior" className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-card hover:bg-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Imagen siguiente" className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-card hover:bg-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {list.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
          {list.map((img, i) => (
            <li key={img.publicId || i} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === index}
                className={`relative h-16 w-16 overflow-hidden rounded-control border bg-white md:h-20 md:w-20 ${i === index ? 'border-ink ring-2 ring-lime' : 'border-line'}`}
              >
                <ProductImage src={cloudinaryThumb(img.url, 160)} alt="" sizes="80px" className="p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
