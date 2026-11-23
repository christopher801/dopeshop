import ProductForm from '@/components/admin/ProductForm';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'Nuevo producto' };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Nuevo producto" />
      <ProductForm />
    </>
  );
}
