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

type MatchRow = { id: string; data: string; data_text?: string | null; adversario: string; local: string; modalidade?: string };

export default function HomePage() {
  const { user } = useAuth();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [monthlyMatches, setMonthlyMatches] = useState<MatchRow[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [showAddToHomePopup, setShowAddToHomePopup] = useState(false);
  const [showAniversariantesPopup, setShowAniversariantesPopup] = useState(false);
  const [aniversariantesDia, setAniversariantesDia] = useState<{ nome: string; data_nascimento: string }[]>([]);
  const [aniversariantesMes, setAniversariantesMes] = useState<{ nome: string; data_nascimento: string }[]>([]);
  const [loadingAniversariantes, setLoadingAniversariantes] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);

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
        supabase.from('matches').select('id, data, data_text, adversario, local, modalidade').gte('data', now.toISOString()).lte('data', endOfNextMonth.toISOString()).order('data', { ascending: true }).limit(50),
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

  // Popup para adicionar à tela inicial (ao entrar no site)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem('westham_add_to_home_dismissed');
    if (!dismissed) {
      setShowAddToHomePopup(true);
    }
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAddToHomeClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        window.localStorage.setItem('westham_add_to_home_dismissed', '1');
      }
      setDeferredPrompt(null);
    }
    setShowAddToHomePopup(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('westham_add_to_home_dismissed', '1');
    }
  };

  const loadAniversariantes = async () => {
    setLoadingAniversariantes(true);
    const now = new Date();
    const dia = now.getDate();
    const mes = now.getMonth() + 1;
    const { data } = await supabase.from('profiles').select('first_name, last_name, full_name, data_nascimento').not('data_nascimento', 'is', null);
    const profiles = (data || []).filter((p: any) => p.data_nascimento);
    const diaList: { nome: string; data_nascimento: string }[] = [];
    const mesList: { nome: string; data_nascimento: string }[] = [];
    profiles.forEach((p: any) => {
      const dt = p.data_nascimento;
      const parts = String(dt).split(/[-/]/);
      const d = parseInt(parts[2] ?? parts[0], 10);
      const m = parseInt(parts[1], 10);
      const nome = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.full_name || 'Aniversariante';
      if (d === dia && m === mes) diaList.push({ nome, data_nascimento: dt });
      else if (m === mes) mesList.push({ nome, data_nascimento: dt });
    });
    setAniversariantesDia(diaList);
    setAniversariantesMes(mesList);
    setLoadingAniversariantes(false);
    setShowAniversariantesPopup(true);
  };

  const modalidadeLabel = (m?: string) => (m === 'fut7' ? 'FUT 7' : m === 'futsal' ? 'FUTSAL' : m === 'campo' ? 'FUT11' : 'FUT11');

  return (
    <>
      <Header />
      <main className="bg-neutral-950 min-h-screen">
        {showAddToHomePopup && (
          <>
            <div className="fixed inset-0 z-50 bg-black/70" aria-hidden="true" onClick={() => { setShowAddToHomePopup(false); if (typeof window !== 'undefined') window.localStorage.setItem('westham_add_to_home_dismissed', '1'); }} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-neutral-900 border-2 border-orange-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="text-lg font-bold text-orange-400">📱 Adicione o Westham à tela inicial</h3>
                <button type="button" aria-label="Fechar" className="p-1 rounded hover:bg-white/10" onClick={() => { setShowAddToHomePopup(false); if (typeof window !== 'undefined') window.localStorage.setItem('westham_add_to_home_dismissed', '1'); }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-sm text-neutral-300 mb-4">Use o portal do Sport Club Westham como app no seu celular. Siga os passos conforme seu aparelho:</p>
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
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-orange-600 hover:bg-orange-500" onClick={handleAddToHomeClick}>Adicionar à tela inicial</Button>
                <Button variant="secondary" className="flex-1" onClick={() => { setShowAddToHomePopup(false); if (typeof window !== 'undefined') window.localStorage.setItem('westham_add_to_home_dismissed', '1'); }}>Fechar</Button>
              </div>
            </div>
          </>
        )}

        {showAniversariantesPopup && (
          <>
            <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setShowAniversariantesPopup(false)} aria-hidden />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto bg-neutral-900 border-2 border-orange-500 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-orange-400">🎂 Aniversariantes</h3>
                <button type="button" aria-label="Fechar" className="p-1 rounded hover:bg-white/10" onClick={() => setShowAniversariantesPopup(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {loadingAniversariantes ? (
                <p className="text-neutral-400 py-4">Carregando...</p>
              ) : (
                <div className="space-y-4">
                  <Card className="p-4 bg-neutral-800 border-neutral-700">
                    <h4 className="font-bold text-orange-300 mb-2">Aniversariantes do dia</h4>
                    {aniversariantesDia.length === 0 ? (
                      <p className="text-neutral-400 text-sm">Nenhum aniversariante hoje.</p>
                    ) : (
                      <ul className="space-y-1">
                        {aniversariantesDia.map((a, i) => (
                          <li key={i} className="text-neutral-100">{a.nome}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                  <Card className="p-4 bg-neutral-800 border-neutral-700">
                    <h4 className="font-bold text-orange-300 mb-2">Aniversariantes do mês</h4>
                    {aniversariantesMes.length === 0 ? (
                      <p className="text-neutral-400 text-sm">Nenhum aniversariante este mês.</p>
                    ) : (
                      <ul className="space-y-1 max-h-40 overflow-y-auto">
                        {aniversariantesMes.map((a, i) => (
                          <li key={i} className="text-neutral-100 text-sm">{a.nome} — {new Date(a.data_nascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              )}
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
                  FUT11, FUT 7 e FUTSAL, área do sócio e loja oficial em um só lugar. Notícias,
                  cronograma de jogos e projetos do clube.
                </p>

                <div className="space-y-5">
                  {/* Links secundários */}
                  <button
                    type="button"
                    onClick={loadAniversariantes}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/40 text-orange-200 hover:bg-orange-500/25 hover:border-orange-400/60 text-sm font-medium transition"
                  >
                    🎂 Ver aniversariantes do dia e do mês
                  </button>

                  {!user && (
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/signup">
                          <Button
                            size="lg"
                            className="w-full sm:w-auto min-w-[200px] bg-orange-600 hover:bg-orange-500 text-white shadow-lg border border-orange-400 font-bold"
                          >
                            Virar sócio do clube
                          </Button>
                        </Link>
                        <Link href="/marcar-amistoso">
                          <Button
                            size="lg"
                            className="w-full sm:w-auto min-w-[200px] bg-orange-500/90 hover:bg-orange-500 text-white shadow-lg border border-orange-400/80 font-bold"
                          >
                            Quer marcar um amistoso?
                          </Button>
                        </Link>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:pl-2 sm:border-l sm:border-orange-400/40">
                        <Link href="/login">
                          <Button
                            size="lg"
                            variant="secondary"
                            className="w-full sm:w-auto bg-transparent border-2 border-orange-400 text-orange-100 hover:bg-orange-500/20 font-semibold"
                          >
                            Entrar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

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
              const modalidadeLabel = news.modalidade === 'fut7' ? 'FUT 7' : news.modalidade === 'futsal' ? 'FUTSAL' : news.modalidade === 'campo' ? 'FUT11' : null;
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
                    const dataExib = m.data_text;
                    const dataPart = dataExib ? dataExib.split(' ')[0] || '—' : (m.data ? new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—');
                    const horaPart = dataExib ? (dataExib.split(' ')[1] || '—') : (m.data ? new Date(m.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—');
                    return (
                      <tr key={m.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-300">
                            {modalidadeLabel(m.modalidade)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-200">
                          {dataPart}
                        </td>
                        <td className="py-3 px-3 text-neutral-200">
                          {horaPart}
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
