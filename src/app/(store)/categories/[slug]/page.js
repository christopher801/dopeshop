import Image from 'next/image';
import { notFound } from 'next/navigation';
import Catalog from '@/components/storefront/Catalog';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { cloudinaryUrl } from '@/lib/cloudinary/url';
import { getCategoryBySlug, queryCatalog } from '@/lib/server/catalog';
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd } from '@/lib/seo';

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Categoría no encontrada', robots: { index: false } };
  const meta = buildMetadata({
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || `Compra ${category.name} en DOPE SHOP.`,
    path: `/categories/${category.slug}`,
    image: category.image?.url ? cloudinaryUrl(category.image.url, { width: 1200 }) : undefined,
  });
  if (Object.keys(sp).length) meta.robots = { index: false, follow: true };
  return meta;
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const result = await queryCatalog(sp, { categorySlug: slug });
  const crumbs = [{ label: 'Inicio', href: '/' }, { label: 'Tienda', href: '/shop' }, { label: category.name }];

  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumbs items={crumbs} />
      <header className="mb-6 overflow-hidden rounded-card border border-line bg-white">
        <div className="relative flex flex-col justify-center gap-2 p-5 md:p-8">
          {category.image?.url && (
            <Image
              src={cloudinaryUrl(category.image.url, { width: 1200 })}
              alt=""
              fill
              unoptimized
              className="object-cover opacity-20"
              aria-hidden="true"
            />
          )}
          <h1 className="relative text-2xl md:text-3xl">{category.name}</h1>
          {category.description && <p className="relative max-w-2xl text-sm text-muted md:text-base">{category.description}</p>}
        </div>
      </header>
      <Catalog result={result} params={sp} basePath={`/categories/${slug}`} showCategoryFilter={false} />
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Tienda', path: '/shop' }, { name: category.name, path: `/categories/${slug}` }]),
          ...(result.items.length ? [itemListJsonLd(result.items)] : []),
        ]}
      />
    </div>
  );
}
