/**
 * DATOS DE DEMOSTRACIÓN — solo en memoria.
 * Se usan únicamente si NEXT_PUBLIC_ENABLE_DEMO_DATA=true y Firebase Admin NO está configurado.
 * Nunca se escriben en Firestore. Todos los elementos llevan isDemo: true y se identifican en la UI.
 * No representan inventario real. Para producción: configura Firebase Admin y deja la bandera en false.
 */
const now = Date.now();
const day = 86400000;

export const demoCategories = [
  ['smartphones', 'Smartphones'],
  ['laptops', 'Laptops'],
  ['computers', 'Computadoras'],
  ['gaming', 'Gaming'],
  ['audio', 'Audio'],
  ['accessories', 'Accesorios'],
  ['smart-devices', 'Dispositivos inteligentes'],
  ['networking', 'Redes'],
].map(([slug, name], i) => ({
  id: `demo-cat-${slug}`,
  slug,
  name,
  description: `Categoría de demostración: ${name}.`,
  image: null,
  seoTitle: '',
  seoDescription: '',
  isActive: true,
  sortOrder: i,
  isDemo: true,
  createdAt: now,
}));

const mk = (n, cat, brand, price, extra = {}) => ({
  id: `demo-prod-${n}`,
  name: `Producto demo ${n} — ${brand}`,
  slug: `producto-demo-${n}`,
  description: 'Producto de demostración para desarrollo. No es inventario real.',
  shortDescription: 'Producto de demostración.',
  brand,
  categoryId: `demo-cat-${cat}`,
  sku: `DEMO-${String(n).padStart(3, '0')}`,
  price,
  compareAtPrice: null,
  currency: 'DOP',
  stock: 10,
  lowStockThreshold: 3,
  images: [],
  thumbnail: '',
  specifications: [
    { label: 'Marca', value: brand },
    { label: 'Tipo', value: 'Demostración' },
  ],
  variants: [],
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isOnSale: false,
  soldCount: 0,
  seoTitle: '',
  seoDescription: '',
  isDemo: true,
  createdAt: now - n * day,
  updatedAt: now - n * day,
  ...extra,
});

export const demoProducts = [
  mk(1, 'smartphones', 'Marca Demo A', 25000, { isFeatured: true, isNewArrival: true }),
  mk(2, 'smartphones', 'Marca Demo B', 18000, { compareAtPrice: 21000, isOnSale: true, isBestSeller: true, soldCount: 12 }),
  mk(3, 'laptops', 'Marca Demo C', 48000, { isFeatured: true, variants: [{ id: 'v1', label: '256 GB', stock: 4 }, { id: 'v2', label: '512 GB', stock: 2, price: 53000 }], stock: 6 }),
  mk(4, 'gaming', 'Marca Demo D', 3500, { isBestSeller: true, soldCount: 20 }),
  mk(5, 'audio', 'Marca Demo E', 4500, { compareAtPrice: 5200, isOnSale: true, isNewArrival: true }),
  mk(6, 'accessories', 'Marca Demo F', 900, { stock: 2 }),
  mk(7, 'smart-devices', 'Marca Demo G', 2800, { isFeatured: true }),
  mk(8, 'networking', 'Marca Demo H', 2200, { stock: 0 }),
];

export const demoSettings = {};
