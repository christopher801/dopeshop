import CartClient from '@/components/cart/CartClient';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Carrito', path: '/cart', noindex: true });

export default function CartPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="mb-6 text-2xl md:text-3xl">Tu carrito</h1>
      <CartClient />
    </div>
  );
}
