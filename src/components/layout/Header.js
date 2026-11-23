'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Heart, LayoutDashboard, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { NAV_LINKS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Logo from './Logo';

function SearchForm({ className = '', onDone }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
        onDone?.();
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Buscar productos
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="site-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, marca o SKU"
          className="input !pl-9"
          autoComplete="off"
        />
      </div>
    </form>
  );
}

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute right-0.5 top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-lime px-1 text-[11px] font-bold text-ink">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Header({ categories = [] }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const wishlist = useWishlist();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-2 lg:gap-6">
        <button type="button" className="btn-icon lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open}>
          <Menu className="h-6 w-6" />
        </button>
        <Logo />

        <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-control px-3 py-2 text-sm font-medium text-ink hover:bg-black/5">
              {l.label}
            </Link>
          ))}
          {categories.length > 0 && (
            <div className="group relative">
              <button type="button" className="flex items-center gap-1 rounded-control px-3 py-2 text-sm font-medium text-ink hover:bg-black/5" aria-haspopup="true">
                Categorías <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="invisible absolute left-0 top-full w-60 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="card p-2 shadow-lift">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/categories/${c.slug}`} className="block rounded-control px-3 py-2 text-sm hover:bg-gray-100">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </nav>

        <SearchForm className="ml-auto hidden max-w-sm flex-1 md:block lg:ml-6" />

        <div className="ml-auto flex items-center md:ml-0">
          {isAdmin && (
            <Link href="/admin" className="btn-icon hidden sm:inline-flex" aria-label="Panel de administración">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}
          <Link href="/wishlist" className="btn-icon relative" aria-label={`Lista de deseos${wishlist.ids.length ? `, ${wishlist.ids.length} productos` : ''}`}>
            <Heart className="h-5 w-5" />
            {wishlist.ready && <Badge count={wishlist.ids.length} />}
          </Link>
          <Link href={user ? '/account' : '/account/login'} className="btn-icon hidden xs:inline-flex" aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'}>
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="btn-icon relative" aria-label={`Carrito${count ? `, ${count} productos` : ''}`}>
            <ShoppingBag className="h-5 w-5" />
            {ready && <Badge count={count} />}
          </Link>
        </div>
      </div>

      <div className="border-t border-line px-4 py-2 md:hidden">
        <SearchForm />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Cerrar menú" tabIndex={-1} />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-white pb-safe shadow-lift">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo />
              <button ref={closeRef} type="button" className="btn-icon" onClick={() => setOpen(false)} aria-label="Cerrar menú">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="Menú móvil" className="flex-1 space-y-1 p-3">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-control px-3 py-3 text-base font-semibold hover:bg-gray-100">
                  {l.label}
                </Link>
              ))}
              {categories.length > 0 && (
                <>
                  <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">Categorías</p>
                  {categories.map((c) => (
                    <Link key={c.id} href={`/categories/${c.slug}`} className="block rounded-control px-3 py-2.5 text-sm hover:bg-gray-100">
                      {c.name}
                    </Link>
                  ))}
                </>
              )}
              <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">Mi cuenta</p>
              <Link href={user ? '/account' : '/account/login'} className="block rounded-control px-3 py-2.5 text-sm hover:bg-gray-100">
                {user ? 'Mi cuenta' : 'Iniciar sesión'}
              </Link>
              {user && (
                <Link href="/account/orders" className="block rounded-control px-3 py-2.5 text-sm hover:bg-gray-100">
                  Mis pedidos
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="block rounded-control px-3 py-2.5 text-sm hover:bg-gray-100">
                  Panel de administración
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
