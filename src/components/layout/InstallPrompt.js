'use client';

import { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';

/** Botón de instalación PWA: solo aparece cuando el navegador lo permite; en iOS muestra instrucciones. */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  if (deferred) {
    return (
      <button
        type="button"
        className="btn btn-accent btn-sm"
        onClick={async () => {
          deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
      >
        <Download className="h-4 w-4" aria-hidden="true" /> Instalar app
      </button>
    );
  }

  if (isIos) {
    return (
      <div>
        <button type="button" className="btn btn-accent btn-sm" onClick={() => setShowIosHelp((v) => !v)} aria-expanded={showIosHelp}>
          <Download className="h-4 w-4" aria-hidden="true" /> Instalar en iPhone
        </button>
        {showIosHelp && (
          <p className="mt-2 max-w-xs text-xs text-gray-300">
            En Safari toca el botón Compartir <Share className="inline h-3.5 w-3.5" aria-hidden="true" /> y luego “Añadir a pantalla de inicio”.
          </p>
        )}
      </div>
    );
  }
  return null;
}
