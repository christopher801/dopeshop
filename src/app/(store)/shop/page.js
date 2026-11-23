import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Catalog from '@/components/storefront/Catalog';
import JsonLd from '@/components/seo/JsonLd';
import { queryCatalog } from '@/lib/server/catalog';
import { buildMetadata, itemListJsonLd } from '@/lib/seo';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const meta = buildMetadata({
    title: sp.q ? `Resultados para "${sp.q}"` : 'Tienda de tecnología',
    description: 'Explora smartphones, laptops, gaming, audio y accesorios en DOPE SHOP. Filtra por marca, precio y disponibilidad.',
    path: '/shop',
  });
  // Evita indexar combinaciones infinitas de filtros / búsquedas.
  if (Object.keys(sp).length) meta.robots = { index: false, follow: true };
  return meta;
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const result = await queryCatalog(params);
  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Tienda' }]} />
      <h1 className="mb-6 text-2xl md:text-3xl">{params.promo === '1' ? 'Ofertas' : 'Tienda'}</h1>
      <Catalog result={result} params={params} basePath="/shop" />
      {result.items.length > 0 && <JsonLd data={itemListJsonLd(result.items)} />}
    </div>
  );
}
