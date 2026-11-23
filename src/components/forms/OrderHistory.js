'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Package } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { ORDER_STATUSES } from '@/constants';
import { getDb } from '@/lib/firebase/client';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { useRequireUser } from './AccountClient';

export default function OrderHistory() {
  const { user, loading } = useRequireUser();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(getDb(), 'orders'), where('userId', '==', user.uid)))
      .then((snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toMillis?.() || 0 }));
        setOrders(list.sort((a, b) => b.createdAt - a.createdAt));
      })
      .catch(() => setError('No pudimos cargar tus pedidos. Inténtalo de nuevo.'));
  }, [user]);

  if (loading || (orders === null && !error)) return <Spinner />;
  if (error) return <p className="card p-6 text-center text-sm text-red-700" role="alert">{error}</p>;
  if (!orders.length) return <EmptyState icon={Package} title="Aún no tienes pedidos" description="Los pedidos hechos con tu sesión iniciada aparecerán aquí." actionHref="/shop" actionLabel="Explorar productos" />;

  return (
    <ul className="space-y-3">
      {orders.map((o) => {
        const st = ORDER_STATUSES[o.status] || { label: o.status, tone: 'gray' };
        return (
          <li key={o.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold">{o.orderNumber}</p>
                <p className="text-xs text-muted">{formatDate(o.createdAt, true)}</p>
              </div>
              <span className={`badge badge-${st.tone}`}>{st.label}</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              {(o.items || []).map((it, i) => <li key={i}>{it.quantity} × {it.name}{it.variantLabel ? ` (${it.variantLabel})` : ''}</li>)}
            </ul>
            <p className="mt-3 text-right text-sm font-bold">Total estimado: {formatPrice(o.total)}</p>
          </li>
        );
      })}
    </ul>
  );
}
