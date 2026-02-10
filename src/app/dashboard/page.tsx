 'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { NewsCard } from '@/components/NewsCard';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { News, Product } from '@/types';
import { SITE_SOCIAL, LIVE_STREAM_EMBED } from '@/lib/site-config';

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
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [showLive, setShowLive] = useState(false);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const [newsRes, productsRes, projectsRes] = await Promise.all([
          supabase.from('news').select('*').order('created_at', { ascending: false }).limit(4),
          supabase.from('store_products').select('*').eq('ativo', true).order('created_at', { ascending: false }).limit(4),
          supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(4),
        ]);

        if (!newsRes.error && newsRes.data) {
          setFeaturedNews(newsRes.data.map((n: any) => ({
            id: n.id,
            titulo: n.titulo,
            conteudo: n.conteudo,
            categoria: n.categoria,
            imagem_url: n.imagem_url,
            data_criacao: n.created_at,
            curtidas: n.curtidas ?? 0,
            usuarios_curtidas: n.usuarios_curtidas ?? [],
            comentarios: [],
          })));
        }
        if (!productsRes.error && productsRes.data) {
          setFeaturedProducts(productsRes.data.map((p: any) => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao,
            preco: Number(p.preco),
            imagem_url: p.imagem_url,
            categoria: p.categoria,
            estoque: p.estoque,
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

  const mockProducts = [
    { id: '1', nome: 'Camiseta Vermelha', descricao: 'Camiseta oficial de jogo', preco: 89.90, imagem_url: 'https://via.placeholder.com/200?text=Camiseta', categoria: 'camiseta', estoque: 50 },
    { id: '2', nome: 'Boné Westham', descricao: 'Boné com logo do time', preco: 39.90, imagem_url: 'https://via.placeholder.com/200?text=Bone', categoria: 'acessório', estoque: 100 },
    { id: '3', nome: 'Meião Oficial', descricao: 'Meião com símbolo do time', preco: 24.90, imagem_url: 'https://via.placeholder.com/200?text=Meiao', categoria: 'acessório', estoque: 75 },
    { id: '4', nome: 'Chaveiro', descricao: 'Chaveiro em formato de escudo', preco: 14.90, imagem_url: 'https://via.placeholder.com/200?text=Chaveiro', categoria: 'acessório', estoque: 200 },
    { id: '5', nome: 'Caneca do Time', descricao: 'Caneca com impressão do logo', preco: 29.90, imagem_url: 'https://via.placeholder.com/200?text=Caneca', categoria: 'acessório', estoque: 80 },
    { id: '6', nome: 'Mochila Westham', descricao: 'Mochila esportiva do time', preco: 119.90, imagem_url: 'https://via.placeholder.com/200?text=Mochila', categoria: 'acessório', estoque: 30 },
  ];

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
    alert(`${product.nome} adicionado ao carrinho.`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }
    const total = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    alert(`Compra realizada. Total: R$ ${total.toFixed(2)}\n\nObrigado por comprar no Westham.`);
    setCart([]);
  };

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
                        <Card className="p-6 text-neutral-500 text-sm">Nenhum produto ainda.</Card>
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
                  </div>

                  {/* Sidebar: explicação sócio, redes sociais, Assista ao vivo */}
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
              {/* Products Grid */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold mb-6 text-neutral-800">Loja Oficial Westham</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {mockProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-2xl transition overflow-hidden">
                      {/* Product Image */}
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-4 overflow-hidden rounded-lg">
                        <img 
                          src={product.imagem_url} 
                          alt={product.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/200?text=Sem+Imagem';
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{product.nome}</h3>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                          {product.categoria}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.descricao}</p>

                      <div className="flex justify-between items-center mb-4">
                        <div className="text-2xl font-bold text-red-600">
                          R$ {product.preco.toFixed(2)}
                        </div>
                        <div className={`text-sm font-semibold px-3 py-1 rounded ${
                          product.estoque > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.estoque > 0 ? `Em estoque (${product.estoque})` : 'Indisponível'}
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.estoque === 0}
                        className="w-full"
                      >
                        {product.estoque > 0 ? 'Adicionar ao Carrinho' : 'Fora de Estoque'}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Shopping Cart Sidebar */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-neutral-800">Carrinho</h2>
                <Card className="shadow-2xl sticky top-20">
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
                                {item.quantidade}x R$ {item.preco.toFixed(2)}
                              </span>
                              <span className="font-bold text-red-600">
                                R$ {(item.preco * item.quantidade).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex justify-between mb-4">
                          <span className="text-lg font-bold">Total:</span>
                          <span className="text-2xl font-bold text-red-600">
                            R$ {cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0).toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          onClick={handleCheckout}
                          size="lg"
                          className="w-full"
                        >
                          Finalizar compra
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
