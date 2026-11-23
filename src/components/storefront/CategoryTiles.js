import Image from 'next/image';
import Link from 'next/link';
import { Gamepad2, Headphones, Laptop, Monitor, Package, Plug, Smartphone, Watch, Wifi } from 'lucide-react';
import { cloudinaryUrl } from '@/lib/cloudinary/url';

const ICONS = { smartphones: Smartphone, laptops: Laptop, computers: Monitor, gaming: Gamepad2, audio: Headphones, accessories: Plug, 'smart-devices': Watch, networking: Wifi };

export default function CategoryTiles({ categories }) {
  if (!categories.length) return null;
  return (
    <section className="section" aria-labelledby="cats-title">
      <div className="container-page">
        <h2 id="cats-title" className="mb-5 text-xl md:text-3xl">Explora por categoría</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = ICONS[c.slug] || Package;
            return (
              <li key={c.id}>
                <Link href={`/categories/${c.slug}`} className="card group relative flex h-full min-h-[120px] flex-col justify-end overflow-hidden p-4 transition hover:shadow-lift">
                  {c.image?.url ? (
                    <Image src={cloudinaryUrl(c.image.url, { width: 600 })} alt="" fill unoptimized className="object-cover transition duration-300 group-hover:scale-105" aria-hidden="true" />
                  ) : (
                    <Icon className="absolute right-3 top-3 h-8 w-8 text-gray-300 transition group-hover:text-ink" aria-hidden="true" />
                  )}
                  {c.image?.url && <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" aria-hidden="true" />}
                  <span className={`relative text-base font-bold ${c.image?.url ? 'text-white' : 'text-ink'}`}>{c.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
