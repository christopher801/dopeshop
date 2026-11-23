'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Algo salió mal</h1>
        <p className="mt-2 text-muted">No pudimos cargar esta página. Comprueba tu conexión e inténtalo de nuevo.</p>
        <button type="button" onClick={reset} className="btn btn-primary mt-6">Reintentar</button>
      </div>
    </div>
  );
}
