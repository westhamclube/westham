'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { News, Product, User, NewsModalidade } from '@/types';

// Helpers
function getYouTubeEmbed(url: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch (e) {
    return null;
  }
  return null;
}

function guessImgurDirect(url: string) {
  if (!url) return url;
  try {
    const u = new URL(url);
    // If it's already a direct image link, return as-is
    if (u.hostname === 'i.imgur.com') return url;
    // If it's an imgur page like imgur.com/abc123, guess .jpg
    if (u.hostname.includes('imgur.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://i.imgur.com/${id}.jpg`;
    }
  } catch (e) {
    return url;
  }
  return url;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'news' | 'players' | 'lineup' | 'ranks' | 'shop' | 'socio' | 'suporte' | 'historia'>('ranks');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // News states
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<News['categoria']>('general');
  const [newsModalidade, setNewsModalidade] = useState<NewsModalidade>('campo');
  const [newsImage, setNewsImage] = useState('');
  const [newsVideo, setNewsVideo] = useState('');
  const [newsLinkExterno, setNewsLinkExterno] = useState('');
  const [newsList, setNewsList] = useState<News[]>([]);
  const [editingNews, setEditingNews] = useState<string | null>(null);

  // Player states
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');
  const [playerAge, setPlayerAge] = useState('');
  const [playerJogaCampo, setPlayerJogaCampo] = useState(true);
  const [playerJogaFut7, setPlayerJogaFut7] = useState(false);
  const [playerJogaFutsal, setPlayerJogaFutsal] = useState(false);
  const [editingPlayerModalidades, setEditingPlayerModalidades] = useState<string | null>(null);
  const [editModalidadesCampo, setEditModalidadesCampo] = useState(true);
  const [editModalidadesFut7, setEditModalidadesFut7] = useState(false);
  const [editModalidadesFutsal, setEditModalidadesFutsal] = useState(false);
  const [playersList, setPlayersList] = useState<any[]>([]);

  // Lineup states
  const [titulares, setTitulares] = useState<any[]>([
    { id: '1', nome: 'João Silva', numero: 7, gols_jogo: 0 },
  ]);
  const [reservas, setReservas] = useState<any[]>([
    { id: '2', nome: 'Pedro Santos', numero: 5, gols_jogo: 0 },
  ]);

  // Ranks states
  const [rankRequests, setRankRequests] = useState<User[]>([]);

  const [promoteRole, setPromoteRole] = useState<{[key: string]: string}>({});

  // Shop states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [productModels, setProductModels] = useState<string[]>([]);
  const [newModelInput, setNewModelInput] = useState('');
  const [productCategory, setProductCategory] = useState('camiseta');
  const [productStock, setProductStock] = useState('');
  const [temDescontoSocio, setTemDescontoSocio] = useState(false);
  const [descontoSocio, setDescontoSocio] = useState('');
  const [productDestaque, setProductDestaque] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const [socioRequests, setSocioRequests] = useState<any[]>([]);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [historyBlocks, setHistoryBlocks] = useState<any[]>([]);
  const [historyPhotos, setHistoryPhotos] = useState<any[]>([]);
  const [historyTitulo, setHistoryTitulo] = useState('');
  const [historyConteudo, setHistoryConteudo] = useState('');
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoLegenda, setNewPhotoLegenda] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }

    const loadInitialData = async () => {
      try {
        if (!user) return;

        setIsLoadingData(true);

        const [profilesRes, newsRes, playersRes, productsRes, socioRes, supportRes] = await Promise.all([
          supabase.from('profiles').select('id, email, first_name, last_name, role'),
          supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30),
          supabase
            .from('players')
            .select('id, nome, numero, posicao, idade, gols, nivel')
            .order('numero', { ascending: true }),
          supabase
            .from('store_products')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase.from('socio_requests').select('*').order('created_at', { ascending: false }),
          supabase.from('support_messages').select('*').order('created_at', { ascending: false }),
        ]);

        if (!profilesRes.error && profilesRes.data) {
          setRankRequests(
            profilesRes.data.map((p: any) => ({
              id: p.id,
              email: p.email,
              nome:
                p.first_name || p.last_name
                  ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()
                  : p.email,
              sobrenome: p.last_name ?? '',
              role: p.role,
              data_cadastro: '',
              cpf: '',
              telefone: '',
            })) as User[],
          );
        }

        if (!newsRes.error && newsRes.data) {
          setNewsList(
            newsRes.data.map((n: any) => ({
              id: n.id,
              titulo: n.titulo,
              conteudo: n.conteudo,
              autor_id: n.autor_id,
              data_criacao: n.created_at,
              data_atualizacao: n.updated_at,
              categoria: n.categoria,
              modalidade: n.modalidade,
              imagem_url: n.imagem_url,
              video_url: n.video_url,
              link_externo: n.link_externo,
              midia_url: n.midia_url,
              destaque: n.destaque,
              curtidas: n.curtidas ?? 0,
              usuarios_curtidas: n.usuarios_curtidas ?? [],
              comentarios: [],
            })),
          );
        }

        if (!playersRes.error && playersRes.data) {
          setPlayersList(playersRes.data);
        }

        if (!productsRes.error && productsRes.data) {
          setProductsList(
            productsRes.data.map((p: any) => ({
              id: p.id,
              nome: p.nome,
              descricao: p.descricao,
              preco: Number(p.preco),
              imagem_url: p.imagem_url,
              imagens: p.imagens ?? [],
              modelos: p.modelos ?? [],
              categoria: p.categoria,
              estoque: p.estoque,
              data_criacao: p.created_at,
              ativo: p.ativo,
              desconto_socio: p.desconto_socio ?? undefined,
              tem_desconto_socio: p.tem_desconto_socio ?? false,
            })),
          );
        }

        if (!socioRes.error && socioRes.data) setSocioRequests(socioRes.data);
        if (!supportRes.error && supportRes.data) setSupportMessages(supportRes.data);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user?.role === 'admin') {
      loadInitialData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (activeTab !== 'historia' || !user) return;
    const load = async () => {
      const [hRes, pRes] = await Promise.all([
        supabase.from('club_history').select('*').order('ordem', { ascending: true }),
        supabase.from('club_history_photos').select('*').order('ordem', { ascending: true }),
      ]);
      if (!hRes.error && hRes.data) {
        setHistoryBlocks(hRes.data);
        const first = hRes.data[0];
        if (first) {
          setHistoryTitulo(first.titulo || '');
          setHistoryConteudo(first.conteudo || '');
          setEditingHistoryId(first.id);
        }
      }
      if (!pRes.error && pRes.data) setHistoryPhotos(pRes.data);
    };
    load();
  }, [activeTab, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-red-600 border-t-orange-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
  };

  // News handlers
  const handlePostNews = async () => {
    if (!newsTitle.trim() || !newsContent.trim() || !user) return;

    const payload: Record<string, unknown> = {
      titulo: newsTitle,
      conteudo: newsContent,
      categoria: newsCategory,
      modalidade: newsModalidade,
      imagem_url: newsImage || null,
      video_url: newsVideo || null,
      autor_id: user.id,
    };
    payload.link_externo = newsCategory === 'social' ? (newsLinkExterno || null) : null;

    if (editingNews) {
      const { error } = await supabase.from('news').update(payload).eq('id', editingNews);
      if (error) {
        showFeedback('error', `Erro ao atualizar notícia: ${error.message}`);
        return;
      }

      setNewsList((prev) =>
        prev.map((n): News =>
          n.id === editingNews
            ? {
                ...n,
                titulo: payload.titulo as string,
                conteudo: payload.conteudo as string,
                categoria: payload.categoria as News['categoria'],
                modalidade: payload.modalidade as NewsModalidade | undefined,
                imagem_url: (payload.imagem_url as string | null) ?? undefined,
                video_url: (payload.video_url as string | null) ?? undefined,
                link_externo: (payload.link_externo as string | null) ?? undefined,
                autor_id: payload.autor_id as string,
              }
            : n,
        ),
      );
      showFeedback('success', 'Notícia atualizada com sucesso!');
      setEditingNews(null);
    } else {
      const { data, error } = await supabase
        .from('news')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        showFeedback('error', `Erro ao publicar notícia: ${error.message}`);
        return;
      }

      const created: News = {
        id: data.id,
        titulo: data.titulo,
        conteudo: data.conteudo,
        autor_id: data.autor_id,
        data_criacao: data.created_at,
        data_atualizacao: data.updated_at,
        categoria: data.categoria,
        modalidade: data.modalidade as NewsModalidade | undefined,
        imagem_url: data.imagem_url,
        video_url: data.video_url,
        link_externo: data.link_externo,
        midia_url: data.midia_url,
        destaque: data.destaque,
        curtidas: data.curtidas ?? 0,
        usuarios_curtidas: data.usuarios_curtidas ?? [],
        comentarios: [],
      };

      setNewsList((prev) => [created, ...prev]);
      showFeedback('success', 'Notícia publicada com sucesso!');
    }

    setNewsTitle('');
    setNewsContent('');
    setNewsImage('');
    setNewsVideo('');
    setNewsLinkExterno('');
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Deseja deletar esta notícia?')) return;
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      showFeedback('error', `Erro ao deletar notícia: ${error.message}`);
      return;
    }
    setNewsList((prev) => prev.filter((n) => n.id !== id));
    showFeedback('success', 'Notícia deletada!');
  };

  const handleEditNews = (news: any) => {
    setEditingNews(news.id);
    setNewsTitle(news.titulo);
    setNewsContent(news.conteudo);
    setNewsCategory(news.categoria || news.category);
    setNewsModalidade((news.modalidade || 'campo') as NewsModalidade);
    setNewsImage(news.imagem_url || '');
    setNewsVideo(news.video_url || '');
    setNewsLinkExterno(news.link_externo || '');
  };

  // Players handlers
  const handleAddPlayer = async () => {
    if (!playerName.trim() || !playerNumber || !playerPosition) return;
    const atLeastOne = playerJogaCampo || playerJogaFut7 || playerJogaFutsal;
    if (!atLeastOne) {
      showFeedback('error', 'Marque pelo menos uma modalidade (Campo, FUT 7 ou Futsal).');
      return;
    }

    const payload = {
      nome: playerName,
      numero: parseInt(playerNumber, 10),
      posicao: playerPosition,
      idade: playerAge ? parseInt(playerAge, 10) : null,
      gols: 0,
      nivel: 5,
      joga_campo: playerJogaCampo,
      joga_fut7: playerJogaFut7,
      joga_futsal: playerJogaFutsal,
    };

    const { data, error } = await supabase.from('players').insert(payload).select('*').single();
    if (error) {
      showFeedback('error', `Erro ao adicionar jogador: ${error.message}`);
      return;
    }

    setPlayersList((prev) => [...prev, data]);
    showFeedback('success', 'Jogador adicionado!');
    setPlayerName('');
    setPlayerNumber('');
    setPlayerPosition('');
    setPlayerAge('');
    setPlayerJogaCampo(true);
    setPlayerJogaFut7(false);
    setPlayerJogaFutsal(false);
  };

  const handleSavePlayerModalidades = async () => {
    if (!editingPlayerModalidades) return;
    const joga_campo = editModalidadesCampo;
    const joga_fut7 = editModalidadesFut7;
    const joga_futsal = editModalidadesFutsal;
    if (!joga_campo && !joga_fut7 && !joga_futsal) {
      showFeedback('error', 'Marque pelo menos uma modalidade.');
      return;
    }
    const { error } = await supabase.from('players').update({ joga_campo, joga_fut7, joga_futsal }).eq('id', editingPlayerModalidades);
    if (error) {
      showFeedback('error', error.message);
      return;
    }
    setPlayersList((prev) => prev.map((p) => (p.id === editingPlayerModalidades ? { ...p, joga_campo, joga_fut7, joga_futsal } : p)));
    setEditingPlayerModalidades(null);
    showFeedback('success', 'Modalidades atualizadas!');
  };

  const openEditModalidades = (player: any) => {
    setEditingPlayerModalidades(player.id);
    setEditModalidadesCampo(player.joga_campo !== false);
    setEditModalidadesFut7(!!player.joga_fut7);
    setEditModalidadesFutsal(!!player.joga_futsal);
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Deseja deletar este jogador?')) return;
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) {
      showFeedback('error', `Erro ao deletar jogador: ${error.message}`);
      return;
    }
    setPlayersList((prev) => prev.filter((p) => p.id !== id));
    showFeedback('success', 'Jogador deletado!');
  };

  const handleUpdatePlayerGoals = async (id: string, goals: number) => {
    setPlayersList((prev) => prev.map((p) => (p.id === id ? { ...p, gols: goals } : p)));
    await supabase.from('players').update({ gols: goals }).eq('id', id);
  };

  // Ranks handlers
  const handlePromoteRank = async (id: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    if (error) {
      showFeedback('error', `Erro ao atualizar usuário: ${error.message}`);
      return;
    }

    setRankRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, role: newRole as any } : r)),
    );
    showFeedback('success', `Usuário atualizado para ${newRole}!`);
  };

  // Shop handlers
  const handleAddProduct = async () => {
    const hasImage = productImages.length > 0 || productImage.trim();
    if (productName.trim() && productDescription.trim() && productPrice && hasImage) {
      const imagens = productImages.length > 0 ? productImages : productImage ? [productImage] : [];
      const payload: any = {
        nome: productName,
        descricao: productDescription,
        preco: parseFloat(productPrice),
        imagem_url: imagens[0] || productImage,
        imagens,
        modelos: productModels,
        categoria: productCategory,
        estoque: parseInt(productStock || '0', 10),
        tem_desconto_socio: temDescontoSocio,
        desconto_socio: temDescontoSocio ? parseInt(descontoSocio || '0', 10) : null,
        ativo: true,
        destaque: productDestaque,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('store_products')
          .update(payload)
          .eq('id', editingProduct);
        if (error) {
          showFeedback('error', `Erro ao atualizar produto: ${error.message}`);
          return;
        }

        setProductsList((prev) =>
          prev.map((p) =>
            p.id === editingProduct
              ? {
                  ...p,
                  ...payload,
                }
              : p,
          ),
        );
        showFeedback('success', 'Produto atualizado com sucesso!');
        setEditingProduct(null);
      } else {
        const { data, error } = await supabase
          .from('store_products')
          .insert(payload)
          .select('*')
          .single();

        if (error) {
          showFeedback('error', `Erro ao adicionar produto: ${error.message}`);
          return;
        }

        const created: Product = {
          id: data.id,
          nome: data.nome,
          descricao: data.descricao,
          preco: Number(data.preco),
          imagem_url: data.imagem_url,
          imagens: data.imagens ?? [],
          modelos: data.modelos ?? [],
          categoria: data.categoria,
          estoque: data.estoque,
          data_criacao: data.created_at,
          ativo: data.ativo,
          desconto_socio: data.desconto_socio ?? undefined,
          tem_desconto_socio: data.tem_desconto_socio ?? false,
        };

        setProductsList((prev) => [...prev, created]);
        showFeedback('success', 'Produto adicionado com sucesso!');
      }
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductImage('');
      setProductImages([]);
      setProductModels([]);
      setNewImageUrl('');
      setNewModelInput('');
      setProductStock('');
      setProductCategory('camiseta');
    setTemDescontoSocio(false);
    setDescontoSocio('');
    setProductDestaque(false);
    } else {
      showFeedback('error', 'Preencha todos os campos obrigatórios do produto.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja deletar este produto?')) return;
    const { error } = await supabase.from('store_products').delete().eq('id', id);
    if (error) {
      showFeedback('error', `Erro ao deletar produto: ${error.message}`);
      return;
    }
    setProductsList((prev) => prev.filter((p) => p.id !== id));
    showFeedback('success', 'Produto deletado!');
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id);
    setProductName(product.nome);
    setProductDescription(product.descricao);
    setProductPrice(product.preco.toString());
    setProductImage(product.imagem_url || '');
    setProductImages(product.imagens || (product.imagem_url ? [product.imagem_url] : []));
    setProductModels(product.modelos || []);
    setProductCategory(product.categoria);
    setProductStock(product.estoque?.toString() || '');
    setTemDescontoSocio(product.tem_desconto_socio || false);
    setDescontoSocio(product.desconto_socio?.toString() || '');
    setProductDestaque(!!(product as any).destaque);
  };

  return (
    <>
      <Header />
      <main className="bg-neutral-950 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-6">
          {feedback && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-900/30 border border-emerald-500/60 text-emerald-200'
                  : 'bg-red-900/30 border border-red-500/60 text-red-200'
              }`}
            >
              {feedback.message}
            </div>
          )}
          {/* Header */}
          <Card className="mb-8 bg-gradient-to-r from-black via-neutral-900 to-orange-600 text-white shadow-2xl border border-orange-500/60">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">🔐 Painel de Administração</h1>
                <p className="text-orange-100">
                  Gerenciar sócios, jogadores, notícias, escalações, projetos e loja oficial
                </p>
              </div>
              <div className="text-6xl">⚙️</div>
            </div>
          </Card>

          {/* Tabs Navigation */}
          <div className="flex gap-4 mb-8 flex-wrap">
            {[
              { id: 'ranks', label: 'Aprovações', icon: '✅' },
              { id: 'socio', label: 'Solicitações sócio', icon: '📋' },
              { id: 'suporte', label: 'Mensagens suporte', icon: '📩' },
              { id: 'news', label: 'Notícias', icon: '📰' },
              { id: 'players', label: 'Jogadores', icon: '⚽' },
              { id: 'lineup', label: 'Escalação', icon: '🏆' },
              { id: 'shop', label: 'Loja', icon: '🛍️' },
              { id: 'historia', label: 'História', icon: '📜' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-black via-neutral-900 to-orange-600 text-white shadow-lg border border-orange-500/80'
                    : 'bg-neutral-900 text-neutral-100 hover:shadow-md border border-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ranks Tab */}
          {activeTab === 'ranks' && (
            <Card className="shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">✅ Gerenciar Usuários e Sócios</h2>
              <p className="text-gray-600 mb-6">
                • <strong>Usuários</strong>: Auto-aprovados ao se cadastrar (veem notícias, vitórias)<br/>
                • <strong>Sócios</strong>: Podem ser promovidos pelo admin (veem escalações VIP, conteúdo exclusivo)<br/>
                • <strong>Admin</strong>: Gerencia tudo
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Nível Atual</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Promover Para</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankRequests.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-red-50">
                        <td className="py-3 px-4 font-semibold text-gray-800">{user.nome}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'sócio' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role === 'usuário' ? '👤 Usuário' :
                             user.role === 'sócio' ? '⭐ Sócio' :
                             '👑 Admin'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            onChange={(e) => setPromoteRole({...promoteRole, [user.id]: e.target.value})}
                            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600"
                          >
                            <option value="">-- Selecione --</option>
                            {['usuário','sócio','jogador','admin'].filter(r => r !== user.role).map((r) => (
                              <option key={r} value={r}>
                                {r === 'usuário' ? '👤 Rebaixar para Usuário' : r === 'sócio' ? '⭐ Definir como Sócio' : r === 'jogador' ? '⚽ Definir como Jogador' : '👑 Definir como Admin'}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {promoteRole[user.id] && (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                handlePromoteRank(user.id, promoteRole[user.id]);
                                setPromoteRole({...promoteRole, [user.id]: '' });
                              }}
                            >
                              Confirmar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Solicitações de sócio */}
          {activeTab === 'socio' && (
            <Card className="shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Solicitações para virar sócio</h2>
              <p className="text-gray-600 mb-6">
                Formulários enviados pela página &quot;Como virar sócio&quot;. Entre em contato pelo e-mail ou telefone para concluir a adesão.
              </p>
              <div className="overflow-x-auto">
                {socioRequests.length === 0 ? (
                  <p className="text-gray-500 py-6">Nenhuma solicitação ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {socioRequests.map((r) => (
                      <div
                        key={r.id}
                        className={`border rounded-xl p-5 ${r.lido ? 'bg-gray-50 border-gray-200' : 'bg-orange-50/50 border-orange-200'}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <span className="text-sm text-gray-500">
                            {r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : ''}
                          </span>
                          {!r.lido && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                await supabase.from('socio_requests').update({ lido: true }).eq('id', r.id);
                                setSocioRequests((prev) => prev.map((x) => (x.id === r.id ? { ...x, lido: true } : x)));
                              }}
                            >
                              Marcar como lido
                            </Button>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <p><span className="font-semibold text-gray-700">Nome completo:</span> {r.nome_completo}</p>
                          <p><span className="font-semibold text-gray-700">CPF:</span> {r.cpf}</p>
                          <p><span className="font-semibold text-gray-700">Data de nascimento:</span> {r.data_nascimento ? new Date(r.data_nascimento).toLocaleDateString('pt-BR') : ''}</p>
                          <p><span className="font-semibold text-gray-700">E-mail:</span> <a href={`mailto:${r.email}`} className="text-orange-600 hover:underline">{r.email}</a></p>
                          <p><span className="font-semibold text-gray-700">Telefone:</span> {r.telefone}</p>
                          <p className="sm:col-span-2"><span className="font-semibold text-gray-700">Endereço:</span> {r.endereco}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Mensagens de suporte */}
          {activeTab === 'suporte' && (
            <Card className="shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Mensagens de suporte / defeitos</h2>
              <p className="text-gray-600 mb-6">
                Reportes de defeitos ou problemas enviados pela página de suporte.
              </p>
              <div className="overflow-x-auto">
                {supportMessages.length === 0 ? (
                  <p className="text-gray-500 py-6">Nenhuma mensagem ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {supportMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`border rounded-lg p-4 ${m.lido ? 'bg-gray-50 border-gray-200' : 'bg-orange-50/50 border-orange-200'}`}
                      >
                        <div className="flex flex-wrap items-center gap-4 mb-2">
                          <span className="text-sm text-gray-500">
                            {m.created_at ? new Date(m.created_at).toLocaleString('pt-BR') : ''}
                          </span>
                          <span className="font-semibold text-gray-800">{m.nome}</span>
                          <a href={`mailto:${m.email}`} className="text-orange-600 hover:underline text-sm">{m.email}</a>
                          <span className="text-gray-600 text-sm">{m.telefone}</span>
                          {!m.lido && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                await supabase.from('support_messages').update({ lido: true }).eq('id', m.id);
                                setSupportMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, lido: true } : x)));
                              }}
                            >
                              Marcar lido
                            </Button>
                          )}
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{m.mensagem}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* História do clube */}
          {activeTab === 'historia' && (
            <Card className="shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">📜 História do Westham</h2>
              <p className="text-gray-600 mb-6">
                Edite o texto e as fotos da página /historia. (Execute a migração SQL no Supabase se as tabelas club_history e club_history_photos não existirem.)
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={historyTitulo}
                    onChange={(e) => setHistoryTitulo(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    placeholder="Ex: História do Westham"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Conteúdo (texto da história)</label>
                  <textarea
                    value={historyConteudo}
                    onChange={(e) => setHistoryConteudo(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg min-h-[200px]"
                    placeholder="Escreva a história do clube..."
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!editingHistoryId) return;
                    const { error } = await supabase.from('club_history').update({ titulo: historyTitulo, conteudo: historyConteudo, updated_at: new Date().toISOString() }).eq('id', editingHistoryId);
                    if (error) showFeedback('error', error.message);
                    else showFeedback('success', 'História atualizada!');
                  }}
                >
                  Salvar história
                </Button>
                <hr className="border-gray-200" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Fotos da galeria (rodapé)</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="URL da foto"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Legenda"
                      value={newPhotoLegenda}
                      onChange={(e) => setNewPhotoLegenda(e.target.value)}
                      className="w-40 px-4 py-2 border-2 border-gray-300 rounded-lg"
                    />
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!newPhotoUrl.trim() || historyBlocks.length === 0) return;
                        const historyId = historyBlocks[0].id;
                        const { data, error } = await supabase.from('club_history_photos').insert({ history_id: historyId, url: newPhotoUrl.trim(), legenda: newPhotoLegenda.trim() || null, ordem: historyPhotos.length }).select('*').single();
                        if (error) showFeedback('error', error.message);
                        else {
                          if (data) setHistoryPhotos((prev) => [...prev, data]);
                          setNewPhotoUrl('');
                          setNewPhotoLegenda('');
                          showFeedback('success', 'Foto adicionada!');
                        }
                      }}
                    >
                      Adicionar foto
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {historyPhotos.map((p) => (
                      <div key={p.id} className="relative w-24 h-24 rounded overflow-hidden bg-gray-100 border">
                        <img src={p.url} alt={p.legenda || ''} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={async () => {
                            await supabase.from('club_history_photos').delete().eq('id', p.id);
                            setHistoryPhotos((prev) => prev.filter((x) => x.id !== p.id));
                          }}
                          className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  {editingNews ? '✏️ Editar Notícia' : '📰 Publicar Nova Notícia'}
                </h2>

                <div className="space-y-4">
                  <Input
                    label="Título da Notícia"
                    placeholder="Ex: Westham vence importante jogo"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700">Categoria</label>
                      <select
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value as News['categoria'])}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                      >
                        <option value="general">Geral</option>
                        <option value="match">Partida</option>
                        <option value="player">Jogador</option>
                        <option value="academy">Academia</option>
                        <option value="social">Redes sociais</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700">Modalidade</label>
                      <select
                        value={newsModalidade}
                        onChange={(e) => setNewsModalidade(e.target.value as NewsModalidade)}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none"
                      >
                        <option value="campo">Campo</option>
                        <option value="futsal">Futsal</option>
                        <option value="fut7">FUT7</option>
                      </select>
                    </div>
                  </div>

                  {newsCategory === 'social' && (
                    <Input
                      label="Link da publicação (Instagram / Facebook / TikTok)"
                      placeholder="https://instagram.com/p/..."
                      value={newsLinkExterno}
                      onChange={(e) => setNewsLinkExterno(e.target.value)}
                    />
                  )}

                  <Input
                    label="URL da Imagem"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={newsImage}
                    onChange={(e) => setNewsImage(e.target.value)}
                  />

                  {/* Preview da imagem (suporta Imgur heurístico) */}
                  {newsImage && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Pré-visualização da imagem:</p>
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                        <img
                          src={guessImgurDirect(newsImage)}
                          alt="pré-visualização"
                          className="w-full h-full object-contain"
                          onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/300?text=Sem+Imagem'; }}
                        />
                      </div>
                    </div>
                  )}

                  <Input
                    label="URL do Vídeo"
                    placeholder="https://youtube.com/..."
                    value={newsVideo}
                    onChange={(e) => setNewsVideo(e.target.value)}
                  />

                  {/* Preview do vídeo (YouTube embed se possível) */}
                  {newsVideo && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Pré-visualização do vídeo:</p>
                      {getYouTubeEmbed(newsVideo) ? (
                        <div className="w-full h-56">
                          <iframe
                            className="w-full h-full"
                            src={getYouTubeEmbed(newsVideo) as string}
                            title="YouTube preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">URL de vídeo não reconhecida como YouTube.</div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Conteúdo</label>
                    <textarea
                      placeholder="Digite o conteúdo completo da notícia..."
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none min-h-40 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handlePostNews}
                      size="lg"
                      className="flex-1"
                    >
                      {editingNews ? '💾 Atualizar' : '📤 Publicar'}
                    </Button>
                    {editingNews && (
                      <Button
                        onClick={() => {
                          setEditingNews(null);
                          setNewsTitle('');
                          setNewsContent('');
                          setNewsImage('');
                          setNewsVideo('');
                          setNewsLinkExterno('');
                        }}
                        variant="secondary"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Recent News */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Notícias ({newsList.length})</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {newsList.map((news) => (
                    <Card key={news.id} className="hover:shadow-lg">
                      <div className="mb-2">
                        <p className="font-semibold text-gray-800 mb-1">{news.titulo}</p>
                        <p className="text-xs text-gray-500">{news.data_criacao}</p>
                      </div>
                      {/* If image present show thumbnail */}
                      {news.imagem_url && (
                        <div className="w-full h-36 mb-3 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                          <img src={guessImgurDirect(news.imagem_url)} alt={news.titulo} className="w-full h-full object-contain" onError={(e: any)=>{e.currentTarget.src='https://via.placeholder.com/300?text=Sem+Imagem'}} />
                        </div>
                      )}
                      {/* If video present and youtube, embed small preview */}
                      {news.video_url && getYouTubeEmbed(news.video_url) && (
                        <div className="w-full h-40 mb-3">
                          <iframe className="w-full h-full" src={getYouTubeEmbed(news.video_url) as string} title="video-preview" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEditNews(news)} className="flex-1">
                          ✏️ Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteNews(news.id)} className="flex-1">
                          🗑️ Deletar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Players Tab */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">⚽ Adicionar Novo Jogador</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    label="Nome do Jogador" 
                    placeholder="João Silva"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                  <Input 
                    label="Número da Camisa" 
                    type="number" 
                    placeholder="7"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                  />
                  <Input 
                    label="Posição" 
                    placeholder="Atacante"
                    value={playerPosition}
                    onChange={(e) => setPlayerPosition(e.target.value)}
                  />
                  <Input 
                    label="Idade" 
                    type="number" 
                    placeholder="25"
                    value={playerAge}
                    onChange={(e) => setPlayerAge(e.target.value)}
                  />
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Onde joga? (marque um ou mais)</p>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={playerJogaCampo}
                        onChange={(e) => setPlayerJogaCampo(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="font-medium text-gray-800">Campo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={playerJogaFut7}
                        onChange={(e) => setPlayerJogaFut7(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="font-medium text-gray-800">FUT 7</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={playerJogaFutsal}
                        onChange={(e) => setPlayerJogaFutsal(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="font-medium text-gray-800">Futsal</span>
                    </label>
                  </div>
                </div>

                <Button size="lg" className="w-full mt-6" onClick={handleAddPlayer}>
                  ➕ Adicionar Jogador
                </Button>
              </Card>

              {/* Players List */}
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Jogadores ({playersList.length})</h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Nome</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Posição</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Onde joga</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Idade</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Gols</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playersList.map((player) => {
                        const jogaCampo = player.joga_campo !== false;
                        const jogaFut7 = !!player.joga_fut7;
                        const jogaFutsal = !!player.joga_futsal;
                        const isEditing = editingPlayerModalidades === player.id;
                        return (
                        <tr key={player.id} className="border-b border-gray-200 hover:bg-red-50">
                          <td className="py-3 px-4 font-bold text-red-600">{player.numero}</td>
                          <td className="py-3 px-4 text-gray-800">{player.nome}</td>
                          <td className="py-3 px-4 text-gray-600">{player.posicao}</td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <div className="flex flex-wrap gap-3 items-center">
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input type="checkbox" checked={editModalidadesCampo} onChange={(e) => setEditModalidadesCampo(e.target.checked)} className="rounded" />
                                  Campo
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input type="checkbox" checked={editModalidadesFut7} onChange={(e) => setEditModalidadesFut7(e.target.checked)} className="rounded" />
                                  FUT7
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input type="checkbox" checked={editModalidadesFutsal} onChange={(e) => setEditModalidadesFutsal(e.target.checked)} className="rounded" />
                                  Futsal
                                </label>
                                <Button size="sm" onClick={handleSavePlayerModalidades}>Salvar</Button>
                                <button type="button" onClick={() => setEditingPlayerModalidades(null)} className="text-gray-500 text-sm hover:underline">Cancelar</button>
                              </div>
                            ) : (
                              <span className="flex flex-wrap gap-1">
                                {jogaCampo && <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">Campo</span>}
                                {jogaFut7 && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">FUT 7</span>}
                                {jogaFutsal && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs">Futsal</span>}
                                {!jogaCampo && !jogaFut7 && !jogaFutsal && <span className="text-gray-400 text-xs">—</span>}
                                <button type="button" onClick={() => openEditModalidades(player)} className="text-orange-600 text-xs hover:underline">Editar</button>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{player.idade} anos</td>
                          <td className="py-3 px-4">
                            <input 
                              type="number" 
                              value={player.gols}
                              onChange={(e) => handleUpdatePlayerGoals(player.id, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button size="sm" variant="danger" onClick={() => handleDeletePlayer(player.id)}>
                              🗑️ Deletar
                            </Button>
                          </td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Lineup Tab */}
          {activeTab === 'lineup' && (
            <div className="space-y-6">
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">🏆 Gerenciar Escalação</h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Formação</label>
                    <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600">
                      <option>4-3-3</option>
                      <option>4-2-3-1</option>
                      <option>3-5-2</option>
                      <option>5-3-2</option>
                    </select>
                  </div>
                  <Button size="lg">💾 Salvar Escalação</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Titulares */}
                  <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
                    <h3 className="text-xl font-bold mb-4 text-green-800">11 TITULARES</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {playersList.slice(0, 11).map((player) => (
                        <div key={player.id} className="flex justify-between items-center bg-white p-3 rounded border border-green-200">
                          <span className="font-semibold">{player.numero} - {player.nome}</span>
                          <input 
                            type="number" 
                            placeholder="Gols"
                            defaultValue={0}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reservas */}
                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
                    <h3 className="text-xl font-bold mb-4 text-blue-800">~20 RESERVAS</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {playersList.slice(11).map((player) => (
                        <div key={player.id} className="flex justify-between items-center bg-white p-3 rounded border border-blue-200">
                          <span className="font-semibold">{player.numero} - {player.nome}</span>
                          <input 
                            type="number" 
                            placeholder="Gols"
                            defaultValue={0}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      ))}
                      {playersList.length < 31 && (
                        <p className="text-center text-gray-500 py-4">Adicione mais jogadores</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <div className="space-y-6">
              {/* Add Product Form */}
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  {editingProduct ? '✏️ Editar Produto' : '🛍️ Adicionar Novo Produto'}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input 
                    label="Nome do Produto" 
                    placeholder="Ex: Camiseta Oficial"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                  <Input 
                    label="Categoria" 
                    placeholder="Ex: Camiseta, Acessório"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  />
                  <Input 
                    label="Preço (R$)" 
                    type="number" 
                    step="0.01"
                    placeholder="89.90"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                  <Input 
                    label="Estoque" 
                    type="number" 
                    placeholder="50"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                  />
                </div>

                {/* Multiple Images input */}
                <div className="mt-4">
                  <label className="text-sm font-semibold text-gray-700">Imagens do Produto</label>
                  <div className="flex gap-2 mt-2">
                    <input
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (newImageUrl.trim()) {
                          setProductImages([...productImages, newImageUrl.trim()]);
                          setNewImageUrl('');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >Adicionar</button>
                  </div>

                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {productImages.length === 0 && productImage && (
                      <div className="w-36 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        <img src={guessImgurDirect(productImage)} alt="preview" className="w-full h-full object-contain" onError={(e: any)=>{e.currentTarget.src='https://via.placeholder.com/150?text=Sem+Imagem'}} />
                      </div>
                    )}
                    {productImages.map((img, idx) => (
                      <div key={idx} className="w-36 h-24 bg-gray-100 rounded overflow-hidden relative">
                        <img src={guessImgurDirect(img)} alt={`img-${idx}`} className="w-full h-full object-contain" onError={(e: any)=>{e.currentTarget.src='https://via.placeholder.com/150?text=Sem+Imagem'}} />
                        <button onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white rounded-full px-2 py-1 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Models / Variants input */}
                <div className="mt-4">
                  <label className="text-sm font-semibold text-gray-700">Modelos / Variantes</label>
                  <div className="flex gap-2 mt-2">
                    <input
                      placeholder="Ex: P, M, G ou Modelo A"
                      value={newModelInput}
                      onChange={(e) => setNewModelInput(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (newModelInput.trim()) {
                          setProductModels([...productModels, newModelInput.trim()]);
                          setNewModelInput('');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >Adicionar</button>
                  </div>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    {productModels.map((m, idx) => (
                      <div key={idx} className="bg-gray-100 px-3 py-1 rounded flex items-center gap-2">
                        <span className="text-sm">{m}</span>
                        <button onClick={() => setProductModels(productModels.filter((_, i) => i !== idx))} className="text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Destaque na página inicial */}
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={productDestaque}
                    onChange={(e) => setProductDestaque(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <label className="text-sm font-semibold text-gray-700">Destaque na página inicial (um dos 4 da loja)</label>
                </div>

                {/* Desconto para Sócios */}
                <div className="mt-4 bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <input 
                      type="checkbox" 
                      checked={temDescontoSocio}
                      onChange={(e) => setTemDescontoSocio(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <label className="text-sm font-semibold text-gray-700">⭐ Desconto Exclusivo para Sócios</label>
                  </div>
                  {temDescontoSocio && (
                    <Input 
                      label="Desconto (%)" 
                      type="number" 
                      placeholder="Ex: 10 (para 10%)"
                      value={descontoSocio}
                      onChange={(e) => setDescontoSocio(e.target.value)}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-sm font-semibold text-gray-700">Descrição</label>
                  <textarea
                    placeholder="Digite a descrição do produto..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none min-h-28 resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleAddProduct}
                    size="lg"
                    className="flex-1"
                  >
                    {editingProduct ? '💾 Atualizar' : '➕ Adicionar'}
                  </Button>
                  {editingProduct && (
                    <Button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductName('');
                        setProductDescription('');
                        setProductPrice('');
                        setProductImage('');
                        setProductStock('');
                        setProductCategory('camiseta');
                        setProductDestaque(false);
                      }}
                      variant="secondary"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>

              {/* Products Grid */}
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Produtos da Loja ({productsList.length})</h2>

                {productsList.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Nenhum produto adicionado ainda 📦</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsList.map((product) => (
                      <div key={product.id} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                        {/* Product Image */}
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img 
                            src={product.imagem_url || (product.imagens && product.imagens[0])}
                            alt={product.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/200?text=Sem+Imagem';
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800">{product.nome}</h3>
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                              {product.categoria}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.descricao}</p>

                          {product.modelos && product.modelos.length > 0 && (
                            <div className="mb-3 flex gap-2 flex-wrap">
                              {product.modelos.map((m: string, i: number) => (
                                <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{m}</span>
                              ))}
                            </div>
                          )}

                          {product.tem_desconto_socio && product.desconto_socio && (
                            <div className="mb-3 bg-orange-100 border-2 border-orange-300 px-3 py-2 rounded text-sm font-semibold text-orange-700">
                              ⭐ Sócios: {product.desconto_socio}% OFF
                            </div>
                          )}

                          <div className="flex justify-between items-center mb-4">
                            <div className="text-2xl font-bold text-red-600">
                              R$ {product.preco.toFixed(2)}
                            </div>
                            <div className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded font-semibold">
                              Estoque: {product.estoque}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => handleEditProduct(product)}
                              className="flex-1"
                            >
                              ✏️ Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger" 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex-1"
                            >
                              🗑️ Deletar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}        </div>
      </main>
    </>
  );
}