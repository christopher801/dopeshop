import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { buildGeneralMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import InstallPrompt from './InstallPrompt';
import Logo from './Logo';

export default function Footer({ settings, categories = [] }) {
  const wa = buildWhatsAppLink(buildGeneralMessage(), settings.whatsapp);
  const social = settings.social || {};
  return (
    <footer className="mt-16 bg-ink text-text-light">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm text-gray-400">{settings.description}</p>
          <p className="mt-3 text-sm font-semibold text-lime">Tech. Style. Innovation.</p>
          <div className="mt-5 flex items-center gap-2">
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {social.tiktok && (
              <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 px-4 py-2.5 text-xs font-semibold hover:bg-white/20">
                TikTok
              </a>
            )}
          </div>
          <div className="mt-5">
            <InstallPrompt />
          </div>
        </div>

        <nav aria-label="Tienda">
          <h2 className="text-sm font-semibold text-white">Tienda</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li><Link href="/shop" className="hover:text-white">Todos los productos</Link></li>
            <li><Link href="/shop?promo=1" className="hover:text-white">Ofertas</Link></li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}><Link href={`/categories/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Información">
          <h2 className="text-sm font-semibold text-white">Información</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-white">Nosotros</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contacto</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-white">Envíos y entregas</Link></li>
            <li><Link href="/policies/returns" className="hover:text-white">Devoluciones</Link></li>
            <li><Link href="/policies/warranty" className="hover:text-white">Garantía</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-white">Privacidad</Link></li>
            <li><Link href="/policies/terms" className="hover:text-white">Términos y condiciones</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-white">Contacto</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-400">
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                  <MessageCircle className="h-4 w-4 text-lime" aria-hidden="true" /> WhatsApp
                </a>
              </li>
            )}
            {settings.phone && (
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-lime" aria-hidden="true" />{settings.phone}</li>
            )}
            {settings.email && (
              <li><a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 text-lime" aria-hidden="true" />{settings.email}</a></li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />{settings.address}</li>
            )}
            {!wa && !settings.phone && !settings.email && <li>Configura los datos de contacto en el panel de administración.</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs text-gray-500">
          © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
