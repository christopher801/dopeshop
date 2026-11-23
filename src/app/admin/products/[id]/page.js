import ProductForm from '@/components/admin/ProductForm';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'Editar producto' };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Editar producto" />
      <ProductForm id={id} />
    </>
  );
}
