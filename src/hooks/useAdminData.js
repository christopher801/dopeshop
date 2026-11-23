'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/utils/api';

/** Carga datos de un endpoint /api/admin/* con el token del administrador. */
export function useAdminData(path) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!path) { setLoading(false); return; }
    if (!user) return;
    setLoading(true);
    try {
      setData(await apiFetch(path, { auth: true }));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
