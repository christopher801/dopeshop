import { Suspense } from 'react';
import { LoginForm } from '@/components/forms/AuthForms';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Iniciar sesión', path: '/account/login', noindex: true });

export default function Page() {
  return <Suspense><LoginForm /></Suspense>;
}
