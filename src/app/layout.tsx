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

export const metadata: Metadata = {
  title: 'Sport Club Westham',
  description:
    'App oficial do Sport Club Westham - Notícias, Escalações, Sociedade de Sócios e Projetos do Clube',
  metadataBase: new URL('https://westham.vercel.app'),
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

