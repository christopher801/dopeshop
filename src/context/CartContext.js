'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '@/constants';
import { getAvailableStock, getUnitPrice, hasVariants, productImage } from '@/lib/utils/product';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const lineKey = (productId, variantId) => `${productId}::${variantId || ''}`;

/**
 * El carrito guarda solo datos de visualización (nombre, precio visto, imagen). No contiene datos personales.
 * El precio y el stock reales SIEMPRE se revalidan en el servidor al generar el pedido.
 */
export function CartProvider({ children }) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
      if (Array.isArray(raw)) setItems(raw.filter((i) => i && i.productId && i.quantity > 0));
    } catch {
      /* almacenamiento no disponible o corrupto */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
    } catch {
      /* modo privado / cuota */
    }
  }, [items, ready]);

  const addItem = useCallback(
    (product, { variantId = null, quantity = 1 } = {}) => {
      if (hasVariants(product) && !variantId) {
        toast('Selecciona una opción antes de agregar al carrito.', 'error');
        return false;
      }
      const stock = getAvailableStock(product, variantId);
      if (stock <= 0) {
        toast('Este producto está agotado.', 'error');
        return false;
      }
      const variant = hasVariants(product) ? product.variants.find((v) => v.id === variantId) : null;
      const key = lineKey(product.id, variantId);
      let capped = false;
      setItems((list) => {
        const existing = list.find((i) => i.key === key);
        const nextQty = Math.min((existing?.quantity || 0) + quantity, stock);
        capped = (existing?.quantity || 0) + quantity > stock;
        const line = {
          key,
          productId: product.id,
          variantId: variantId || null,
          variantLabel: variant?.label || '',
          name: product.name,
          slug: product.slug,
          image: productImage(product),
          price: getUnitPrice(product, variantId),
          compareAtPrice: product.compareAtPrice || null,
          stock,
          quantity: nextQty,
        };
        return existing ? list.map((i) => (i.key === key ? { ...i, ...line } : i)) : [...list, line];
      });
      toast(capped ? 'Cantidad ajustada al stock disponible.' : 'Producto agregado al carrito.', capped ? 'info' : 'success');
      return true;
    },
    [toast]
  );

  const setQuantity = useCallback((key, quantity) => {
    setItems((list) =>
      list.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || quantity)) } : i))
    );
  }, []);

  const removeItem = useCallback(
    (key) => {
      setItems((list) => list.filter((i) => i.key !== key));
      toast('Producto eliminado del carrito.', 'info');
    },
    [toast]
  );

  const clear = useCallback(() => setItems([]), []);

  /** Aplica datos frescos del servidor (precio/stock actuales). Devuelve avisos para el usuario. */
  const syncWithServer = useCallback((serverProducts) => {
    const notices = [];
    const map = new Map(serverProducts.map((p) => [p.id, p]));
    setItems((list) => {
      const next = [];
      for (const i of list) {
        const p = map.get(i.productId);
        if (!p) {
          notices.push(`"${i.name}" ya no está disponible y fue retirado del carrito.`);
          continue;
        }
        const stock = getAvailableStock(p, i.variantId);
        const price = getUnitPrice(p, i.variantId);
        if (stock <= 0) {
          notices.push(`"${i.name}" está agotado y fue retirado del carrito.`);
          continue;
        }
        if (price !== i.price) notices.push(`El precio de "${i.name}" cambió.`);
        if (i.quantity > stock) notices.push(`Ajustamos la cantidad de "${i.name}" al stock disponible (${stock}).`);
        next.push({ ...i, name: p.name, price, compareAtPrice: p.compareAtPrice || null, stock, quantity: Math.min(i.quantity, stock) });
      }
      return next;
    });
    return notices;
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const savings = items.reduce((s, i) => s + (i.compareAtPrice > i.price ? (i.compareAtPrice - i.price) * i.quantity : 0), 0);
    return { items, ready, count, subtotal, savings, addItem, setQuantity, removeItem, clear, syncWithServer };
  }, [items, ready, addItem, setQuantity, removeItem, clear, syncWithServer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
