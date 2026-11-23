import WishlistClient from '@/components/cart/WishlistClient';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Lista de deseos', path: '/wishlist', noindex: true });

export default function WishlistPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="mb-6 text-2xl md:text-3xl">Lista de deseos</h1>
      <WishlistClient />
    </div>
  );
}
