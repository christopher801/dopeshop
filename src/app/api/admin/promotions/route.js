import { promotionCrud } from '@/lib/server/promotions';
import { promotionSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';
const handlers = promotionCrud(promotionSchema);
export const GET = handlers.list;
export const POST = handlers.create;
