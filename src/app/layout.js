import { Manrope } from 'next/font/google';
import Script from 'next/script';
import ServiceWorkerRegister from '@/components/layout/ServiceWorkerRegister';
import { siteConfig } from '@/config/site';
import Providers from '@/context/Providers';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: { card: 'summary_large_image' },
  verification: {
    google: siteConfig.googleVerification || undefined,
    other: siteConfig.bingVerification ? { 'msvalidate.01': siteConfig.bingVerification } : undefined,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#101114',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-DO" className={manrope.variable}>
      <body className="font-sans">
        <a
          href="#contenido"
          className="sr-only z-[200] rounded-control bg-lime px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
        {siteConfig.gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${siteConfig.gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
