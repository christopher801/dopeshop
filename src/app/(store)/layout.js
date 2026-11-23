import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { getCategories, getSettings, isDemoMode } from '@/lib/server/catalog';

export default async function StoreLayout({ children }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <>
      {isDemoMode && (
        <div className="bg-amber-300 px-4 py-1.5 text-center text-xs font-semibold text-ink">
          MODO DEMOSTRACIÓN: los productos mostrados son de ejemplo y no representan inventario real.
        </div>
      )}
      {settings.announcement?.enabled && <AnnouncementBar messages={settings.announcement.messages} />}
      <Header categories={categories} />
      <main id="contenido" className="min-h-[60vh]">
        {children}
      </main>
      <Footer settings={settings} categories={categories} />
    </>
  );
}
