'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = ++idRef.current;
      setItems((list) => [...list.slice(-2), { id, message, type }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] md:bottom-4 flex flex-col items-center gap-2 px-4 pb-[env(safe-area-inset-bottom)]"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card bg-ink px-4 py-3 text-sm text-text-light shadow-lift animate-toast"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${t.type === 'error' ? 'text-red-400' : t.type === 'success' ? 'text-lime' : 'text-gray-300'}`} aria-hidden="true" />
              <p className="flex-1">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Cerrar notificación" className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
