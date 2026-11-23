const clean = (v) => (v || '').trim();

export const siteConfig = {
  name: clean(process.env.NEXT_PUBLIC_STORE_NAME) || 'DOPE SHOP',
  tagline: 'Tech. Style. Innovation.',
  description:
    'DOPE SHOP: tienda de tecnología en República Dominicana. Smartphones, laptops, gaming, audio y accesorios con atención personalizada por WhatsApp.',
  url: (clean(process.env.NEXT_PUBLIC_SITE_URL) || 'http://localhost:3000').replace(/\/$/, ''),
  // Número del negocio (solo dígitos, con código de país). Configurable en .env y en Ajustes de tienda.
  whatsapp: clean(process.env.NEXT_PUBLIC_STORE_WHATSAPP).replace(/\D/g, ''),
  locale: 'es_DO',
  language: 'es-DO',
  currency: 'DOP',
  currencySymbol: 'RD$',
  gaId: clean(process.env.NEXT_PUBLIC_GA_ID),
  googleVerification: clean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
  bingVerification: clean(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION),
  demoEnabled: process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === 'true',
  pageSize: 24,
};

// Valores por defecto de la configuración editable desde /admin/settings.
export const defaultSettings = {
  storeName: siteConfig.name,
  description: siteConfig.description,
  logo: '',
  whatsapp: siteConfig.whatsapp,
  email: '',
  phone: '',
  address: '',
  hours: '',
  currency: 'DOP',
  deliveryFee: 0,
  freeDeliveryThreshold: 0,
  deliveryNote: 'El costo y el tiempo de entrega se confirman por WhatsApp.',
  social: { instagram: '', facebook: '', tiktok: '' },
  announcement: {
    enabled: true,
    messages: ['Nuevos productos disponibles.', 'Consulta disponibilidad por WhatsApp.'],
  },
  seoTitle: `${siteConfig.name} — ${siteConfig.tagline}`,
  seoDescription: siteConfig.description,
};
