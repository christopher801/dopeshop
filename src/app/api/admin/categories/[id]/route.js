import { categoryCrud } from '@/lib/server/categories';
import { categorySchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';
const handlers = categoryCrud(categorySchema);
export const GET = handlers.getOne;
export const PUT = handlers.update;
export const DELETE = handlers.remove;
