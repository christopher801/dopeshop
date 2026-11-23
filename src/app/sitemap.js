import { siteConfig } from '@/config/site';
import { getCategories, getProducts } from '@/lib/server/catalog';

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const staticPages = ['', '/shop', '/about', '/contact', '/policies/privacy', '/policies/terms', '/policies/shipping', '/policies/returns', '/policies/warranty'].map(
    (path) => ({ url: `${siteConfig.url}${path}`, lastModified: now, changeFrequency: path === '' || path === '/shop' ? 'daily' : 'monthly', priority: path === '' ? 1 : path === '/shop' ? 0.9 : 0.5 })
  );

  let categories = [];
  let products = [];
  try {
    [categories, products] = await Promise.all([getCategories(), getProducts()]);
  } catch {
    /* sin Firebase configurado: solo páginas estáticas */
  }
  return [
    ...staticPages,
    ...categories.map((c) => ({ url: `${siteConfig.url}/categories/${c.slug}`, lastModified: c.updatedAt ? new Date(c.updatedAt) : now, changeFrequency: 'weekly', priority: 0.8 })),
    ...products.map((p) => ({ url: `${siteConfig.url}/products/${p.slug}`, lastModified: p.updatedAt ? new Date(p.updatedAt) : now, changeFrequency: 'weekly', priority: 0.7 })),
  ];
}
