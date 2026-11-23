import { createCrud } from '@/lib/server/crud';
import { cleanupProductImages, prepareProduct } from '@/lib/server/products';
import { productSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';

const handlers = createCrud({
  collection: 'products',
  schema: productSchema,
  prepare: prepareProduct,
  afterDelete: cleanupProductImages,
});
export const GET = handlers.getOne;
export const PUT = handlers.update;
export const DELETE = handlers.remove;
