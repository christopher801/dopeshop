'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Boxes, ExternalLink, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingCart, Tag, Users, X, FolderTree } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/categories', label: 'Categorías', icon: FolderTree },
  { href: '/admin/inventory', label: 'Inventario', icon: Boxes },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/promotions', label: 'Promociones', icon: Tag },
  { href: '/admin/settings', label: 'Ajustes', icon: Settings },
];

export default function AdminShell({ children }) {
  const { user, isAdmin, loading, logout, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!loading && !user && configured) router.replace('/account/login?next=/admin');
  }, [loading, user, configured, router]);

  if (!configured) {
    return <Notice title="Firebase no configurado" text="Configura las variables de Firebase (ver documentation/FIREBASE_SETUP.md) para usar el panel." />;
  }
  if (loading || !user) return <Spinner className="min-h-screen" />;
  if (!isAdmin) {
    return (
      <Notice
        title="Acceso denegado"
        text="Tu cuenta no tiene permisos de administrador. Si deberías tenerlos, consulta documentation/ADMIN_SETUP.md y vuelve a iniciar sesión."
        action={<Link href="/" className="btn btn-primary mt-6">Ir a la tienda</Link>}
      />
    );
  }

  const nav = (
    <nav aria-label="Administración" className="flex-1 space-y-1 p-3">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-[44px] items-center gap-3 rounded-control px-3 text-sm font-semibold ${active ? 'bg-ink text-white' : 'text-ink hover:bg-gray-100'}`}>
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-line px-4"><Logo /></div>
        {nav}
        <AdminFooter user={user} logout={logout} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-white px-3 lg:hidden">
          <button type="button" className="btn-icon" onClick={() => setOpen(true)} aria-label="Abrir menú de administración" aria-expanded={open}><Menu className="h-6 w-6" /></button>
          <span className="flex items-center gap-2 font-bold"><BarChart3 className="h-4 w-4" aria-hidden="true" /> Panel</span>
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú de administración">
            <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Cerrar menú" tabIndex={-1} />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-white">
              <div className="flex h-14 items-center justify-between border-b border-line px-3">
                <Logo />
                <button type="button" className="btn-icon" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X className="h-6 w-6" /></button>
              </div>
              {nav}
              <AdminFooter user={user} logout={logout} />
            </div>
          </div>
        )}
        <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function AdminFooter({ user, logout }) {
  return (
    <div className="space-y-1 border-t border-line p-3 text-sm">
      <p className="truncate px-3 text-xs text-muted">{user.email}</p>
      <Link href="/" className="flex min-h-[44px] items-center gap-3 rounded-control px-3 font-semibold hover:bg-gray-100"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver tienda</Link>
      <button type="button" onClick={logout} className="flex min-h-[44px] w-full items-center gap-3 rounded-control px-3 font-semibold text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión</button>
    </div>
  );
}

function Notice({ title, text, action }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">{text}</p>
        {action}
      </div>
    </div>
  );
}
