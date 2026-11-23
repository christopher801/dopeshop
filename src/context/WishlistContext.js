'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { STORAGE_KEYS } from '@/constants';
import { getDb } from '@/lib/firebase/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

/** Lista de deseos: invitados en localStorage (solo IDs); usuarios con sesión se sincronizan con Firestore. */
export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);
  const idsRef = useRef([]);
  idsRef.current = ids;

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.wishlist) || '[]');
      if (Array.isArray(raw)) setIds(raw.filter((x) => typeof x === 'string').slice(0, 100));
    } catch {
      /* ignorar */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(ids));
    } catch {
      /* ignorar */
    }
  }, [ids, ready]);

  const persistRemote = useCallback(
    async (next) => {
      const db = getDb();
      if (!user || !db) return;
      try {
        await setDoc(doc(db, 'users', user.uid), { wishlist: next, updatedAt: serverTimestamp() }, { merge: true });
      } catch {
        /* la lista local sigue funcionando aunque falle la sincronización */
      }
    },
    [user]
  );

  // Al iniciar sesión: combinar lista local + remota.
  useEffect(() => {
    const db = getDb();
    if (!user || !db || !ready) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const remote = snap.exists() ? snap.data().wishlist || [] : [];
        const merged = [...new Set([...remote, ...idsRef.current])].slice(0, 100);
        if (cancelled) return;
        setIds(merged);
        await persistRemote(merged);
      } catch {
        /* sin sincronización */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, ready, persistRemote]);

  const toggle = useCallback(
    (productId) => {
      const has = idsRef.current.includes(productId);
      const next = has ? idsRef.current.filter((x) => x !== productId) : [...idsRef.current, productId].slice(-100);
      setIds(next);
      toast(has ? 'Eliminado de tu lista de deseos.' : 'Agregado a tu lista de deseos.', has ? 'info' : 'success');
      persistRemote(next);
    },
    [persistRemote, toast]
  );

  const remove = useCallback(
    (productId) => {
      const next = idsRef.current.filter((x) => x !== productId);
      setIds(next);
      persistRemote(next);
    },
    [persistRemote]
  );

  const value = useMemo(() => ({ ids, ready, has: (id) => ids.includes(id), toggle, remove }), [ids, ready, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
