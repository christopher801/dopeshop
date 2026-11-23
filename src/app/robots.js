import { siteConfig } from '@/config/site';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/account/', '/checkout/', '/cart/', '/api/'] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
