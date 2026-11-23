import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { getSettings } from '@/lib/server/catalog';
import { buildMetadata } from '@/lib/seo';
import { buildGeneralMessage, buildWhatsAppLink } from '@/lib/whatsapp';

export const revalidate = 60;

export const metadata = buildMetadata({
  title: 'Contacto',
  description: 'Contáctanos por WhatsApp, correo o teléfono. Atención personalizada de DOPE SHOP.',
  path: '/contact',
});

export default async function ContactPage() {
  const s = await getSettings();
  const wa = buildWhatsAppLink(buildGeneralMessage(), s.whatsapp);
  const social = Object.entries(s.social || {}).filter(([, v]) => v);
  const empty = !wa && !s.email && !s.phone && !s.address;
  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl">Contacto</h1>
      <p className="mt-2 text-muted">Escríbenos y te ayudamos a elegir el producto adecuado.</p>
      {empty && <p className="mt-6 rounded-control bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">Los datos de contacto aún no se han configurado en el panel de administración.</p>}
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-4 hover:shadow-lift"><MessageCircle className="h-6 w-6 text-ink" aria-hidden="true" /><span><span className="block font-bold">WhatsApp</span><span className="text-sm text-muted">Escríbenos ahora</span></span></a></li>}
        {s.email && <li><a href={`mailto:${s.email}`} className="card flex items-center gap-3 p-4 hover:shadow-lift"><Mail className="h-6 w-6" aria-hidden="true" /><span><span className="block font-bold">Correo</span><span className="text-sm text-muted">{s.email}</span></span></a></li>}
        {s.phone && <li><a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`} className="card flex items-center gap-3 p-4 hover:shadow-lift"><Phone className="h-6 w-6" aria-hidden="true" /><span><span className="block font-bold">Teléfono</span><span className="text-sm text-muted">{s.phone}</span></span></a></li>}
        {s.address && <li className="card flex items-center gap-3 p-4"><MapPin className="h-6 w-6" aria-hidden="true" /><span><span className="block font-bold">Dirección</span><span className="text-sm text-muted">{s.address}</span></span></li>}
      </ul>
      {s.hours && <p className="mt-6 text-sm"><strong>Horario:</strong> {s.hours}</p>}
      {social.length > 0 && (
        <p className="mt-6 flex flex-wrap gap-3 text-sm">
          {social.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm capitalize">{k}</a>)}
        </p>
      )}
    </div>
  );
}
