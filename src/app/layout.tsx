import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Footer } from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = 'https://westham.vercel.app';
const defaultTitle = 'Sport Club Westham';
const defaultDescription =
  'App oficial do Sport Club Westham - Notícias, Escalações, Sociedade de Sócios e Projetos do Clube';
// Imagem chamativa ao compartilhar o link (redes sociais e WhatsApp)
const ogImagePath = '/logoswest/ESCUDO PNG COM MOLDURA.png';

export const metadata: Metadata = {
  title: defaultTitle,
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{ url: '/logoswest/black.png', type: 'image/png' }],
    apple: [{ url: '/logoswest/black.png', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: defaultTitle,
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: ogImagePath, width: 512, height: 512, alt: 'Sport Club Westham' }],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImagePath],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="Westham Club" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logoswest/black.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-50`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

