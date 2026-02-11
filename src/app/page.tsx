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

export default function HomePage() {
  const { user } = useAuth();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [stats, setStats] = useState({ jogadores: 0, gols: 0, vitorias: 0 });
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

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
    async function loadPlayersAndStats() {
      try {
        const { data: players } = await supabase
          .from('players')
          .select('id, nome, numero, posicao, gols, nivel')
          .order('gols', { ascending: false });
        setPlayersList(players || []);

        const jogadores = players?.length ?? 0;
        const gols = players?.reduce((s, p) => s + (Number(p.gols) || 0), 0) ?? 0;

        const { data: matches } = await supabase
          .from('matches')
          .select('gols_westham, gols_adversario')
          .not('gols_westham', 'is', null)
          .not('gols_adversario', 'is', null);
        const vitorias =
          matches?.filter(
            (m) =>
              (Number(m.gols_westham) ?? 0) > (Number(m.gols_adversario) ?? 0)
          ).length ?? 0;

        setStats({ jogadores, gols, vitorias });
      } catch (_) {
        setPlayersList([]);
      } finally {
        setLoadingPlayers(false);
      }
    }
    loadPlayersAndStats();
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

  const top3Players = playersList.slice(0, 3);
  const displayedPlayers = showAllPlayers ? playersList : top3Players;

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
                  FUT 7, Campo e Futsal, escolinha infantil, área do sócio e loja oficial em um só
                  lugar. Estatísticas, notícias, cronograma de jogos e projetos sociais do clube.
                </p>

                {!user && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className="bg-orange-500 hover:bg-orange-400 text-black shadow-lg"
                      >
                        Seja Sócio do Westham
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="bg-transparent border border-orange-400 text-orange-100 hover:bg-orange-500/20"
                      >
                        Entrar na sua conta
                      </Button>
                    </Link>
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

        {/* Apresentação do clube e sociedade */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-10">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-neutral-900 border border-neutral-800 col-span-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-orange-300 mb-4">
                Apresentação do Clube
              </h2>
              <p className="text-base md:text-lg text-neutral-100 leading-relaxed">
                O <strong>Sport Club Westham</strong> é um clube de futebol de Guaíba que une
                tradição, competitividade e projeto social. O clube atua em diferentes frentes:
                equipes de <strong>FUT 7</strong>, <strong>Campo</strong> e <strong>Futsal</strong>,
                categorias de base e escolinha infantil, sempre representando as cores preto e
                laranja com orgulho.
              </p>
              <p className="text-base md:text-lg text-neutral-100 leading-relaxed mt-3">
                Dentro e fora de campo, o Westham trabalha para formar atletas, torcedores e
                cidadãos, criando um ambiente de comunidade forte, comprometida com o esporte e
                com a cidade.
              </p>
            </Card>

            <Card className="bg-neutral-900 border border-orange-500/60">
              <h2 className="text-2xl md:text-3xl font-extrabold text-orange-300 mb-4">
                O que é a Sociedade de Sócios?
              </h2>
              <p className="text-base md:text-lg text-neutral-100 leading-relaxed">
                A sociedade de sócios é o coração do clube. Quem se torna sócio(a) ajuda a manter
                o Westham forte e ganha <strong>benefícios exclusivos</strong>:
              </p>
              <ul className="list-disc list-inside text-base text-neutral-100 mt-3 space-y-1">
                <li>Descontos na loja oficial do clube;</li>
                <li>Acesso a estatísticas avançadas dos jogadores e elencos;</li>
                <li>Carteirinha digital de sócio ativo;</li>
                <li>Conteúdo e notícias internas do clube.</li>
              </ul>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-neutral-900 border border-neutral-800">
              <h3 className="text-xl md:text-2xl font-extrabold text-orange-300 mb-3">História do Clube</h3>
              <p className="text-base md:text-lg text-neutral-100 leading-relaxed">
                A história do Westham é construída em cada partida, título, treino e projeto
                social. Nesta área, o administrador poderá publicar a linha do tempo oficial do
                clube, conquistas, fotos históricas, troféus e grandes momentos das equipes.
              </p>
              <p className="text-xs text-neutral-400 mt-3">
                (O painel do admin permite editar este conteúdo: texto, fotos e destaques da
                história.)
              </p>
            </Card>

            <Card className="bg-neutral-900 border border-neutral-800">
              <h3 className="text-xl md:text-2xl font-extrabold text-orange-300 mb-3">
                Projetos &amp; Escolinha Infantil
              </h3>
              <p className="text-base md:text-lg text-neutral-100 leading-relaxed">
                O campo de projetos reúne iniciativas como a <strong>escolinha infantil</strong> e
                outros programas do clube. O admin poderá cadastrar cada projeto com descrição,
                fotos, período, categorias envolvidas e status (ativo, inscrições abertas, etc.).
              </p>
            </Card>
          </div>
        </section>

        {/* News Section */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-orange-300 flex items-center gap-2">
              <span>📰 Últimas Notícias do Clube</span>
            </h2>
            <Link
              href="/noticias"
              className="text-sm font-semibold text-orange-300 hover:text-orange-200 underline"
            >
              Ver todas as notícias →
            </Link>
          </div>

          {loadingNews && (
            <p className="text-neutral-400 text-sm mb-4">Carregando notícias...</p>
          )}

          {!loadingNews && newsList.length === 0 && (
            <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
              Assim que o admin publicar notícias pelo painel, as últimas 3 aparecerão aqui.
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {newsList.map((news) => (
              <Card
                key={news.id}
                className="hover:shadow-xl transition bg-neutral-900 border border-neutral-800"
              >
                <div className="mb-3">
                  <span className="inline-block bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-semibold">
                    {news.categoria}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-neutral-50 mb-2">
                  {news.titulo}
                </h3>
                <p className="text-neutral-400 text-sm mb-4">
                  {news.data_criacao
                    ? new Date(news.data_criacao).toLocaleDateString('pt-BR')
                    : ''}
                </p>
                <p className="text-neutral-200 mb-4 line-clamp-4">{news.conteudo}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Players Section */}
        <section className="bg-neutral-900 py-16 px-6 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-orange-300">
                ⚽ Destaques do Elenco
              </h2>
              {!showAllPlayers && playersList.length > 3 && (
                <button
                  onClick={() => setShowAllPlayers(true)}
                  className="text-orange-400 font-semibold hover:text-orange-300 underline"
                >
                  Ver Todos →
                </button>
              )}
              {showAllPlayers && playersList.length > 3 && (
                <button
                  onClick={() => setShowAllPlayers(false)}
                  className="text-orange-400 font-semibold hover:text-orange-300 underline"
                >
                  Ver Menos ←
                </button>
              )}
            </div>
            {loadingPlayers && (
              <p className="text-neutral-400 text-sm mb-4">Carregando elenco...</p>
            )}
            {!loadingPlayers && playersList.length === 0 && (
              <Card className="bg-neutral-950 border border-neutral-800 text-neutral-300">
                Ainda não há jogadores cadastrados. O admin pode adicioná-los no painel.
              </Card>
            )}
            {!loadingPlayers && playersList.length > 0 && (
            <div className="grid md:grid-cols-4 gap-6">
              {displayedPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="bg-neutral-950 border border-neutral-800 hover:border-orange-500/60"
                >
                  <div className="mb-4 pb-4 border-b-2 border-red-100">
                    <div className="w-full h-40 bg-gradient-to-br from-black via-neutral-900 to-orange-500/40 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-6xl font-bold text-orange-400 opacity-20">
                        {player.numero}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-50 mb-1">
                    {player.nome}
                  </h3>
                  <p className="text-orange-300 font-semibold text-sm mb-3">
                    {player.posicao} #{player.numero}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Gols:</span>
                      <span className="font-bold text-orange-400">{player.gols}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Nível:</span>
                      <span className="font-bold text-orange-400">
                        {player.nivel != null ? `${player.nivel}/10` : '—'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-orange-300 text-center">
            📊 Estatísticas
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Jogadores', value: stats.jogadores, icon: '👥' },
              { label: 'Gols Marcados', value: stats.gols, icon: '⚽' },
              { label: 'Vitórias', value: stats.vitorias, icon: '🏆' },
              { label: 'Anos de Tradição', value: 25, icon: '📅' },
            ].map((stat, i) => (
              <Card
                key={i}
                className="text-center bg-neutral-900 border border-neutral-800 hover:border-orange-500/60"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-300 font-semibold">{stat.label}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="bg-gradient-to-r from-black via-neutral-900 to-orange-600 text-white py-16 px-6 mt-16 border-t border-neutral-800">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Faça parte da família Westham
              </h2>
              <p className="text-lg text-orange-100 mb-4">
                Torcedor, atleta, responsável de escolinha ou sócio: esse é o seu portal oficial
                para viver o clube no dia a dia.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:text-orange-700 text-lg font-bold"
                >
                  Junte-se ao Westham Agora
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
