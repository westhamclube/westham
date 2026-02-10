import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from './Button';

export function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-gradient-to-r from-black via-neutral-900 to-orange-600 text-white shadow-xl border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-3 md:py-4 flex justify-between items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-orange-400 bg-transparent">
            <Image
              src="/logoswest/transparente.png"
              alt="Escudo Sport Club Westham"
              fill
              className="object-contain"
              sizes="40px"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-[11px] uppercase tracking-[0.3em] text-orange-400">
              Sport Club
            </span>
            <span className="font-extrabold text-lg">WESTHAM</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 md:gap-6 text-sm md:text-base">
          <Link href="/" className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition">
            Início
          </Link>
          <Link href={user ? '/dashboard/projetos' : '/projetos'} className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition">
            Projetos
          </Link>
          <Link href={user ? '/dashboard/loja' : '/loja'} className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition">
            Loja Oficial
          </Link>
          <Link href={user ? '/dashboard/noticias' : '/noticias'} className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition">
            Notícias
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard/perfil"
                className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition"
              >
                Perfil
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/60 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
              >
                PORTAL
              </Link>
            </>
          )}

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden md:inline-flex px-3 py-1 rounded-full border border-orange-400/60 text-xs font-semibold hover:bg-orange-500/20 transition"
                >
                  Painel Admin
                </Link>
              )}
              <div className="hidden md:flex items-center gap-2 text-xs text-neutral-200">
                <span className="font-semibold truncate max-w-[120px]">
                  {user.nome || user.email}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40">
                  {user.role}
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <Link href="/login" className="hover:text-orange-300 transition">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

