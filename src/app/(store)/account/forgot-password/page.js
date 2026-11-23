import { ForgotPasswordForm } from '@/components/forms/AuthForms';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Recuperar contraseña', path: '/account/forgot-password', noindex: true });

export default function Page() {
  return <ForgotPasswordForm />;
}
