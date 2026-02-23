'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';

const MODALIDADES = [
  { slug: 'campo', label: 'FUT11' },
  { slug: 'fut7', label: 'FUT 7' },
  { slug: 'futsal', label: 'FUTSAL' },
] as const;

export default function JogosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <div className="bg-neutral-950 border-b-2 border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 py-2">
            {MODALIDADES.map(({ slug, label }) => {
              const href = `/jogos/${slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={slug}
                  href={href}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold transition ${
                    isActive
                      ? 'bg-orange-500 text-black shadow-lg'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-600'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
