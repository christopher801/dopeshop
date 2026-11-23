import { createCrud } from '@/lib/server/crud';
import { prepareProduct } from '@/lib/server/products';
import { productSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';

const handlers = createCrud({
  collection: 'products',
  schema: productSchema,
  prepare: prepareProduct,
  sort: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
});
export const GET = handlers.list;
export const POST = handlers.create;
