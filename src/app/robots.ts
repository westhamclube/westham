import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://westham.vercel.app';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/caixa', '/login', '/signup', '/esqueci-senha', '/redefinir-senha'] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
