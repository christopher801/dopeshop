import { z } from 'zod';
import { ALLOWED_FORMATS, UPLOAD_FOLDER_ROOT, getCloudinary } from '@/lib/cloudinary/server';
import { requireAdmin } from '@/lib/server/auth';
import { HttpError, handle, json, rateLimit, readJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

const schema = z.object({ folder: z.enum(['products', 'categories', 'store']) });

/**
 * Firma de subida de Cloudinary. El API secret nunca sale del servidor; el navegador sube la
 * imagen directamente a Cloudinary usando esta firma (solo formatos de imagen permitidos).
 */
export const POST = handle(async (req) => {
  await requireAdmin(req);
  rateLimit(req, 'upload-sign', 60);
  const { folder } = schema.parse(await readJson(req));
  const cld = getCloudinary();
  if (!cld) throw new HttpError(503, 'Cloudinary no está configurado. Revisa las variables CLOUDINARY_* del servidor.');
  const timestamp = Math.round(Date.now() / 1000);
  const params = { allowed_formats: ALLOWED_FORMATS, folder: `${UPLOAD_FOLDER_ROOT}/${folder}`, timestamp };
  const signature = cld.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  return json({
    signature,
    timestamp,
    folder: params.folder,
    allowedFormats: ALLOWED_FORMATS,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});
