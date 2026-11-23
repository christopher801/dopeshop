import OrderHistory from '@/components/forms/OrderHistory';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Mis pedidos', path: '/account/orders', noindex: true });

export default function Page() {
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="mb-6 text-2xl md:text-3xl">Mis pedidos</h1>
      <OrderHistory />
    </div>
  );
}
