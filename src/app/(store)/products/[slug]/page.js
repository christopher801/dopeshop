import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/products/ProductGallery';
import ProductGrid from '@/components/products/ProductGrid';
import ProductPurchase from '@/components/products/ProductPurchase';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { cloudinaryUrl } from '@/lib/cloudinary/url';
import { getCategories, getProductBySlug, getRelatedProducts, getSettings } from '@/lib/server/catalog';
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, productJsonLd } from '@/lib/seo';
import { getAvailableStock } from '@/lib/utils/product';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Producto no encontrado', robots: { index: false } };
  const img = product.images?.[0]?.url;
  return buildMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || product.description,
    path: `/products/${product.slug}`,
    image: img ? cloudinaryUrl(img, { width: 1200 }) : undefined,
    type: 'website',
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [product, categories, settings] = await Promise.all([getProductBySlug(slug), getCategories(), getSettings()]);
  if (!product) notFound();
  const category = categories.find((c) => c.id === product.categoryId);
  const related = await getRelatedProducts(product);
  const url = absoluteUrl(`/products/${product.slug}`);
  const available = getAvailableStock(product) > 0;

  const crumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Tienda', href: '/shop' },
    ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
    { label: product.name },
  ];
  const specs = [
    { label: 'Marca', value: product.brand },
    ...(category ? [{ label: 'Categoría', value: category.name }] : []),
    ...(product.specifications || []).filter((s) => !['marca', 'categoría', 'categoria'].includes(s.label.toLowerCase())),
  ];

  return (
    <div className="container-page pb-24 pt-6 md:pb-10 md:pt-10">
      <Breadcrumbs items={crumbs} />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            {category ? <Link href={`/categories/${category.slug}`} className="hover:underline">{category.name}</Link> : null}
            {category && product.brand ? ' · ' : ''}
            {product.brand}
          </p>
          <h1 className="mt-1 text-2xl md:text-4xl">{product.name}</h1>
          <p className="mt-1 text-xs text-muted">SKU: {product.sku}</p>
          {product.isDemo && <p className="mt-2"><span className="badge badge-ink">PRODUCTO DE DEMOSTRACIÓN</span></p>}
          {product.shortDescription && <p className="mt-4 text-gray-700">{product.shortDescription}</p>}
          <div className="mt-6">
            <ProductPurchase product={product} url={url} whatsapp={settings.whatsapp} />
          </div>
          <p className="mt-6 rounded-control bg-white p-3 text-xs text-muted ring-1 ring-line">
            Enviar tu pedido por WhatsApp no lo confirma automáticamente: la tienda verifica disponibilidad, entrega y pago contigo.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {product.description && (
          <section aria-labelledby="desc-title">
            <h2 id="desc-title" className="mb-3 text-xl">Descripción</h2>
            <div className="prose-copy whitespace-pre-line">{product.description}</div>
          </section>
        )}
        <section aria-labelledby="spec-title">
          <h2 id="spec-title" className="mb-3 text-xl">Especificaciones técnicas</h2>
          <dl className="card divide-y divide-line">
            {specs.map((s, i) => (
              <div key={i} className="grid grid-cols-[40%_1fr] gap-3 px-4 py-3 text-sm">
                <dt className="font-medium text-muted">{s.label}</dt>
                <dd className="text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="rel-title">
          <h2 id="rel-title" className="mb-5 text-xl md:text-2xl">Productos relacionados</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <JsonLd
        data={[
          productJsonLd(product, available),
          breadcrumbJsonLd(crumbs.map((c, i) => ({ name: c.label, path: c.href || `/products/${product.slug}` }))),
        ]}
      />
    </div>
  );
}
