'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCashFlowAccess } from '@/hooks/useCashFlowAccess';
import { Button } from './Button';

export function Header() {
  const { user, logout } = useAuth();
  const { hasAccess: hasCashFlowAccess } = useCashFlowAccess();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    window.location.href = '/';
  };

  const navLinks = (
    <>
      <Link href="/" className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>
        Início
      </Link>
      <Link href={user ? '/dashboard/projetos' : '/projetos'} className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>
        Projetos
      </Link>
      <Link href={user ? '/dashboard/loja' : '/loja'} className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>
        Loja
      </Link>
      <Link href={user ? '/dashboard/noticias' : '/noticias'} className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>
        Notícias
      </Link>
      <Link href="/jogos" className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>
        Jogos
      </Link>
      <Link href="/historia" className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>
        História
      </Link>
      {user && (
        <>
          <Link href="/dashboard/perfil" className="px-2 py-1 rounded hover:text-orange-300 hover:bg-white/5 transition" onClick={() => setMenuOpen(false)}>
            Perfil
          </Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/60 hover:bg-emerald-500/20 hover:text-emerald-300 transition" onClick={() => setMenuOpen(false)}>
            PORTAL
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="bg-gradient-to-r from-black via-neutral-900 to-orange-600 text-white shadow-xl border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center gap-4">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={() => setMenuOpen(false)}>
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-orange-400 bg-transparent">
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
            <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-orange-400">
              Sport Club
            </span>
            <span className="font-extrabold text-base sm:text-lg">WESTHAM</span>
          </div>
        </Link>

        {/* Desktop nav: visível só a partir de md */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm md:text-base">
          {navLinks}
          {user ? (
            <>
              {hasCashFlowAccess && (
                <Link href="/caixa" className="px-3 py-1 rounded-full border border-emerald-400/60 text-xs font-semibold hover:bg-emerald-500/20 transition" onClick={() => setMenuOpen(false)}>
                  💰 Caixa
                </Link>
              )}
              {(user.role === 'diretor' || user.role === 'admin') && (
                <Link href="/diretoria" className="px-3 py-1 rounded-full border border-amber-400/60 text-xs font-semibold hover:bg-amber-500/20 transition" onClick={() => setMenuOpen(false)}>
                  Diretoria
                </Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin" className="px-3 py-1 rounded-full border border-orange-400/60 text-xs font-semibold hover:bg-orange-500/20 transition" onClick={() => setMenuOpen(false)}>
                  Painel Admin
                </Link>
              )}
              <Button size="sm" variant="secondary" onClick={handleLogout}>Sair</Button>
            </>
          ) : (
            <Link href="/login" className="hover:text-orange-300 transition">Entrar</Link>
          )}
        </nav>

        {/* Mobile: botão hambúrguer */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/60" onClick={() => setMenuOpen(false)}>
              PORTAL
            </Link>
          )}
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="p-2 rounded-lg hover:bg-white/10 transition text-white"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile (drawer) */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" aria-hidden="true" onClick={() => setMenuOpen(false)} />
          <nav
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[280px] bg-neutral-900 border-l border-neutral-700 shadow-2xl md:hidden flex flex-col overflow-y-auto"
            aria-label="Menu principal"
          >
            <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
              <span className="font-bold text-orange-400">Menu</span>
              <button type="button" aria-label="Fechar menu" className="p-2 rounded hover:bg-white/10" onClick={() => setMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col p-4 gap-1 [&_a]:block [&_a]:py-3 [&_a]:rounded-lg [&_a]:text-left">
              {navLinks}
              {hasCashFlowAccess && (
                <Link href="/caixa" className="px-3 py-2 rounded-lg border border-emerald-400/60 text-sm font-semibold hover:bg-emerald-500/20" onClick={() => setMenuOpen(false)}>
                  💰 Caixa
                </Link>
              )}
              {(user?.role === 'diretor' || user?.role === 'admin') && (
                <Link href="/diretoria" className="px-3 py-2 rounded-lg border border-amber-400/60 text-sm font-semibold hover:bg-amber-500/20" onClick={() => setMenuOpen(false)}>
                  Diretoria
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" className="px-3 py-2 rounded-lg border border-orange-400/60 text-sm font-semibold hover:bg-orange-500/20" onClick={() => setMenuOpen(false)}>
                  Painel Admin
                </Link>
              )}
              {user ? (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <Button size="sm" variant="secondary" className="w-full justify-center" onClick={handleLogout}>Sair</Button>
                </div>
              ) : (
                <Link href="/login" className="mt-4 block text-center py-2 rounded-lg bg-orange-600 hover:bg-orange-500 font-semibold" onClick={() => setMenuOpen(false)}>
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
