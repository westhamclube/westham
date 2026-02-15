'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { News, NewsModalidade } from '@/types';

type MatchRow = { id: string; data: string; adversario: string; local: string; modalidade?: string };

export default function HomePage() {
  const { user } = useAuth();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [monthlyMatches, setMonthlyMatches] = useState<MatchRow[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setNewsList(
          data.map((n: any) => ({
            id: n.id,
            titulo: n.titulo,
            conteudo: n.conteudo,
            autor_id: n.autor_id,
            data_criacao: n.created_at,
            data_atualizacao: n.updated_at,
            categoria: n.categoria,
            modalidade: n.modalidade as NewsModalidade | undefined,
            imagem_url: n.imagem_url,
            video_url: n.video_url,
            midia_url: n.midia_url,
            destaque: n.destaque,
            curtidas: n.curtidas ?? 0,
            usuarios_curtidas: n.usuarios_curtidas ?? [],
            comentarios: [],
          })),
        );
      }
      setLoadingNews(false);
    };

    loadNews();
  }, []);

  useEffect(() => {
    const loadFeaturedProductsAndMatches = async () => {
      const now = new Date();
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);
      const [productsRes, matchesRes] = await Promise.all([
        supabase.from('store_products').select('*').eq('ativo', true).order('created_at', { ascending: false }).limit(8),
        supabase.from('matches').select('id, data, adversario, local, modalidade').gte('data', now.toISOString()).lte('data', endOfNextMonth.toISOString()).order('data', { ascending: true }).limit(50),
      ]);
      if (!productsRes.error && productsRes.data) {
        const withDestaque = productsRes.data.filter((p: any) => p.destaque === true);
        const list = withDestaque.length >= 4 ? withDestaque.slice(0, 4) : productsRes.data.slice(0, 4);
        setFeaturedProducts(list);
      }
      if (!matchesRes.error && matchesRes.data) {
        setMonthlyMatches(matchesRes.data as MatchRow[]);
      }
      setLoadingProducts(false);
      setLoadingMatches(false);
    };
    loadFeaturedProductsAndMatches();
  }, []);

  // Banner para incentivar instalação como "app" (PWA)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const alreadyDismissed = window.localStorage.getItem('westham_install_banner_dismissed');
    if (!alreadyDismissed) {
      setShowInstallBanner(true);
    }

    const handler = (e: any) => {
      // Impede o prompt automático e guarda para usar quando o usuário clicar
      e.preventDefault();
      setDeferredPrompt(e);
      if (!alreadyDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        window.localStorage.setItem('westham_install_banner_dismissed', '1');
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
      return;
    }
    // iOS ou navegador sem beforeinstallprompt: mostrar instruções manuais
    setShowInstallInstructions(true);
  };

  const handleDismissBanner = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('westham_install_banner_dismissed', '1');
    }
    setShowInstallBanner(false);
  };

  const modalidadeLabel = (m?: string) => (m === 'fut7' ? 'FUT 7' : m === 'futsal' ? 'Futsal' : m === 'campo' ? 'Campo' : 'Campo');

  return (
    <>
      <Header />
      <main className="bg-neutral-950 min-h-screen">
        {showInstallBanner && (
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm md:text-base">
            <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center gap-2 md:gap-4 justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/30 border border-white/30 text-lg">
                  📱
                </span>
                <p className="font-medium text-left">
                  Instale o portal do <strong>Sport Club Westham</strong> na tela inicial do seu
                  celular para usar como aplicativo.
                </p>
              </div>
              <div className="flex items-center gap-2 self-stretch md:self-auto">
                <Button
                  size="sm"
                  className="bg-black/80 hover:bg-black text-white border border-white/40"
                  onClick={handleInstallClick}
                >
                  Adicionar à tela inicial
                </Button>
                <button
                  onClick={handleDismissBanner}
                  className="text-xs uppercase tracking-wide hover:text-black/80"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: instruções para adicionar à tela inicial (iOS / quando não há prompt) */}
        {showInstallInstructions && (
          <>
            <div className="fixed inset-0 z-50 bg-black/60" aria-hidden="true" onClick={() => setShowInstallInstructions(false)} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-neutral-900 border border-neutral-600 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="text-lg font-bold text-orange-400">Adicionar à tela inicial</h3>
                <button type="button" aria-label="Fechar" className="p-1 rounded hover:bg-white/10" onClick={() => setShowInstallInstructions(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-sm text-neutral-300 mb-4">Siga os passos conforme seu celular:</p>
              <div className="space-y-4 text-sm">
                <div className="bg-neutral-800 rounded-xl p-4">
                  <p className="font-semibold text-white mb-2">📱 iPhone (Safari)</p>
                  <ol className="list-decimal list-inside text-neutral-300 space-y-1">
                    <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima), na barra do Safari.</li>
                    <li>Role e toque em <strong>Adicionar à Tela de Início</strong>.</li>
                    <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
                  </ol>
                </div>
                <div className="bg-neutral-800 rounded-xl p-4">
                  <p className="font-semibold text-white mb-2">🤖 Android (Chrome)</p>
                  <ol className="list-decimal list-inside text-neutral-300 space-y-1">
                    <li>Toque no menu <strong>⋮</strong> (três pontos), no canto superior direito.</li>
                    <li>Toque em <strong>Adicionar à tela inicial</strong> ou <strong>Instalar app</strong>.</li>
                  </ol>
                </div>
              </div>
              <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-500" onClick={() => setShowInstallInstructions(false)}>
                Entendi
              </Button>
            </div>
          </>
        )}

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-black via-neutral-900 to-orange-600 text-white py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1200 600">
              <circle cx="200" cy="100" r="80" fill="orange" />
              <circle cx="1000" cy="500" r="100" fill="orange" />
              <path
                d="M0 300 Q300 200 600 300 T1200 300"
                stroke="orange"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center gap-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-black/70 border-2 border-orange-400 overflow-hidden shadow-2xl">
                <Image
                  src="/logoswest/ESCUDO PNG.png"
                  alt="Escudo oficial Sport Club Westham"
                  fill
                  className="object-contain"
                  sizes="208px"
                  priority
                />
              </div>
              <div className="text-left max-w-xl">
                <p className="uppercase tracking-[0.35em] text-xs text-orange-300 mb-2">
                  Sport Club Westham
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
                  A casa oficial do Westham na web
                </h1>
                <p className="text-lg md:text-xl mb-6 text-orange-100/90">
                  FUT 7, Campo e Futsal, área do sócio e loja oficial em um só lugar. Notícias,
                  cronograma de jogos e projetos do clube.
                </p>

                {!user && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/marcar-amistoso">
                      <Button
                        size="lg"
                        className="bg-orange-500 hover:bg-orange-400 text-black shadow-lg"
                      >
                        Quer marcar um amistoso?
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="bg-transparent border border-orange-400 text-orange-100 hover:bg-orange-500/20"
                      >
                        Entrar
                      </Button>
                    </Link>
                    <p className="text-orange-100/80 text-sm self-center">
                      Ainda não tem conta?{' '}
                      <Link href="/signup" className="text-orange-300 font-semibold hover:underline">
                        Cadastre-se
                      </Link>
                    </p>
                  </div>
                )}

                {user && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        className="bg-orange-500 hover:bg-orange-400 text-black shadow-lg"
                      >
                        Ir para o Portal
                      </Button>
                    </Link>
                    {user.role === 'sócio' && (
                      <Button
                        size="lg"
                        variant="secondary"
                        className="border border-emerald-400 text-emerald-200 hover:bg-emerald-500/10"
                      >
                        ⭐ Carteirinha de Sócio Ativo
                      </Button>
                    )}
                    {user.role === 'admin' && (
                      <Link href="/admin">
                        <Button
                          size="lg"
                          className="bg-black border border-orange-400 text-orange-300 hover:bg-neutral-900"
                        >
                          👑 Painel do Administrador
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bloco rápido: instrução app */}
            <div className="mt-10 w-full max-w-3xl bg-black/40 border border-orange-500/40 rounded-2xl px-6 py-4 text-left text-sm md:text-base">
              <p className="font-semibold text-orange-300 mb-1">
                Quer o Westham como aplicativo no seu celular?
              </p>
              <p className="text-orange-50/90">
                Adicione o site à <strong>tela inicial</strong> e use como um app com o escudo do
                clube: no Android (Chrome) use &quot;Adicionar à tela inicial&quot;, e no iPhone
                (Safari) use &quot;Adicionar à Tela de Início&quot;.
              </p>
            </div>
          </div>
        </section>

        {/* Feed de notícias (principal) */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-300">
              📰 Últimas Notícias
            </h2>
            <Link
              href={user ? '/dashboard/noticias' : '/noticias'}
              className="text-sm font-semibold text-orange-300 hover:text-orange-200 underline"
            >
              Ver mais →
            </Link>
          </div>

          {loadingNews && <p className="text-neutral-400 text-sm mb-4">Carregando notícias...</p>}

          {!loadingNews && newsList.length === 0 && (
            <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
              Assim que o admin publicar notícias, elas aparecerão aqui.
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((news) => {
              const modalidadeLabel = news.modalidade === 'fut7' ? 'FUT 7' : news.modalidade === 'futsal' ? 'Futsal' : news.modalidade === 'campo' ? 'Campo' : null;
              const catLabel = news.categoria === 'general' ? 'Geral' : news.categoria === 'match' ? 'Partida' : news.categoria === 'player' ? 'Jogador' : news.categoria === 'academy' ? 'Academia' : news.categoria === 'social' ? 'Redes sociais' : news.categoria || 'Geral';
              const conteudoLongo = (news.conteudo || '').length > 250;
              return (
                <Card
                  key={news.id}
                  className="hover:shadow-xl transition bg-neutral-900 border border-neutral-800 flex flex-col"
                >
                  {news.imagem_url && (
                    <div className="w-full aspect-video mb-3 rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center">
                      <img
                        src={news.imagem_url}
                        alt={news.titulo}
                        className="w-full h-full object-contain object-center"
                        onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/400?text=Sem+Imagem'; }}
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-block bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded text-xs font-semibold">
                      {catLabel}
                    </span>
                    {modalidadeLabel && (
                      <span className="inline-block bg-neutral-700 text-neutral-200 px-2 py-0.5 rounded text-xs font-semibold">
                        {modalidadeLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-50 mb-1">{news.titulo}</h3>
                  <p className="text-neutral-400 text-xs mb-2">
                    {news.data_criacao ? new Date(news.data_criacao).toLocaleDateString('pt-BR') : ''}
                  </p>
                  <p className="text-neutral-200 text-sm line-clamp-5 flex-1">{news.conteudo}</p>
                  {conteudoLongo && (
                    <Link
                      href={`/noticias/${news.id}`}
                      className="inline-block mt-3 text-orange-400 font-semibold hover:text-orange-300 hover:underline text-sm"
                    >
                      Ver mais →
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* 4 produtos em destaque */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-300">
              🛍️ Destaques da Loja
            </h2>
            <Link
              href={user ? '/dashboard/loja' : '/loja'}
              className="text-sm font-semibold text-orange-300 hover:text-orange-200 underline"
            >
              Ver loja →
            </Link>
          </div>
          {loadingProducts && <p className="text-neutral-400 text-sm">Carregando...</p>}
          {!loadingProducts && featuredProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((p: any) => (
                <Link key={p.id} href={user ? '/dashboard/loja' : '/loja'}>
                  <Card className="h-full bg-neutral-900 border border-neutral-800 hover:border-orange-500/60 transition overflow-hidden">
                    <div className="aspect-square bg-neutral-800 mb-2 overflow-hidden flex items-center justify-center">
                      <img
                        src={p.imagem_url || 'https://via.placeholder.com/200?text=Produto'}
                        alt={p.nome}
                        className="w-full h-full object-contain"
                        onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/200?text=Sem+Imagem'; }}
                      />
                    </div>
                    <p className="font-semibold text-neutral-100 text-sm line-clamp-2">{p.nome}</p>
                    <p className="text-orange-400 font-bold">R$ {Number(p.preco).toFixed(2)}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          {!loadingProducts && featuredProducts.length === 0 && (
            <p className="text-neutral-500 text-sm">Nenhum produto em destaque. O admin pode marcar produtos como destaque na loja.</p>
          )}
        </section>

        {/* Calendário de jogos (mensal) */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-300">
              📅 Próximos jogos
            </h2>
            <Link
              href={user ? '/dashboard/jogos' : '/jogos'}
              className="text-sm font-semibold text-orange-300 hover:text-orange-200 underline"
            >
              Ver todos →
            </Link>
          </div>
          {loadingMatches && <p className="text-neutral-400 text-sm">Carregando...</p>}
          {!loadingMatches && monthlyMatches.length === 0 && (
            <Card className="bg-neutral-900 border border-neutral-800 text-neutral-400 p-6 text-center">
              Nenhum jogo cadastrado para os próximos meses.
            </Card>
          )}
          {!loadingMatches && monthlyMatches.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-600 text-neutral-300 text-left">
                    <th className="py-3 px-3 font-semibold">Modalidade</th>
                    <th className="py-3 px-3 font-semibold">Data</th>
                    <th className="py-3 px-3 font-semibold">Horário</th>
                    <th className="py-3 px-3 font-semibold">Adversário</th>
                    <th className="py-3 px-3 font-semibold">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyMatches.map((m) => {
                    const d = new Date(m.data);
                    return (
                      <tr key={m.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-300">
                            {modalidadeLabel(m.modalidade)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-200">
                          {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-3 px-3 text-neutral-200">
                          {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 text-neutral-100">{m.adversario}</td>
                        <td className="py-3 px-3 text-neutral-400">{m.local || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </>
  );
}
