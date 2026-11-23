'use client';

import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ToastProvider } from './ToastContext';
import { WishlistProvider } from './WishlistContext';

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
