import Link from 'next/link';

export const metadata = { title: 'Página no encontrada', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-6xl font-extrabold text-ink">404</p>
        <h1 className="mt-3 text-2xl font-bold">No encontramos esta página</h1>
        <p className="mt-2 text-muted">Es posible que el enlace haya cambiado o que el producto ya no esté disponible.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">Ir al inicio</Link>
          <Link href="/shop" className="btn btn-outline">Ver la tienda</Link>
        </div>
      </div>
    </div>
  );
}
