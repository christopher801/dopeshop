import { unstable_cache } from 'next/cache';
import { defaultSettings, siteConfig } from '@/config/site';
import { demoCategories, demoProducts } from '@/data/demo';
import { docToObject, getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { normalizeText } from '@/lib/utils/format';
import { getAvailableStock, isOnSale } from '@/lib/utils/product';

export const CATALOG_TAG = 'catalog';
const useDemo = !isAdminConfigured && siteConfig.demoEnabled;
export const isDemoMode = useDemo;

async function loadProducts() {
  if (!isAdminConfigured) return useDemo ? demoProducts : [];
  const snap = await getAdminDb().collection('products').where('isActive', '==', true).limit(1000).get();
  return snap.docs.map(docToObject);
}

async function loadCategories() {
  if (!isAdminConfigured) return useDemo ? demoCategories : [];
  const snap = await getAdminDb().collection('categories').where('isActive', '==', true).get();
  return snap.docs.map(docToObject).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name));
}

export async function loadSettingsFresh() {
  let stored = {};
  if (isAdminConfigured) {
    const snap = await getAdminDb().collection('storeSettings').doc('main').get();
    if (snap.exists) stored = docToObject(snap);
  }
  return {
    ...defaultSettings,
    ...stored,
    whatsapp: stored.whatsapp || defaultSettings.whatsapp,
    social: { ...defaultSettings.social, ...(stored.social || {}) },
    announcement: { ...defaultSettings.announcement, ...(stored.announcement || {}) },
  };
}

export const getProducts = unstable_cache(loadProducts, ['catalog-products'], { revalidate: 60, tags: [CATALOG_TAG] });
export const getCategories = unstable_cache(loadCategories, ['catalog-categories'], { revalidate: 60, tags: [CATALOG_TAG] });
export const getSettings = unstable_cache(loadSettingsFresh, ['catalog-settings'], { revalidate: 60, tags: [CATALOG_TAG] });

export async function getProductBySlug(slug) {
  return (await getProducts()).find((p) => p.slug === slug) || null;
}

export async function getCategoryBySlug(slug) {
  return (await getCategories()).find((c) => c.slug === slug) || null;
}

export async function getRelatedProducts(product, limit = 4) {
  const all = await getProducts();
  return all.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, limit);
}

export async function getHomeSections() {
  const all = await getProducts();
  const byRecent = [...all].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return {
    total: all.length,
    featured: all.filter((p) => p.isFeatured).slice(0, 8),
    bestSellers: all.filter((p) => p.isBestSeller).slice(0, 8),
    newArrivals: (all.some((p) => p.isNewArrival) ? byRecent.filter((p) => p.isNewArrival) : byRecent).slice(0, 8),
    promotions: all.filter((p) => isOnSale(p) || p.isOnSale).slice(0, 8),
  };
}

const num = (v) => (v === undefined || v === '' || v === null || Number.isNaN(Number(v)) ? null : Number(v));

/** Filtra, ordena y pagina el catálogo en el servidor. Los filtros SÍ filtran productos. */
export async function queryCatalog(params = {}, { categorySlug } = {}) {
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const catSlug = categorySlug || params.category || '';
  const q = normalizeText(params.q);
  const minP = num(params.min);
  const maxP = num(params.max);
  const brandsSel = (params.brand ? String(params.brand).split(',') : []).map(normalizeText).filter(Boolean);

  const base = catSlug ? all.filter((p) => catById.get(p.categoryId)?.slug === catSlug) : all;
  const brands = [...new Set(base.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  let items = base.filter((p) => {
    if (q) {
      const haystack = normalizeText(
        [p.name, p.brand, p.sku, catById.get(p.categoryId)?.name, ...(p.specifications || []).map((s) => s.value)].join(' ')
      );
      if (!q.split(/\s+/).every((t) => haystack.includes(t))) return false;
    }
    if (brandsSel.length && !brandsSel.includes(normalizeText(p.brand))) return false;
    if (minP !== null && p.price < minP) return false;
    if (maxP !== null && p.price > maxP) return false;
    if (params.stock === '1' && getAvailableStock(p) <= 0) return false;
    if (params.promo === '1' && !(isOnSale(p) || p.isOnSale)) return false;
    return true;
  });

  const sorts = {
    recent: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name, 'es'),
    popular: (a, b) => (b.soldCount || 0) - (a.soldCount || 0),
  };
  items = items.sort(sorts[params.sort] || sorts.recent);

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / siteConfig.pageSize));
  const page = Math.min(Math.max(parseInt(params.page, 10) || 1, 1), pages);
  const slice = items.slice((page - 1) * siteConfig.pageSize, page * siteConfig.pageSize);
  const prices = base.map((p) => p.price);
  return {
    items: slice,
    total,
    page,
    pages,
    brands,
    categories,
    priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
  };
}
