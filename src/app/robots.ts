import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/caixa', '/login', '/signup', '/esqueci-senha', '/redefinir-senha'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
