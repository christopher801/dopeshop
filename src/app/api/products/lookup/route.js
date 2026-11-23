import { demoProducts } from '@/data/demo';
import { siteConfig } from '@/config/site';
import { getAdminDb, docToObject, isAdminConfigured } from '@/lib/firebase/admin';
import { loadSettingsFresh } from '@/lib/server/catalog';
import { handle, json, rateLimit, readJson } from '@/lib/server/http';
import { lookupSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';

const pick = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  sku: p.sku,
  price: p.price,
  compareAtPrice: p.compareAtPrice ?? null,
  stock: p.stock,
  lowStockThreshold: p.lowStockThreshold,
  variants: p.variants || [],
  thumbnail: p.thumbnail || '',
  isOnSale: Boolean(p.isOnSale),
  isDemo: Boolean(p.isDemo),
});

/** Datos ACTUALES (sin caché) de productos activos para refrescar carrito y lista de deseos. */
export const POST = handle(async (req) => {
  rateLimit(req, 'lookup', 60);
  const { ids } = lookupSchema.parse(await readJson(req));
  let products = [];
  let settings;
  if (isAdminConfigured) {
    if (ids.length) {
      const db = getAdminDb();
      const snaps = await db.getAll(...ids.map((id) => db.collection('products').doc(id)));
      products = snaps.filter((s) => s.exists && s.data().isActive).map((s) => pick(docToObject(s)));
    }
    settings = await loadSettingsFresh();
  } else {
    products = siteConfig.demoEnabled ? demoProducts.filter((p) => ids.includes(p.id)).map(pick) : [];
    settings = await loadSettingsFresh();
  }
  return json({
    products,
    settings: {
      whatsapp: settings.whatsapp,
      deliveryFee: settings.deliveryFee,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      deliveryNote: settings.deliveryNote,
    },
  });
});
