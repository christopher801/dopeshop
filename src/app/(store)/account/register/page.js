import { RegisterForm } from '@/components/forms/AuthForms';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Crear cuenta', path: '/account/register', noindex: true });

export default function Page() {
  return <RegisterForm />;
}
