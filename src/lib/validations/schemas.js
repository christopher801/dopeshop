import { z } from 'zod';
import { ORDER_STATUS_KEYS } from '@/constants';

const cloudinaryImage = z.object({
  url: z.string().url().refine((u) => u.startsWith('https://res.cloudinary.com/'), 'La imagen debe provenir de Cloudinary'),
  publicId: z.string().min(1).max(300),
  alt: z.string().max(200).optional().default(''),
});

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const optionalText = (max) => z.string().max(max).optional().default('');
const money = z.coerce.number().min(0, 'No puede ser negativo').max(100000000);
const int = z.coerce.number().int('Debe ser un número entero').min(0, 'No puede ser negativo').max(1000000);

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido').max(160),
  slug: z.string().trim().max(100).regex(slugRegex, 'Slug inválido (usa minúsculas, números y guiones)').optional().or(z.literal('')),
  description: optionalText(8000),
  shortDescription: optionalText(300),
  brand: z.string().trim().min(1, 'Marca requerida').max(80),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  sku: z.string().trim().min(1, 'SKU requerido').max(60),
  price: money.refine((v) => v > 0, 'El precio debe ser mayor que 0'),
  compareAtPrice: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), money.nullable()),
  stock: int.default(0),
  lowStockThreshold: int.default(5),
  images: z.array(cloudinaryImage).max(10).default([]),
  specifications: z.array(z.object({ label: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(200) })).max(40).default([]),
  variants: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        label: z.string().trim().min(1).max(80),
        stock: int.default(0),
        price: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), money.nullable()).optional(),
      })
    )
    .max(30)
    .default([]),
  isActive: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido').max(80),
  slug: z.string().trim().max(80).regex(slugRegex, 'Slug inválido').optional().or(z.literal('')),
  description: optionalText(500),
  image: cloudinaryImage.nullable().optional().default(null),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  isActive: z.boolean().default(true),
  sortOrder: int.default(0),
});

export const promotionSchema = z
  .object({
    name: z.string().trim().min(2, 'Nombre requerido').max(100),
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,24}$/, 'Código: 3–24 letras, números, guion o guion bajo'),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().positive('Debe ser mayor que 0').max(100000000),
    minPurchase: money.default(0),
    startDate: z.number().nullable().optional().default(null),
    endDate: z.number().nullable().optional().default(null),
    isActive: z.boolean().default(true),
    usageLimit: z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), int.nullable()).optional().default(null),
  })
  .refine((p) => p.type !== 'percentage' || p.value <= 100, { message: 'El porcentaje no puede superar 100', path: ['value'] })
  .refine((p) => !p.startDate || !p.endDate || p.endDate >= p.startDate, { message: 'La fecha final debe ser posterior', path: ['endDate'] });

export const settingsSchema = z.object({
  storeName: z.string().trim().min(1).max(80),
  description: optionalText(500),
  logo: z.string().max(500).optional().default(''),
  whatsapp: z.string().trim().max(20).regex(/^\d*$/, 'Solo dígitos, con código de país').optional().default(''),
  email: z.string().trim().email('Correo inválido').or(z.literal('')).optional().default(''),
  phone: optionalText(30),
  address: optionalText(300),
  hours: optionalText(300),
  currency: z.literal('DOP').default('DOP'),
  deliveryFee: money.default(0),
  freeDeliveryThreshold: money.default(0),
  deliveryNote: optionalText(300),
  social: z
    .object({ instagram: optionalText(200), facebook: optionalText(200), tiktok: optionalText(200) })
    .optional()
    .default({}),
  announcement: z
    .object({ enabled: z.boolean().default(false), messages: z.array(z.string().trim().min(1).max(160)).max(6).default([]) })
    .optional()
    .default({}),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
});

export const customerSchema = z
  .object({
    name: z.string().trim().min(2, 'Ingresa tu nombre completo').max(100),
    phone: z.string().trim().min(7, 'Ingresa un número de WhatsApp válido').max(20).regex(/^[0-9+()\-\s]+$/, 'Número inválido'),
    email: z.string().trim().email('Correo inválido').or(z.literal('')).optional().default(''),
    deliveryMethod: z.enum(['pickup', 'delivery']),
    province: z.string().trim().max(80).optional().default(''),
    address: z.string().trim().max(300).optional().default(''),
    notes: z.string().trim().max(500).optional().default(''),
  })
  .superRefine((c, ctx) => {
    if (c.deliveryMethod === 'delivery') {
      if (!c.province) ctx.addIssue({ code: 'custom', path: ['province'], message: 'Indica tu provincia o ciudad' });
      if (c.address.length < 5) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Ingresa tu dirección de entrega' });
    }
  });

export const orderRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(100),
        variantId: z.string().max(40).optional().nullable(),
        quantity: z.coerce.number().int().min(1).max(50),
      })
    )
    .min(1, 'Tu carrito está vacío')
    .max(40),
  customer: customerSchema,
  promoCode: z.string().trim().toUpperCase().max(24).optional().default(''),
  dryRun: z.boolean().optional().default(false),
});

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_KEYS).optional(),
  note: z.string().trim().max(500).optional(),
});

export const inventoryAdjustSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  mode: z.enum(['set', 'adjust']),
  quantity: z.coerce.number().int().min(-1000000).max(1000000),
  reason: z.string().trim().min(3, 'Indica el motivo').max(200),
});

export const lookupSchema = z.object({ ids: z.array(z.string().min(1).max(100)).max(60) });
