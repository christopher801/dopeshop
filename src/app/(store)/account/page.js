import AccountClient from '@/components/forms/AccountClient';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Mi cuenta', path: '/account', noindex: true });

export default function AccountPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="mb-6 text-2xl md:text-3xl">Mi cuenta</h1>
      <AccountClient />
    </div>
  );
}
