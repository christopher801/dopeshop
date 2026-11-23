import { siteConfig } from '@/config/site';

export const absoluteUrl = (path = '/') => `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;

const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trim()}…` : s || '');

/** Construye metadata de Next.js (title, description, canonical, Open Graph, Twitter). */
export function buildMetadata({ title, description, path = '/', image, noindex = false, type = 'website' }) {
  const url = absoluteUrl(path);
  const img = image || absoluteUrl('/images/og-default.png');
  const desc = truncate(description || siteConfig.description, 160);
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description: desc,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [{ url: img, alt: title || siteConfig.name }],
    },
    twitter: { card: 'summary_large_image', title: title || siteConfig.name, description: desc, images: [img] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function organizationJsonLd(settings) {
  const sameAs = Object.values(settings?.social || {}).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.storeName || siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl('/icons/icon-512.png'),
    ...(sameAs.length ? { sameAs } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.phone ? { telephone: settings.phone } : {}),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

/** Product + Offer con datos reales. No se inventan calificaciones ni reseñas. */
export function productJsonLd(product, available) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: truncate(product.shortDescription || product.description, 500) || undefined,
    sku: product.sku,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    image: (product.images || []).map((i) => i.url),
    url: absoluteUrl(`/products/${product.slug}`),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: product.currency || 'DOP',
      price: product.price,
      availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

export function itemListJsonLd(products) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };
}
