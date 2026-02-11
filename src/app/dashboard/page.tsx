 'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { NewsCard } from '@/components/NewsCard';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { News, Product, Match, NewsModalidade } from '@/types';
import { SITE_SOCIAL, LIVE_STREAM_EMBED, whatsAppOrderUrl, buildCartMessage } from '@/lib/site-config';

interface Project {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  imagem_capa_url?: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'shop'>('home');
  const [cart, setCart] = useState<any[]>([]);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [showLive, setShowLive] = useState(false);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [featuredPlayers, setFeaturedPlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const [newsRes, productsRes, projectsRes] = await Promise.all([
          supabase.from('news').select('*').order('created_at', { ascending: false }).limit(4),
          supabase.from('store_products').select('*').eq('ativo', true).order('created_at', { ascending: false }).limit(4),
          supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(4),
        ]);

        if (!newsRes.error && newsRes.data) {
          setFeaturedNews(newsRes.data.map((n: any): News => ({
            id: n.id,
            titulo: n.titulo,
            conteudo: n.conteudo,
            autor_id: n.autor_id ?? '',
            data_criacao: n.created_at ?? n.data_criacao ?? '',
            data_atualizacao: n.updated_at ?? n.data_atualizacao ?? '',
            categoria: n.categoria,
            modalidade: n.modalidade as NewsModalidade | undefined,
            imagem_url: n.imagem_url,
            destaque: n.destaque ?? false,
            curtidas: n.curtidas ?? 0,
            usuarios_curtidas: n.usuarios_curtidas ?? [],
            comentarios: [],
          })));
        }
        if (!productsRes.error && productsRes.data) {
          setFeaturedProducts(productsRes.data.map((p: any): Product => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao ?? '',
            preco: Number(p.preco),
            imagem_url: p.imagem_url ?? '',
            categoria: p.categoria ?? '',
            estoque: p.estoque ?? 0,
            data_criacao: p.created_at ?? '',
            ativo: p.ativo ?? true,
            tem_desconto_socio: p.tem_desconto_socio ?? false,
            desconto_socio: p.desconto_socio ?? undefined,
          })));
        }
        if (!projectsRes.error && projectsRes.data) {
          setFeaturedProjects(projectsRes.data.map((p: any) => ({
            id: p.id,
            titulo: p.titulo,
            descricao: p.descricao,
            status: p.status,
            imagem_capa_url: p.imagem_capa_url,
          })));
        }
      } catch (_) {}
      setLoadingFeatured(false);
    }
    loadFeatured();
  }, []);

  useEffect(() => {
    async function loadUpcomingMatches() {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .gte('data', new Date().toISOString())
          .order('data', { ascending: true })
          .limit(5);

        if (!error && data) {
          setUpcomingMatches(
            data.map((m: any) => ({
              id: m.id,
              data: m.data,
              adversario: m.adversario,
              local: m.local,
              resultado: m.resultado,
              gols_westham: m.gols_westham,
              gols_adversario: m.gols_adversario,
              tipo: m.tipo,
              descricao: m.descricao,
              modalidade: (m.modalidade || 'campo') as NewsModalidade,
            })),
          );
        }
      } finally {
        setLoadingMatches(false);
      }
    }

    loadUpcomingMatches();
  }, []);

  // Destaque de jogadores (3 principais) para o dashboard
  useEffect(() => {
    async function loadFeaturedPlayers() {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('id, nome, numero, posicao, gols, nivel, foto_url')
          .order('gols', { ascending: false })
          .limit(3);

        if (!error && data) {
          setFeaturedPlayers(data);
        } else {
          setFeaturedPlayers([]);
        }
      } finally {
        setLoadingPlayers(false);
      }
    }

    loadFeaturedPlayers();
  }, []);

  const handleAddToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantidade: 1 }]);
    }
    setCartNotice(`${product.nome} adicionado ao carrinho.`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getCartItemFinalPrice = (item: { preco: number; quantidade: number; tem_desconto_socio?: boolean; desconto_socio?: number }) => {
    const hasSocioDiscount = user?.role === 'sócio' && item.tem_desconto_socio && item.desconto_socio;
    const unit = hasSocioDiscount && item.desconto_socio
      ? item.preco * (1 - item.desconto_socio / 100)
      : item.preco;
    return unit * item.quantidade;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setCartNotice('Seu carrinho está vazio.');
      return;
    }
    const items = cart.map((item) => {
      const hasSocioDiscount = user?.role === 'sócio' && item.tem_desconto_socio && item.desconto_socio;
      const precoUnit = hasSocioDiscount && item.desconto_socio
        ? item.preco * (1 - item.desconto_socio / 100)
        : item.preco;
      return {
        nome: item.nome,
        quantidade: item.quantidade,
        precoUnit,
        precoTotal: precoUnit * item.quantidade,
      };
    });
    window.open(whatsAppOrderUrl(buildCartMessage(items)), '_blank');
    setCartNotice('Pedido enviado para o WhatsApp. O dono do site retornará em breve.');
    setCart([]);
  };

  if (!user) return null;

  return (
    <main className="bg-neutral-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Bem-vindo, {user.nome}
            </h1>
            <p className="text-neutral-600 mt-1">
              Loja, notícias e projetos disponíveis no menu principal.
            </p>
          </div>

          {/* Navigation Tabs - Home e Loja em destaque */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-6 py-3.5 rounded-lg font-bold text-base transition ${
                activeTab === 'home'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-6 py-3.5 rounded-lg font-bold text-base transition ${
                activeTab === 'shop'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
              }`}
            >
              Loja {cart.length > 0 && `(${cart.length})`}
            </button>
          </div>

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <>
              {/* Layout para USUÁRIO */}
              {user.role === 'usuário' && (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Coluna principal: 4 notícias, 4 produtos, 4 projetos */}
                  <div className="lg:col-span-2 space-y-8">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-neutral-800">Últimas notícias</h2>
                        <Link href="/dashboard/noticias" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                          Ver todas →
                        </Link>
                      </div>
                      {loadingFeatured ? (
                        <p className="text-neutral-500 text-sm">Carregando...</p>
                      ) : featuredNews.length === 0 ? (
                        <Card className="p-6 text-neutral-500 text-sm">Nenhuma notícia ainda.</Card>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {featuredNews.map((n) => (
                            <NewsCard
                              key={n.id}
                              news={{
                                ...n,
                                data: n.data_criacao ? new Date(n.data_criacao).toLocaleDateString('pt-BR') : '',
                                category: n.categoria,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-neutral-800">Destaques da loja</h2>
                        <Link href="/dashboard/loja" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                          Ver loja →
                        </Link>
                      </div>
                      {loadingFeatured ? (
                        <p className="text-neutral-500 text-sm">Carregando...</p>
                      ) : featuredProducts.length === 0 ? (
                        <Card className="p-6 text-neutral-500 text-sm">
                          Nenhum produto ainda. Assim que o administrador cadastrar itens na Loja
                          Oficial, os destaques aparecerão aqui.
                        </Card>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {featuredProducts.map((p) => {
                            const finalPrice = user?.role === 'sócio' && p.tem_desconto_socio && p.desconto_socio
                              ? p.preco * (1 - p.desconto_socio / 100) : p.preco;
                            return (
                              <Link key={p.id} href="/dashboard/loja">
                                <Card className="h-full hover:border-orange-500/50 transition overflow-hidden">
                                  <div className="h-32 bg-neutral-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={p.imagem_url}
                                      alt={p.nome}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Produto'; }}
                                    />
                                  </div>
                                  <h3 className="font-semibold text-neutral-800 line-clamp-1">{p.nome}</h3>
                                  <p className="text-orange-600 font-bold">R$ {finalPrice.toFixed(2)}</p>
                                </Card>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-neutral-800">Destaques do elenco</h2>
                        <Link
                          href="/dashboard/jogadores"
                          className="text-sm font-medium text-orange-600 hover:text-orange-500"
                        >
                          Ver todos os jogadores →
                        </Link>
                      </div>
                      {loadingPlayers ? (
                        <p className="text-neutral-500 text-sm">Carregando elenco...</p>
                      ) : featuredPlayers.length === 0 ? (
                        <Card className="p-6 text-neutral-500 text-sm">
                          Nenhum jogador cadastrado ainda. O administrador pode montar o elenco
                          pelo painel.
                        </Card>
                      ) : (
                        <div className="grid sm:grid-cols-3 gap-4">
                          {featuredPlayers.map((player) => (
                            <Card
                              key={player.id}
                              className="p-4 text-center hover:border-orange-500/50 transition flex flex-col items-center"
                            >
                              <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden mb-2 flex items-center justify-center">
                                {player.foto_url ? (
                                  <img
                                    src={player.foto_url}
                                    alt={player.nome}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-2xl font-bold text-neutral-500">
                                    {player.nome?.[0]?.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-neutral-900">{player.nome}</p>
                              <p className="text-xs text-neutral-500 mb-1">
                                #{player.numero} • {player.posicao}
                              </p>
                              <p className="text-xs text-neutral-600 mb-2">
                                Gols: <span className="font-semibold">{player.gols ?? 0}</span> •
                                Nível: <span className="font-semibold">{player.nivel ?? 5}/10</span>
                              </p>
                              <Link
                                href={`/dashboard/jogadores/${player.id}`}
                                className="mt-auto inline-flex text-xs font-semibold text-orange-600 hover:text-orange-500"
                              >
                                Ver perfil
                              </Link>
                            </Card>
                          ))}
                        </div>
                      )}
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-neutral-800">Projetos</h2>
                        <Link href="/dashboard/projetos" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                          Ver projetos →
                        </Link>
                      </div>
                      {loadingFeatured ? (
                        <p className="text-neutral-500 text-sm">Carregando...</p>
                      ) : featuredProjects.length === 0 ? (
                        <Card className="p-6 text-neutral-500 text-sm">Nenhum projeto ainda.</Card>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {featuredProjects.map((p) => (
                            <Link key={p.id} href="/dashboard/projetos">
                              <Card className="h-full hover:border-orange-500/50 transition">
                                {p.imagem_capa_url && (
                                  <div className="h-24 bg-neutral-100 rounded-lg mb-2 overflow-hidden">
                                    <img src={p.imagem_capa_url} alt={p.titulo} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <h3 className="font-semibold text-neutral-800 line-clamp-1">{p.titulo}</h3>
                                <p className="text-sm text-neutral-500 line-clamp-2">{p.descricao}</p>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      )}
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-neutral-800">Próximos jogos</h2>
                        <Link href="/dashboard/jogos" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                          Ver todos os jogos →
                        </Link>
                      </div>
                      {loadingMatches ? (
                        <p className="text-neutral-500 text-sm">Carregando partidas...</p>
                      ) : upcomingMatches.length === 0 ? (
                        <Card className="p-6 text-neutral-500 text-sm">Nenhum jogo futuro cadastrado.</Card>
                      ) : (
                        <div className="space-y-3">
                          {upcomingMatches.map((m) => {
                            const dataFormatada = m.data
                              ? new Date(m.data).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '';
                            const modalidadeLabel =
                              m.modalidade === 'futsal'
                                ? 'Futsal'
                                : m.modalidade === 'fut7'
                                ? 'FUT7'
                                : 'Campo';
                            return (
                              <Card key={m.id} className="flex items-center justify-between p-4">
                                <div>
                                  <p className="text-sm font-semibold text-neutral-800">
                                    {modalidadeLabel} vs {m.adversario}
                                  </p>
                                  <p className="text-xs text-neutral-500">
                                    {dataFormatada} • {m.local}
                                  </p>
                                </div>
                                <span className="text-xs px-3 py-1 rounded-full bg-neutral-900 text-neutral-50 font-semibold">
                                  {m.tipo === 'campeonato' ? 'Campeonato' : 'Amistoso'}
                                </span>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </div>

              {/* Sidebar: explicação sócio, contato e redes sociais, Assista ao vivo */}
                  <div className="space-y-6">
                    <Card className="border-2 border-orange-500/40 bg-gradient-to-br from-orange-50 to-neutral-50 p-6">
                      <h3 className="font-bold text-neutral-900 mb-3">Torne-se sócio do Westham</h3>
                      <p className="text-neutral-600 text-sm mb-4">
                        A sociedade de sócios é o coração do clube. Como sócio, você tem descontos
                        exclusivos na loja, carteirinha digital, acesso a estatísticas avançadas dos
                        jogadores, conteúdos exclusivos e participação ativa na vida do clube. Faça
                        parte da família Westham.
                      </p>
                      <Link href="/virar-socio">
                        <Button size="md" className="w-full">Saiba como virar sócio</Button>
                      </Link>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-bold text-neutral-800 mb-2">
                        Quer ingressar no nosso time ou marcar um amistoso?
                      </h3>
                      <p className="text-neutral-600 text-sm mb-3">
                        Preencha um formulário rápido e a equipe do Sport Club Westham retornará
                        pelo seu e-mail ou telefone o mais breve possível.
                      </p>
                      <Link href="/dashboard/contato-time">
                        <Button size="md" className="w-full">
                          Entrar em contato com o clube
                        </Button>
                      </Link>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-bold text-neutral-800 mb-3">Redes sociais</h3>
                      <div className="flex flex-wrap gap-2">
                        <a href={SITE_SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700">
                          Facebook
                        </a>
                        <a href={SITE_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700">
                          Instagram
                        </a>
                        <a href={SITE_SOCIAL.youtube} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700">
                          YouTube
                        </a>
                        <a href={SITE_SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700">
                          TikTok
                        </a>
                      </div>
                    </Card>

                    <Card className="p-6">
                      {LIVE_STREAM_EMBED.trim() ? (
                        <>
                          <button
                            onClick={() => setShowLive(!showLive)}
                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            Assista ao vivo
                          </button>
                          {showLive && (
                            <div className="mt-4 aspect-video bg-black rounded-lg overflow-hidden">
                              <iframe
                                src={LIVE_STREAM_EMBED}
                                title="Transmissão ao vivo"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <a
                          href={SITE_SOCIAL.youtubeStreams}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition text-center"
                        >
                          Assista ao vivo (West TV Guaíba)
                        </a>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {/* Layout para SÓCIO */}
              {user.role === 'sócio' && (
                <div className="space-y-8">
                  <Card className="bg-orange-600 text-white p-6">
                    <h3 className="font-bold text-lg">Conteúdo exclusivo de sócio</h3>
                    <p className="text-orange-100 text-sm mt-1">Acesso VIP ao clube</p>
                  </Card>
                  <p className="text-neutral-500 text-sm">Escalações, estatísticas e próximas partidas serão exibidas aqui em breve.</p>
                </div>
              )}

              {/* Layout para ADMIN */}
              {user.role === 'admin' && (
                <div className="space-y-8">
                  <Card className="bg-neutral-900 text-white p-6 border-neutral-700">
                    <h3 className="font-bold text-lg">Painel Administrativo</h3>
                    <p className="text-neutral-400 text-sm mt-1">Acesso total ao sistema</p>
                  </Card>
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-orange-600 text-white hover:bg-orange-500 transition"
                  >
                    Ir para painel admin
                  </Link>
                </div>
              )}
            </>
          )}

          {/* SHOP TAB */}
          {activeTab === 'shop' && (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Products Grid (sem itens mockados) */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold mb-4 text-neutral-800">Loja Oficial Westham</h2>
                <Card className="p-6 text-neutral-600 text-sm">
                  A experiência completa de compra ficará disponível aqui em breve. Enquanto isso,
                  acesse a aba <strong>Loja Oficial</strong> no menu para ver os produtos cadastrados
                  pelo administrador.
                </Card>
              </div>

              {/* Shopping Cart Sidebar */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-neutral-800">Carrinho</h2>
                <Card className="shadow-2xl sticky top-20">
                  {cartNotice && (
                    <div className="mb-4 p-3 rounded-lg text-sm border bg-emerald-50 text-emerald-800 border-emerald-200">
                      {cartNotice}
                    </div>
                  )}
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-neutral-500 text-sm">Seu carrinho está vazio</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800">{item.nome}</h4>
                              <button
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 font-bold"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                {item.quantidade}x R$ {(user?.role === 'sócio' && item.tem_desconto_socio && item.desconto_socio
                                  ? item.preco * (1 - (item.desconto_socio ?? 0) / 100)
                                  : item.preco
                                ).toFixed(2)}
                              </span>
                              <span className="font-bold text-red-600">
                                R$ {getCartItemFinalPrice(item).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex justify-between mb-4">
                          <span className="text-lg font-bold">Total:</span>
                          <span className="text-2xl font-bold text-red-600">
                            R$ {cart.reduce((acc, item) => acc + getCartItemFinalPrice(item), 0).toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          onClick={handleCheckout}
                          size="lg"
                          className="w-full"
                        >
                          Enviar pedido por WhatsApp
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
    </main>
  );
}
