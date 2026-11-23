import { z } from 'zod';
import { UPLOAD_FOLDER_ROOT, destroyImages } from '@/lib/cloudinary/server';
import { requireAdmin } from '@/lib/server/auth';
import { HttpError, handle, json, readJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

const schema = z.object({ publicId: z.string().min(1).max(300) });

// Elimina una imagen subida y no guardada (p. ej. al descartar una subida en el formulario).
export const DELETE = handle(async (req) => {
  await requireAdmin(req);
  const { publicId } = schema.parse(await readJson(req));
  if (!publicId.startsWith(`${UPLOAD_FOLDER_ROOT}/`)) throw new HttpError(400, 'Imagen no permitida.');
  await destroyImages([publicId]);
  return json({ ok: true });
});
