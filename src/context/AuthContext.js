'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getAuthClient, getDb, isFirebaseConfigured } from '@/lib/firebase/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Solo para mostrar/ocultar UI. La autorización real se verifica en el servidor.
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    const auth = getAuthClient();
    if (!auth) return undefined;
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const token = await u.getIdTokenResult();
          setIsAdmin(token.claims.admin === true);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  const requireAuth = () => {
    const auth = getAuthClient();
    if (!auth) throw new Error('La autenticación no está configurada todavía.');
    return auth;
  };

  const login = useCallback((email, password) => signInWithEmailAndPassword(requireAuth(), email, password), []);

  const register = useCallback(async ({ name, email, password, phone }) => {
    const cred = await createUserWithEmailAndPassword(requireAuth(), email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(getDb(), 'users', cred.user.uid), {
      name,
      email,
      phone: phone || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return cred.user;
  }, []);

  const logout = useCallback(() => signOut(requireAuth()), []);
  const resetPassword = useCallback((email) => sendPasswordResetEmail(requireAuth(), email), []);

  const value = useMemo(
    () => ({ user, isAdmin, loading, configured: isFirebaseConfigured, login, register, logout, resetPassword }),
    [user, isAdmin, loading, login, register, logout, resetPassword]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
