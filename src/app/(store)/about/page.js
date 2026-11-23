import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata = buildMetadata({
  title: 'Nosotros',
  description: 'Conoce DOPE SHOP: tienda de tecnología con atención personalizada y consulta directa por WhatsApp.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl">Sobre DOPE SHOP</h1>
      <p className="mt-2 text-lg font-semibold text-ink">Tech. Style. Innovation.</p>
      <div className="prose-copy mt-6">
        <p>DOPE SHOP es una tienda de tecnología que vende sus propios productos: smartphones, laptops, computadoras, gaming, audio, accesorios y dispositivos inteligentes.</p>
        <p>Nuestro enfoque es ofrecer una experiencia de compra clara y cercana: información visible, atención personalizada y comunicación directa por WhatsApp para confirmar disponibilidad, entrega y pago.</p>
        <p>Puedes armar tu pedido en el sitio y enviarlo por WhatsApp. La tienda lo revisa y lo confirma contigo.</p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className="btn btn-primary">Ver productos</Link>
        <Link href="/contact" className="btn btn-outline">Contacto</Link>
      </div>
    </div>
  );
}
