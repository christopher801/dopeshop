'use client';

import { useEffect, useState } from 'react';

/** Registra el service worker (solo en producción) y ofrece actualizar cuando hay una versión nueva. */
export default function ServiceWorkerRegister() {
  const [waiting, setWaiting] = useState(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return undefined;
    let refreshing = false;
    const onChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          sw?.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) setWaiting(sw);
          });
        });
      })
      .catch(() => {});
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onChange);
  }, []);

  if (!waiting) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] flex justify-center p-4 pb-safe" role="alert">
      <div className="flex w-full max-w-md items-center gap-3 rounded-card bg-ink p-4 text-sm text-text-light shadow-lift">
        <p className="flex-1">Hay una nueva versión de DOPE SHOP disponible.</p>
        <button type="button" className="btn btn-accent btn-sm" onClick={() => waiting.postMessage({ type: 'SKIP_WAITING' })}>
          Actualizar
        </button>
      </div>
    </div>
  );
}
