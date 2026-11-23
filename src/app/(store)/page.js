import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Headset, Info, MessageCircle, UserCheck } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import CategoryTiles from '@/components/storefront/CategoryTiles';
import ProductSection from '@/components/storefront/ProductSection';
import { getCategories, getHomeSections, getSettings } from '@/lib/server/catalog';
import { buildMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { cloudinaryUrl } from '@/lib/cloudinary/url';
import { buildGeneralMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import { productImage } from '@/lib/utils/product';

export const revalidate = 60;

export const metadata = buildMetadata({ title: undefined, path: '/' });

const BENEFITS = [
  { icon: UserCheck, title: 'Atención personalizada', text: 'Te orientamos para elegir el producto adecuado.' },
  { icon: BadgeCheck, title: 'Productos seleccionados', text: 'Catálogo curado de tecnología y accesorios.' },
  { icon: MessageCircle, title: 'Consulta directa por WhatsApp', text: 'Pregunta disponibilidad antes de comprar.' },
  { icon: Info, title: 'Información clara', text: 'Precios y especificaciones a la vista.' },
  { icon: Headset, title: 'Servicio al cliente', text: 'Escríbenos y te respondemos.' },
];

export default async function HomePage() {
  const [settings, categories, sections] = await Promise.all([getSettings(), getCategories(), getHomeSections()]);
  const wa = buildWhatsAppLink(buildGeneralMessage(), settings.whatsapp);
  const hero = sections.featured[0] || sections.newArrivals[0];
  const heroImg = productImage(hero);

  return (
    <>
      <section className="container-page pt-4 md:pt-6" aria-labelledby="hero-title">
        <div className="relative overflow-hidden rounded-card bg-ink text-text-light">
          <div className="grid items-center gap-6 p-6 md:grid-cols-2 md:p-12">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-lime">
                <span className="h-1.5 w-6 rounded-full bg-lime" aria-hidden="true" /> Tech. Style. Innovation.
              </p>
              <h1 id="hero-title" className="text-3xl font-extrabold leading-[1.1] !text-white sm:text-4xl lg:text-5xl">
                TECNOLOGÍA QUE TRANSFORMA TU DÍA.
              </h1>
              <p className="mt-4 max-w-md text-sm text-gray-300 md:text-base">
                Descubre dispositivos, accesorios y tecnología diseñada para llevar tu experiencia al siguiente nivel.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="btn btn-accent">Explorar productos</Link>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-white/30 text-white hover:bg-white/10">
                    Consultar por WhatsApp
                  </a>
                )}
              </div>
            </div>
            <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-md md:block">
              {heroImg ? (
                <Link href={`/products/${hero.slug}`} aria-label={`Ver ${hero.name}`}>
                  <Image src={cloudinaryUrl(heroImg, { width: 800 })} alt={hero.name} fill unoptimized priority className="object-contain drop-shadow-2xl" />
                </Link>
              ) : (
                <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Ilustración de dispositivos">
                  <rect x="40" y="60" width="220" height="140" rx="12" fill="#18181B" stroke="#B8FF45" strokeWidth="3" />
                  <rect x="20" y="205" width="260" height="14" rx="7" fill="#B8FF45" />
                  <rect x="270" y="90" width="80" height="150" rx="14" fill="#18181B" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="3" />
                  <circle cx="310" cy="222" r="6" fill="#B8FF45" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </section>

      <CategoryTiles categories={categories} />

      {sections.total === 0 && (
        <section className="container-page section">
          <div className="card p-8 text-center">
            <h2 className="text-lg">Estamos preparando el catálogo</h2>
            <p className="mt-2 text-sm text-muted">Muy pronto verás aquí nuestros productos. Mientras tanto, escríbenos por WhatsApp.</p>
          </div>
        </section>
      )}

      <ProductSection id="featured" title="Productos destacados" href="/shop" products={sections.featured} />
      <ProductSection id="best" title="Más vendidos" href="/shop?sort=popular" products={sections.bestSellers} />
      <ProductSection id="new" title="Nuevos ingresos" href="/shop?sort=recent" products={sections.newArrivals} />
      <ProductSection id="promos" title="Promociones" href="/shop?promo=1" products={sections.promotions} />

      <section className="section" aria-labelledby="benefits-title">
        <div className="container-page">
          <h2 id="benefits-title" className="sr-only">Beneficios de comprar en DOPE SHOP</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card flex flex-col gap-2 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-control bg-ink text-lime"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-xs text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <JsonLd data={[organizationJsonLd(settings), websiteJsonLd()]} />
    </>
  );
}
