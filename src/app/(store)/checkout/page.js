import CheckoutClient from '@/components/checkout/CheckoutClient';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Finalizar pedido', path: '/checkout', noindex: true });

export default function CheckoutPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="mb-6 text-2xl md:text-3xl">Finalizar pedido</h1>
      <CheckoutClient />
    </div>
  );
}
