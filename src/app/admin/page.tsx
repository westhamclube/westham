'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  uploadNewsImage,
  uploadPlayerPhoto,
  uploadProductImage,
  uploadProjectImage,
  uploadHistoryPhoto,
  deleteOldFileIfOurs,
  deleteOldFilesIfOurs,
  NEWS_BUCKET,
  PLAYERS_BUCKET,
  PRODUCTS_BUCKET,
  PROJECTS_BUCKET,
  HISTORY_PHOTOS_BUCKET,
  isOurStorageUrl,
} from '@/lib/storage';
import { ImageUpload } from '@/components/ImageUpload';
import { LineupField, getFormationsForModalidade } from '@/components/LineupField';
import { ConfirmModal } from '@/components/ConfirmModal';
import type { News, Product, ProductVariation, User, NewsModalidade } from '@/types';

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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'news' | 'players' | 'lineup' | 'ranks' | 'shop' | 'projects' | 'suporte' | 'historia' | 'jogos'>('ranks');
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
  const [newsDestaque, setNewsDestaque] = useState(false);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [editingNews, setEditingNews] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

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
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [editPlayerGols, setEditPlayerGols] = useState<number>(0);
  const [editPlayerCartoesA, setEditPlayerCartoesA] = useState<number>(0);
  const [editPlayerCartoesV, setEditPlayerCartoesV] = useState<number>(0);
  const [editPlayerFaltas, setEditPlayerFaltas] = useState<number>(0);
  const [editPlayerReserva, setEditPlayerReserva] = useState(false);
  const [editPlayerDestaqueCampo, setEditPlayerDestaqueCampo] = useState(false);
  const [editPlayerDestaqueFut7, setEditPlayerDestaqueFut7] = useState(false);
  const [editPlayerDestaqueFutsal, setEditPlayerDestaqueFutsal] = useState(false);
  const [editPlayerFotoUrl, setEditPlayerFotoUrl] = useState('');
  const [playersList, setPlayersList] = useState<any[]>([]);

  // Lineup states
  const [lineupModalidade, setLineupModalidade] = useState<'campo' | 'fut7' | 'futsal'>('campo');
  const [lineupFormacao, setLineupFormacao] = useState('4-3-3');
  const [formationTemplates, setFormationTemplates] = useState<{ nome: string; linhas?: number[] }[]>([]);
  const [lineupProximaPartida, setLineupProximaPartida] = useState('');
  const [lineupSaving, setLineupSaving] = useState(false);
  const [lineupSlotPlayers, setLineupSlotPlayers] = useState<Record<string, { id: string; nome: string; numero: number }>>({});
  const [lineupSlotLabels, setLineupSlotLabels] = useState<Record<string, string>>({});

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
  const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
  const [newVariationTipo, setNewVariationTipo] = useState('');
  const [newVariationOpcao, setNewVariationOpcao] = useState('');
  const [editingVariationIdx, setEditingVariationIdx] = useState<number | null>(null);
  const [productCategory, setProductCategory] = useState('camiseta');
  const [productStock, setProductStock] = useState('');
  const [temDescontoSocio, setTemDescontoSocio] = useState(false);
  const [descontoSocio, setDescontoSocio] = useState('');
  const [productDestaque, setProductDestaque] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportSubTab, setSupportSubTab] = useState<'suporte' | 'amistoso' | 'projetos'>('suporte');
  const [historyBlocks, setHistoryBlocks] = useState<any[]>([]);
  const [historyPhotos, setHistoryPhotos] = useState<any[]>([]);
  const [historyTitulo, setHistoryTitulo] = useState('');
  const [historyConteudo, setHistoryConteudo] = useState('');
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [newPhotoLegenda, setNewPhotoLegenda] = useState('');
  const historyPhotoInputRef = useRef<HTMLInputElement>(null);
  const [cashFlowModerators, setCashFlowModerators] = useState<{ id: string; user_id: string; user_nome?: string; user_email?: string }[]>([]);
  const [addModeratorUserId, setAddModeratorUserId] = useState('');
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [projectTitulo, setProjectTitulo] = useState('');
  const [projectDescricao, setProjectDescricao] = useState('');
  const [projectImagem, setProjectImagem] = useState('');
  const [projectVideo, setProjectVideo] = useState('');
  const [projectStatus, setProjectStatus] = useState('ativo');
  const [projectTipo, setProjectTipo] = useState('');
  const [projectDestaque, setProjectDestaque] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [matchData, setMatchData] = useState('');
  const [matchAdversario, setMatchAdversario] = useState('');
  const [matchLocal, setMatchLocal] = useState('');
  const [matchTipo, setMatchTipo] = useState<'amistoso' | 'campeonato'>('amistoso');
  const [matchModalidade, setMatchModalidade] = useState<'campo' | 'fut7' | 'futsal'>('campo');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);

  const [modalidadeStatsList, setModalidadeStatsList] = useState<Record<string, { ultimo_resultado: string; gols_total: number; vitorias: number; derrotas: number }>>({});

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }

    const loadInitialData = async () => {
      try {
        if (!user) return;

        setIsLoadingData(true);

        const [profilesRes, newsRes, playersRes, productsRes, supportRes, formationsRes, projectsRes] = await Promise.all([
          supabase.from('profiles').select('id, email, first_name, last_name, role'),
          supabase
            .from('news')
            .select('*')
            .order('destaque', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(30),
          supabase
            .from('players')
            .select('id, nome, numero, posicao, idade, gols, nivel, joga_campo, joga_fut7, joga_futsal, cartoes_amarelos, cartoes_vermelhos, faltas, reserva, destaque_campo, destaque_fut7, destaque_futsal, foto_url')
            .order('numero', { ascending: true }),
          supabase
            .from('store_products')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase.from('support_messages').select('*').order('created_at', { ascending: false }),
          supabase.from('formation_templates').select('nome, linhas').order('nome'),
          supabase.from('projects').select('*').order('destaque', { ascending: false }).order('created_at', { ascending: false }),
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
              variacoes: p.variacoes && Array.isArray(p.variacoes) ? p.variacoes : [],
              categoria: p.categoria,
              estoque: p.estoque,
              data_criacao: p.created_at,
              ativo: p.ativo,
              desconto_socio: p.desconto_socio ?? undefined,
              tem_desconto_socio: p.tem_desconto_socio ?? false,
            })),
          );
        }

        if (!supportRes.error && supportRes.data) setSupportMessages(supportRes.data);
        if (!formationsRes.error && formationsRes.data) setFormationTemplates(formationsRes.data);
        if (!projectsRes.error && projectsRes.data) setProjectsList(projectsRes.data);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user?.role === 'admin') {
      loadInitialData();
    }
  }, [user, loading, router]);

  const loadCashFlowModerators = async () => {
    const { data } = await supabase
      .from('cash_flow_moderators')
      .select('id, user_id')
      .order('created_at', { ascending: true });
    if (data) {
      const withNames = await Promise.all(
        data.map(async (m: any) => {
          const { data: p } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', m.user_id)
            .single();
          return {
            ...m,
            user_nome: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email : '',
            user_email: p?.email ?? '',
          };
        })
      );
      setCashFlowModerators(withNames);
    }
  };

  useEffect(() => {
    if (activeTab === 'ranks' && user) loadCashFlowModerators();
  }, [activeTab, user]);

  useEffect(() => {
    if ((activeTab !== 'jogos' && activeTab !== 'lineup') || !user) return;
    const load = async () => {
      const [matchesRes, statsRes] = await Promise.all([
        supabase.from('matches').select('*').order('data', { ascending: true }),
        supabase.from('modalidade_stats').select('*'),
      ]);
      if (!matchesRes.error && matchesRes.data) setMatchesList(matchesRes.data);
      if (!statsRes.error && statsRes.data) {
        const map: Record<string, any> = {};
        statsRes.data.forEach((s: any) => {
          map[s.modalidade] = {
            ultimo_resultado: s.ultimo_resultado || '',
            gols_total: s.gols_total ?? 0,
            vitorias: s.vitorias ?? 0,
            derrotas: s.derrotas ?? 0,
          };
        });
        setModalidadeStatsList(map);
      }
    };
    load();
  }, [activeTab, user]);

  // Abrir aba Notícias e carregar para edição quando vem de /dashboard/noticias (Editar)
  useEffect(() => {
    const tab = searchParams.get('tab');
    const editId = searchParams.get('edit');
    if (!isLoadingData && tab === 'news' && editId && newsList.length > 0) {
      setActiveTab('news');
      const newsToEdit = newsList.find((n) => n.id === editId);
      if (newsToEdit) {
        setEditingNews(newsToEdit.id);
        setNewsTitle(newsToEdit.titulo);
        setNewsContent(newsToEdit.conteudo);
        setNewsCategory((newsToEdit.categoria || 'general') as News['categoria']);
        setNewsModalidade((newsToEdit.modalidade || 'campo') as NewsModalidade);
        setNewsImage(newsToEdit.imagem_url || '');
        setNewsVideo(newsToEdit.video_url || '');
        setNewsLinkExterno(newsToEdit.link_externo || '');
      }
      router.replace('/admin');
    }
  }, [isLoadingData, searchParams, newsList, router]);

  useEffect(() => {
    if (activeTab === 'lineup' && matchesList.length > 0 && !lineupProximaPartida) {
      const next = matchesList
        .filter((m: any) => (m.modalidade || 'campo') === lineupModalidade && new Date(m.data) >= new Date())
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];
      if (next?.data) setLineupProximaPartida(new Date(next.data).toISOString().slice(0, 10));
    }
  }, [activeTab, matchesList, lineupModalidade, lineupProximaPartida]);

  useEffect(() => {
    if (activeTab !== 'lineup' || !user) return;
    const load = async () => {
      const { data } = await supabase
        .from('lineups')
        .select('id, formacao, proxima_partida, lineup_players(posicao, player_id, numero_camisa, posicao_label)')
        .eq('modalidade', lineupModalidade)
        .order('proxima_partida', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.lineup_players && Array.isArray(data.lineup_players) && playersList.length > 0) {
        const lp = data.lineup_players as any[];
        const map: Record<string, { id: string; nome: string; numero: number }> = {};
        const labelsMap: Record<string, string> = {};
        lp.forEach((row: any) => {
          const pid = row.player_id;
          const pos = row.posicao;
          if (pos && pid && /^slot_\d+$/.test(pos)) {
            const p = playersList.find((x: any) => x.id === pid);
            map[pos] = {
              id: pid,
              nome: p?.nome ?? 'Jogador',
              numero: row.numero_camisa ?? p?.numero ?? 0,
            };
            if (row.posicao_label) labelsMap[pos] = row.posicao_label;
          }
        });
        setLineupSlotPlayers(map);
        setLineupSlotLabels(labelsMap);
        if (data.formacao) setLineupFormacao(data.formacao);
        if (data.proxima_partida) setLineupProximaPartida(new Date(data.proxima_partida).toISOString().slice(0, 10));
      } else {
        setLineupSlotPlayers({});
        setLineupSlotLabels({});
      }
    };
    load();
  }, [activeTab, user, lineupModalidade, playersList.length]);

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
      destaque: newsDestaque,
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
                destaque: payload.destaque as boolean,
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
    setNewsDestaque(false);
  };

  const handleDeleteNews = (id: string) => {
    setConfirmModal({
      title: 'Excluir notícia',
      message: 'Deseja deletar esta notícia?',
      onConfirm: async () => {
        const news = newsList.find((n) => n.id === id);
        if (news?.imagem_url) await deleteOldFileIfOurs(news.imagem_url, NEWS_BUCKET);
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) {
          showFeedback('error', `Erro ao deletar notícia: ${error.message}`);
          return;
        }
        setNewsList((prev) => prev.filter((n) => n.id !== id));
        showFeedback('success', 'Notícia deletada!');
      },
    });
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
    setNewsDestaque(!!news.destaque);
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

  const handleDeletePlayer = (id: string) => {
    setConfirmModal({
      title: 'Excluir jogador',
      message: 'Deseja deletar este jogador?',
      onConfirm: async () => {
        const p = playersList.find((x) => x.id === id);
        if (p?.foto_url) await deleteOldFileIfOurs(p.foto_url, PLAYERS_BUCKET);
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (error) {
          showFeedback('error', `Erro ao deletar jogador: ${error.message}`);
          return;
        }
        setPlayersList((prev) => prev.filter((p) => p.id !== id));
        setEditingPlayer(null);
        showFeedback('success', 'Jogador deletado!');
      },
    });
  };

  const handleUpdatePlayerGoals = async (id: string, goals: number) => {
    setPlayersList((prev) => prev.map((p) => (p.id === id ? { ...p, gols: goals } : p)));
    await supabase.from('players').update({ gols: goals }).eq('id', id);
  };

  const handleSavePlayerFull = async () => {
    const p = editingPlayer;
    if (!p) return handleAddPlayer();
    const payload = {
      nome: playerName.trim(),
      numero: parseInt(playerNumber, 10),
      posicao: playerPosition.trim(),
      idade: playerAge ? parseInt(playerAge, 10) : null,
      gols: editPlayerGols ?? p.gols ?? 0,
      cartoes_amarelos: editPlayerCartoesA ?? p.cartoes_amarelos ?? 0,
      cartoes_vermelhos: editPlayerCartoesV ?? p.cartoes_vermelhos ?? 0,
      faltas: editPlayerFaltas ?? p.faltas ?? 0,
      reserva: editPlayerReserva ?? !!p.reserva,
      joga_campo: playerJogaCampo,
      joga_fut7: playerJogaFut7,
      joga_futsal: playerJogaFutsal,
      destaque_campo: editPlayerDestaqueCampo,
      destaque_fut7: editPlayerDestaqueFut7,
      destaque_futsal: editPlayerDestaqueFutsal,
      foto_url: editPlayerFotoUrl.trim() || null,
    };
    const { error } = await supabase.from('players').update(payload).eq('id', p.id);
    if (error) {
      showFeedback('error', error.message);
      return;
    }
    setPlayersList((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...payload } : x)));
    setEditingPlayer(null);
    clearPlayerForm();
    showFeedback('success', 'Jogador atualizado!');
  };

  const handleUpdatePlayerField = async (id: string, field: string, value: number | boolean) => {
    const { error } = await supabase.from('players').update({ [field]: value }).eq('id', id);
    if (error) showFeedback('error', error.message);
    else setPlayersList((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSaveLineup = async () => {
    const nTitulares = lineupModalidade === 'futsal' ? 5 : lineupModalidade === 'fut7' ? 7 : 11;
    const slots = ['slot_0', 'slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6', 'slot_7', 'slot_8', 'slot_9', 'slot_10'].slice(0, nTitulares);
    const filled = slots.filter((s) => lineupSlotPlayers[s]?.id);
    if (filled.length < nTitulares) {
      showFeedback('error', `Selecione os ${nTitulares} jogadores titulares no desenho do campo.`);
      return;
    }
    const dataPartida = lineupProximaPartida || new Date().toISOString().slice(0, 10);
    setLineupSaving(true);
    try {
      const { data: existing } = await supabase
        .from('lineups')
        .select('id')
        .eq('modalidade', lineupModalidade)
        .order('proxima_partida', { ascending: false })
        .limit(1)
        .maybeSingle();
      let escalacaoId: string;
      if (existing?.id) {
        const { error: errUpd } = await supabase
          .from('lineups')
          .update({
            proxima_partida: dataPartida,
            formacao: lineupFormacao,
            descricao: `Escalação ${lineupModalidade} - ${lineupFormacao}`,
          })
          .eq('id', existing.id);
        if (errUpd) {
          showFeedback('error', `Erro ao atualizar escalação: ${errUpd.message}`);
          return;
        }
        escalacaoId = existing.id;
        await supabase.from('lineup_players').delete().eq('escalacao_id', escalacaoId);
      } else {
        const { data: lineupRow, error: errLineup } = await supabase
          .from('lineups')
          .insert({
            proxima_partida: dataPartida,
            formacao: lineupFormacao,
            descricao: `Escalação ${lineupModalidade} - ${lineupFormacao}`,
            modalidade: lineupModalidade,
          })
          .select('id')
          .single();
        if (errLineup) {
          showFeedback('error', `Erro ao salvar escalação: ${errLineup.message}`);
          return;
        }
        escalacaoId = lineupRow.id;
      }
      const rows = slots.map((posicao) => {
        const p = lineupSlotPlayers[posicao];
        const label = lineupSlotLabels[posicao]?.trim();
        return {
          escalacao_id: escalacaoId,
          player_id: p.id,
          posicao,
          numero_camisa: p.numero,
          titular: true,
          posicao_label: label || null,
        };
      });
      const { error: errLp } = await supabase.from('lineup_players').insert(rows);
      if (errLp) {
        showFeedback('error', `Erro ao salvar jogadores: ${errLp.message}`);
        return;
      }
      showFeedback('success', 'Escalação salva! A página de jogos será atualizada.');
    } finally {
      setLineupSaving(false);
    }
  };

  const handleLineupLabelChange = (slotId: string, label: string) => {
    setLineupSlotLabels((prev) => ({ ...prev, [slotId]: label }));
  };

  const handleLineupSlotChange = (slotId: string, playerId: string | null) => {
    if (!playerId) {
      setLineupSlotPlayers((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
      return;
    }
    const p = playersList.find((x: any) => x.id === playerId);
    if (p) {
      setLineupSlotPlayers((prev) => ({
        ...prev,
        [slotId]: {
          id: p.id,
          nome: p.nome || 'Jogador',
          numero: p.numero ?? p.numero_camisa ?? 0,
        },
      }));
    }
  };

  const clearPlayerForm = () => {
    setPlayerName('');
    setPlayerNumber('');
    setPlayerPosition('');
    setPlayerAge('');
    setPlayerJogaCampo(true);
    setPlayerJogaFut7(false);
    setPlayerJogaFutsal(false);
    setEditPlayerGols(0);
    setEditPlayerCartoesA(0);
    setEditPlayerCartoesV(0);
    setEditPlayerFaltas(0);
    setEditPlayerReserva(false);
    setEditPlayerDestaqueCampo(false);
    setEditPlayerDestaqueFut7(false);
    setEditPlayerDestaqueFutsal(false);
    setEditPlayerFotoUrl('');
  };

  const openEditPlayer = (player: any) => {
    setEditingPlayer(player);
    setPlayerName(player.nome || '');
    setPlayerNumber(String(player.numero || ''));
    setPlayerPosition(player.posicao || '');
    setPlayerAge(player.idade != null ? String(player.idade) : '');
    setPlayerJogaCampo(player.joga_campo !== false);
    setPlayerJogaFut7(!!player.joga_fut7);
    setPlayerJogaFutsal(!!player.joga_futsal);
    setEditPlayerGols(player.gols ?? 0);
    setEditPlayerCartoesA(player.cartoes_amarelos ?? 0);
    setEditPlayerCartoesV(player.cartoes_vermelhos ?? 0);
    setEditPlayerFaltas(player.faltas ?? 0);
    setEditPlayerReserva(!!player.reserva);
    setEditPlayerDestaqueCampo(!!player.destaque_campo);
    setEditPlayerDestaqueFut7(!!player.destaque_fut7);
    setEditPlayerDestaqueFutsal(!!player.destaque_futsal);
    setEditPlayerFotoUrl(player.foto_url || '');
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
        variacoes: productVariations.length > 0 ? productVariations : [],
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
          variacoes: data.variacoes && Array.isArray(data.variacoes) ? data.variacoes : [],
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
      setProductVariations([]);
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

  const handleDeleteProduct = (id: string) => {
    setConfirmModal({
      title: 'Excluir produto',
      message: 'Deseja deletar este produto?',
      onConfirm: async () => {
        const prod = productsList.find((p) => p.id === id);
        const urls = [...(prod?.imagens || []), prod?.imagem_url].filter(Boolean);
        await deleteOldFilesIfOurs(urls, PRODUCTS_BUCKET);
        const { error } = await supabase.from('store_products').delete().eq('id', id);
        if (error) {
          showFeedback('error', `Erro ao deletar produto: ${error.message}`);
          return;
        }
        setProductsList((prev) => prev.filter((p) => p.id !== id));
        showFeedback('success', 'Produto deletado!');
      },
    });
  };

  const addVariationOption = () => {
    if (!newVariationTipo.trim()) return;
    const existingIdx = productVariations.findIndex((v) => v.tipo.toLowerCase() === newVariationTipo.trim().toLowerCase());
    if (newVariationOpcao.trim()) {
      if (existingIdx >= 0) {
        const copy = [...productVariations];
        if (!copy[existingIdx].opcoes.includes(newVariationOpcao.trim())) {
          copy[existingIdx] = { ...copy[existingIdx], opcoes: [...copy[existingIdx].opcoes, newVariationOpcao.trim()] };
          setProductVariations(copy);
        }
      } else {
        setProductVariations([...productVariations, { tipo: newVariationTipo.trim(), opcoes: [newVariationOpcao.trim()] }]);
      }
      setNewVariationTipo('');
      setNewVariationOpcao('');
    } else {
      if (existingIdx < 0) {
        setProductVariations([...productVariations, { tipo: newVariationTipo.trim(), opcoes: [] }]);
        setNewVariationTipo('');
      }
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id);
    setProductName(product.nome);
    setProductDescription(product.descricao);
    setProductPrice(product.preco.toString());
    setProductImage(product.imagem_url || '');
    setProductImages(product.imagens || (product.imagem_url ? [product.imagem_url] : []));
    setProductModels(product.modelos || []);
    setProductVariations(product.variacoes && Array.isArray(product.variacoes) ? product.variacoes : []);
    setProductCategory(product.categoria);
    setProductStock(product.estoque?.toString() || '');
    setTemDescontoSocio(product.tem_desconto_socio || false);
    setDescontoSocio(product.desconto_socio?.toString() || '');
    setProductDestaque(!!(product as any).destaque);
  };

  const handleAddProject = async () => {
    if (!projectTitulo.trim()) {
      showFeedback('error', 'Preencha o título do projeto.');
      return;
    }
    const payload = {
      titulo: projectTitulo.trim(),
      descricao: projectDescricao.trim() || null,
      imagem_capa_url: projectImagem.trim() || null,
      video_url: projectVideo.trim() || null,
      status: projectStatus,
      tipo: projectTipo.trim() || null,
      destaque: projectDestaque,
    };
    if (editingProject) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editingProject);
      if (error) { showFeedback('error', error.message); return; }
      setProjectsList((prev) => prev.map((p) => (p.id === editingProject ? { ...p, ...payload } : p)));
      showFeedback('success', 'Projeto atualizado!');
    } else {
      const { data, error } = await supabase.from('projects').insert(payload).select('*').single();
      if (error) { showFeedback('error', error.message); return; }
      setProjectsList((prev) => [data, ...prev]);
      showFeedback('success', 'Projeto adicionado!');
    }
    setEditingProject(null);
    setProjectTitulo('');
    setProjectDescricao('');
    setProjectImagem('');
    setProjectVideo('');
    setProjectStatus('ativo');
    setProjectTipo('');
    setProjectDestaque(false);
  };

  const handleEditProject = (p: any) => {
    setEditingProject(p.id);
    setProjectTitulo(p.titulo || '');
    setProjectDescricao(p.descricao || '');
    setProjectImagem(p.imagem_capa_url || '');
    setProjectVideo(p.video_url || '');
    setProjectStatus(p.status || 'ativo');
    setProjectTipo(p.tipo || '');
    setProjectDestaque(!!p.destaque);
  };

  const handleDeleteProject = (id: string) => {
    setConfirmModal({
      title: 'Excluir projeto',
      message: 'Excluir este projeto?',
      onConfirm: async () => {
        const proj = projectsList.find((p) => p.id === id);
        if (proj?.imagem_capa_url) await deleteOldFileIfOurs(proj.imagem_capa_url, PROJECTS_BUCKET);
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) { showFeedback('error', error.message); return; }
        setProjectsList((prev) => prev.filter((p) => p.id !== id));
        setEditingProject(null);
        showFeedback('success', 'Projeto excluído!');
      },
    });
  };

  const handleAddMatch = async () => {
    if (!matchData.trim() || !matchAdversario.trim() || !matchLocal.trim()) {
      showFeedback('error', 'Preencha data, adversário e local.');
      return;
    }
    const dataISO = new Date(matchData).toISOString();
    const payload = { data: dataISO, adversario: matchAdversario.trim(), local: matchLocal.trim(), tipo: matchTipo, modalidade: matchModalidade };
    if (editingMatch) {
      const { error } = await supabase.from('matches').update(payload).eq('id', editingMatch);
      if (error) { showFeedback('error', error.message); return; }
      setMatchesList((prev) => prev.map((m) => (m.id === editingMatch ? { ...m, ...payload } : m)));
      showFeedback('success', 'Partida atualizada!');
      setEditingMatch(null);
    } else {
      const { data, error } = await supabase.from('matches').insert(payload).select('*').single();
      if (error) { showFeedback('error', error.message); return; }
      setMatchesList((prev) => [...prev, data].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()));
      showFeedback('success', 'Partida cadastrada!');
    }
    setMatchData('');
    setMatchAdversario('');
    setMatchLocal('');
    setMatchTipo('amistoso');
    setMatchModalidade('campo');
  };

  const handleEditMatch = (m: any) => {
    setEditingMatch(m.id);
    setMatchData(m.data ? new Date(m.data).toISOString().slice(0, 16) : '');
    setMatchAdversario(m.adversario || '');
    setMatchLocal(m.local || '');
    setMatchTipo(m.tipo === 'campeonato' ? 'campeonato' : 'amistoso');
    setMatchModalidade(m.modalidade === 'fut7' ? 'fut7' : m.modalidade === 'futsal' ? 'futsal' : 'campo');
  };

  const handleDeleteMatch = (id: string) => {
    setConfirmModal({
      title: 'Excluir partida',
      message: 'Excluir esta partida?',
      onConfirm: async () => {
        const { error } = await supabase.from('matches').delete().eq('id', id);
        if (error) { showFeedback('error', error.message); return; }
        setMatchesList((prev) => prev.filter((m) => m.id !== id));
        if (editingMatch === id) setEditingMatch(null);
        showFeedback('success', 'Partida excluída!');
      },
    });
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
              { id: 'ranks', label: 'Usuários', icon: '✅' },
              { id: 'suporte', label: 'Mensagens', icon: '📩' },
              { id: 'news', label: 'Notícias', icon: '📰' },
              { id: 'players', label: 'Jogadores', icon: '⚽' },
              { id: 'lineup', label: 'Escalação', icon: '🏆' },
              { id: 'shop', label: 'Loja', icon: '🛍️' },
              { id: 'projects', label: 'Projetos', icon: '📁' },
              { id: 'jogos', label: 'Próximos Jogos', icon: '📅' },
              { id: 'historia', label: 'História', icon: '📜' },
              { id: 'caixa', label: 'Caixa', icon: '💰', href: '/caixa' },
            ].map((tab) =>
              'href' in tab && tab.href ? (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="px-6 py-3 rounded-lg font-semibold transition bg-neutral-900 text-neutral-100 hover:shadow-md border border-neutral-700 hover:border-orange-500/60"
                >
                  {tab.label}
                </Link>
              ) : (
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
              )
            )}
          </div>

          {/* Usuários Tab */}
          {activeTab === 'ranks' && (
            <Card className="shadow-2xl bg-white border-2 border-neutral-200">
              <h2 className="text-2xl font-bold mb-2 text-neutral-900">✅ Gerenciar Usuários e Sócios</h2>
              <p className="text-neutral-700 mb-6">
                • <strong>Usuários</strong>: Auto-aprovados ao se cadastrar (veem notícias, vitórias)<br/>
                • <strong>Sócios</strong>: Podem ser promovidos pelo admin (veem escalações VIP, conteúdo exclusivo)<br/>
                • <strong>Admin</strong>: Gerencia tudo
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-neutral-300 bg-neutral-50">
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">Nível Atual</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">Promover Para</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankRequests.map((user) => (
                      <tr key={user.id} className="border-b border-neutral-200 hover:bg-orange-50/50">
                        <td className="py-3 px-4 font-semibold text-neutral-900">{user.nome}</td>
                        <td className="py-3 px-4 text-neutral-700">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'sócio' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'usuário' ? '👤 Usuário' :
                             user.role === 'sócio' ? '⭐ Sócio' :
                             '👑 Admin'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            onChange={(e) => setPromoteRole({...promoteRole, [user.id]: e.target.value})}
                            className="px-3 py-2 border-2 border-neutral-300 rounded-lg focus:border-orange-500 bg-white text-neutral-900"
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

              <hr className="my-8 border-neutral-200" />
              <h3 className="text-xl font-bold mb-4 text-neutral-900">💰 Moderadores de Caixa</h3>
              <p className="text-neutral-700 mb-4 text-sm">
                Defina até 2 pessoas que terão acesso ao fluxo de caixa (além de você, admin).
              </p>
              <div className="flex flex-wrap gap-4 items-end mb-4">
                <div className="flex-1 min-w-[200px]">
                  <select
                    value={addModeratorUserId}
                    onChange={(e) => setAddModeratorUserId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg bg-white text-neutral-900"
                  >
                    <option value="">-- Selecione um usuário --</option>
                    {rankRequests
                      .filter((u) => u.id !== user?.id && !cashFlowModerators.some((m) => m.user_id === u.id))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>
                <Button
                  size="md"
                  onClick={async () => {
                    if (!addModeratorUserId || !user || cashFlowModerators.length >= 2) return;
                    const { error } = await supabase.from('cash_flow_moderators').insert({
                      user_id: addModeratorUserId,
                      added_by: user.id,
                    });
                    if (error) { showFeedback('error', error.message); return; }
                    showFeedback('success', 'Moderador adicionado!');
                    setAddModeratorUserId('');
                    loadCashFlowModerators();
                  }}
                  disabled={!addModeratorUserId || cashFlowModerators.length >= 2}
                >
                  Adicionar moderador
                </Button>
              </div>
              {cashFlowModerators.length >= 2 && (
                <p className="text-amber-700 font-semibold mb-4">Máximo de 2 moderadores. Remova um para adicionar outro.</p>
              )}
              <div className="space-y-2">
                {cashFlowModerators.length === 0 ? (
                  <p className="text-neutral-600 text-sm">Nenhum moderador de caixa ainda.</p>
                ) : (
                  cashFlowModerators.map((m) => (
                    <div key={m.id} className="flex items-center justify-between border border-neutral-200 rounded-lg p-3 bg-neutral-50">
                      <span className="font-semibold text-neutral-900">{m.user_nome || m.user_email || 'Usuário'}</span>
                      <Button size="sm" variant="danger" onClick={async () => {
                        await supabase.from('cash_flow_moderators').delete().eq('id', m.id);
                        setCashFlowModerators((prev) => prev.filter((x) => x.id !== m.id));
                        showFeedback('success', 'Moderador removido.');
                      }}>Remover</Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* Mensagens */}
          {activeTab === 'suporte' && (
            <Card className="shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Mensagens: Suporte / Amistoso / Projetos</h2>
              <p className="text-gray-600 mb-6">
                Separadas por categoria: defeitos/suporte, solicitações de amistoso e inscrições em projetos.
              </p>
              <div className="flex gap-4 mb-6 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSupportSubTab('suporte')}
                  className={`px-4 py-2 rounded-lg font-semibold ${supportSubTab === 'suporte' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  📩 Suporte
                </button>
                <button
                  type="button"
                  onClick={() => setSupportSubTab('amistoso')}
                  className={`px-4 py-2 rounded-lg font-semibold ${supportSubTab === 'amistoso' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  ⚽ Marcar Amistoso
                </button>
                <button
                  type="button"
                  onClick={() => setSupportSubTab('projetos')}
                  className={`px-4 py-2 rounded-lg font-semibold ${supportSubTab === 'projetos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  📁 Projetos
                </button>
              </div>
              {(() => {
                const isAmistoso = (m: any) => m.tipo === 'amistoso' || (m.mensagem || '').includes('FORMULÁRIO: Marcar amistoso');
                const isProjetos = (m: any) => m.tipo === 'projetos' || (m.mensagem || '').includes('FORMULÁRIO: Inscrição em projeto');
                const msgs = supportSubTab === 'amistoso'
                  ? supportMessages.filter((m: any) => isAmistoso(m))
                  : supportSubTab === 'projetos'
                    ? supportMessages.filter((m: any) => isProjetos(m))
                    : supportMessages.filter((m: any) => !isAmistoso(m) && !isProjetos(m));
                return (
                  <div className="overflow-x-auto">
                    {msgs.length === 0 ? (
                      <p className="text-gray-500 py-6">
                        {supportSubTab === 'amistoso' ? 'Nenhuma solicitação de amistoso ainda.' : supportSubTab === 'projetos' ? 'Nenhuma inscrição em projeto ainda.' : 'Nenhuma mensagem de suporte ainda.'}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {msgs.map((m: any) => (
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
                                    setSupportMessages((prev) => prev.map((x: any) => (x.id === m.id ? { ...x, lido: true } : x)));
                                  }}
                                >
                                  Marcar lido
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setConfirmModal({
                                    title: 'Excluir mensagem',
                                    message: 'Excluir esta mensagem?',
                                    onConfirm: async () => {
                                      const { error } = await supabase.from('support_messages').delete().eq('id', m.id);
                                      if (error) showFeedback('error', error.message);
                                      else {
                                        setSupportMessages((prev) => prev.filter((x: any) => x.id !== m.id));
                                        showFeedback('success', 'Mensagem excluída.');
                                      }
                                    },
                                  });
                                }}
                              >
                                Excluir
                              </Button>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{m.mensagem}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </Card>
          )}

          {/* Projetos Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingProject ? '✏️ Editar Projeto' : '📁 Adicionar Projeto'}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Título" value={projectTitulo} onChange={(e) => setProjectTitulo(e.target.value)} placeholder="Ex: Escolinha Infantil" />
                  <Input label="Tipo" value={projectTipo} onChange={(e) => setProjectTipo(e.target.value)} placeholder="Ex: escolinha, peneira, ação social" />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
                    <textarea value={projectDescricao} onChange={(e) => setProjectDescricao(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg min-h-[100px]" placeholder="Descreva o projeto..." />
                  </div>
                  <ImageUpload
                    label="Imagem de capa"
                    currentUrl={projectImagem}
                    onUpload={async (file) => {
                      const url = await uploadProjectImage(file, editingProject, projectImagem);
                      setProjectImagem(url);
                      return url;
                    }}
                  />
                  <Input label="URL do vídeo (opcional)" value={projectVideo} onChange={(e) => setProjectVideo(e.target.value)} placeholder="https://youtube.com/..." />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="ativo">Ativo</option>
                      <option value="inscricoes_abertas">Inscrições abertas</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="projectDestaque" checked={projectDestaque} onChange={(e) => setProjectDestaque(e.target.checked)} className="w-5 h-5 rounded" />
                    <label htmlFor="projectDestaque" className="font-semibold text-gray-700">Destaque na página inicial</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button size="lg" onClick={handleAddProject}>{editingProject ? '💾 Salvar' : '➕ Adicionar'}</Button>
                  {editingProject && <Button size="lg" variant="secondary" onClick={() => { setEditingProject(null); setProjectTitulo(''); setProjectDescricao(''); setProjectImagem(''); setProjectVideo(''); setProjectStatus('ativo'); setProjectTipo(''); setProjectDestaque(false); }}>Cancelar</Button>}
                </div>
              </Card>
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Projetos ({projectsList.length})</h2>
                {projectsList.length === 0 ? (
                  <p className="text-gray-500 py-6">Nenhum projeto cadastrado.</p>
                ) : (
                  <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                    {projectsList.map((p) => (
                      <Card key={p.id} className="hover:shadow-lg">
                        <div className="mb-2">
                          <p className="font-semibold text-gray-800 mb-1">{p.titulo}</p>
                          <p className="text-xs text-gray-500 truncate max-w-md">{p.descricao}</p>
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${p.status === 'inscricoes_abertas' ? 'bg-orange-100 text-orange-700' : p.status === 'encerrado' ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>{p.status === 'inscricoes_abertas' ? 'Inscrições abertas' : p.status === 'encerrado' ? 'Encerrado' : 'Ativo'}{p.destaque ? ' · ⭐ Destaque' : ''}</span>
                        </div>
                        {p.imagem_capa_url && (
                          <div className="w-full h-36 mb-3 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                            <img src={p.imagem_capa_url} alt="" className="w-full h-full object-contain" onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEditProject(p)} className="flex-1">✏️ Editar</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteProject(p.id)} className="flex-1">🗑️ Excluir</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Próximos Jogos */}
          {activeTab === 'jogos' && (
            <div className="space-y-6">
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Estatísticas por categoria</h2>
                <p className="text-gray-600 mb-4">Preencha manualmente os dados que aparecem na tela de jogos de cada modalidade.</p>
                <div className="grid md:grid-cols-3 gap-6">
                  {(['campo', 'fut7', 'futsal'] as const).map((mod) => {
                    const s = modalidadeStatsList[mod] || { ultimo_resultado: '', gols_total: 0, vitorias: 0, derrotas: 0 };
                    const label = mod === 'campo' ? 'Campo' : mod === 'fut7' ? 'FUT 7' : 'Futsal';
                    return (
                      <div key={mod} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-3">{label}</h3>
                        <div className="space-y-2">
                          <Input
                            label="Último jogo (ex: Westham 3 x 1 Adversário)"
                            value={s.ultimo_resultado}
                            onChange={(e) => setModalidadeStatsList((prev) => ({
                              ...prev,
                              [mod]: { ...s, ultimo_resultado: e.target.value },
                            }))}
                          />
                          <Input label="Gols total" type="number" value={String(s.gols_total)} onChange={(e) => setModalidadeStatsList((prev) => ({ ...prev, [mod]: { ...s, gols_total: parseInt(e.target.value) || 0 } }))} />
                          <Input label="Vitórias" type="number" value={String(s.vitorias)} onChange={(e) => setModalidadeStatsList((prev) => ({ ...prev, [mod]: { ...s, vitorias: parseInt(e.target.value) || 0 } }))} />
                          <Input label="Derrotas" type="number" value={String(s.derrotas)} onChange={(e) => setModalidadeStatsList((prev) => ({ ...prev, [mod]: { ...s, derrotas: parseInt(e.target.value) || 0 } }))} />
                          <Button
                            size="sm"
                            onClick={async () => {
                              const { error } = await supabase.from('modalidade_stats').upsert({
                                modalidade: mod,
                                ultimo_resultado: s.ultimo_resultado || null,
                                gols_total: s.gols_total,
                                vitorias: s.vitorias,
                                derrotas: s.derrotas,
                                updated_at: new Date().toISOString(),
                              }, { onConflict: 'modalidade' });
                              if (error) showFeedback('error', error.message);
                              else showFeedback('success', `Estatísticas de ${label} salvas!`);
                            }}
                          >
                            Salvar {label}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">📅 Cadastrar Próxima Partida</h2>
                <p className="text-gray-600 mb-4">As partidas aparecem na tela inicial e nas páginas Campo, FUT 7 e Futsal.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Data e Hora</label>
                    <input
                      type="datetime-local"
                      value={matchData}
                      onChange={(e) => setMatchData(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                  <Input label="Adversário" value={matchAdversario} onChange={(e) => setMatchAdversario(e.target.value)} placeholder="Ex: Time X" />
                  <Input label="Local" value={matchLocal} onChange={(e) => setMatchLocal(e.target.value)} placeholder="Ex: Estádio Y" />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Modalidade</label>
                    <select value={matchModalidade} onChange={(e) => setMatchModalidade(e.target.value as any)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="campo">Campo</option>
                      <option value="fut7">FUT 7</option>
                      <option value="futsal">Futsal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                    <select value={matchTipo} onChange={(e) => setMatchTipo(e.target.value as any)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="amistoso">Amistoso</option>
                      <option value="campeonato">Campeonato</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button size="lg" onClick={handleAddMatch}>{editingMatch ? '💾 Salvar' : '➕ Adicionar partida'}</Button>
                  {editingMatch && (
                    <Button size="lg" variant="secondary" onClick={() => { setEditingMatch(null); setMatchData(''); setMatchAdversario(''); setMatchLocal(''); setMatchTipo('amistoso'); setMatchModalidade('campo'); }}>Cancelar</Button>
                  )}
                </div>
              </Card>
              <Card className="shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Partidas cadastradas ({matchesList.length})</h2>
                {matchesList.length === 0 ? (
                  <p className="text-gray-500 py-6">Nenhuma partida cadastrada. Adicione acima.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-2 px-3 font-semibold text-gray-800">Data</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-800">Adversário</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-800">Local</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-800">Modalidade</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-800">Tipo</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-800">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchesList.map((m) => (
                          <tr key={m.id} className="border-b border-gray-200">
                            <td className="py-2 px-3">{m.data ? new Date(m.data).toLocaleString('pt-BR') : ''}</td>
                            <td className="py-2 px-3 font-medium">{m.adversario}</td>
                            <td className="py-2 px-3">{m.local}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">{m.modalidade === 'fut7' ? 'FUT 7' : m.modalidade === 'futsal' ? 'Futsal' : 'Campo'}</span></td>
                            <td className="py-2 px-3">{m.tipo === 'campeonato' ? 'Campeonato' : 'Amistoso'}</td>
                            <td className="py-2 px-3">
                              <Button size="sm" variant="secondary" className="mr-2" onClick={() => handleEditMatch(m)}>Editar</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteMatch(m.id)}>Excluir</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
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
                  <h3 className="font-bold text-gray-800 mb-3">Galeria de fotos</h3>
                  <p className="text-sm text-gray-500 mb-3">Envie fotos diretamente (upload para o Supabase Storage).</p>
                  {historyBlocks.length === 0 ? (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 mb-2">Crie um bloco de história antes de adicionar fotos.</p>
                      <Button size="sm" onClick={async () => {
                        const { data, error } = await supabase.from('club_history').insert({ titulo: 'História do Westham', conteudo: 'Edite este texto.', ordem: 0 }).select('*').single();
                        if (error) { showFeedback('error', error.message); return; }
                        setHistoryBlocks((prev) => [...prev, data]);
                        setHistoryTitulo(data.titulo);
                        setHistoryConteudo(data.conteudo || '');
                        setEditingHistoryId(data.id);
                        showFeedback('success', 'Bloco criado! Agora você pode adicionar fotos.');
                      }}>Criar bloco inicial</Button>
                    </div>
                  ) : (
                    <>
                  <div className="flex gap-2 mb-4 flex-wrap items-center">
                    <input
                      ref={historyPhotoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files?.length || historyBlocks.length === 0) return;
                        const historyId = historyBlocks[0].id;
                        for (let i = 0; i < files.length; i++) {
                          try {
                            const url = await uploadHistoryPhoto(files[i], historyId);
                            const { data, error } = await supabase.from('club_history_photos').insert({ history_id: historyId, url, legenda: newPhotoLegenda.trim() || null, ordem: historyPhotos.length + i }).select('*').single();
                            if (!error && data) setHistoryPhotos((prev) => [...prev, data]);
                          } catch (err: any) { showFeedback('error', err?.message); }
                        }
                        setNewPhotoLegenda('');
                        if (files.length > 0) showFeedback('success', `${files.length} foto(s) adicionada(s)!`);
                        e.target.value = '';
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Legenda (opcional)"
                      value={newPhotoLegenda}
                      onChange={(e) => setNewPhotoLegenda(e.target.value)}
                      className="w-48 px-4 py-2 border-2 border-gray-300 rounded-lg"
                    />
                    <Button size="sm" onClick={() => historyPhotoInputRef.current?.click()}>
                      + Adicionar foto(s)
                    </Button>
                  </div>
                    </>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {historyPhotos.map((p) => (
                      <div key={p.id} className="relative w-24 h-24 rounded overflow-hidden bg-gray-100 border">
                        <img src={p.url} alt={p.legenda || ''} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={async () => {
                            if (p.url) await deleteOldFileIfOurs(p.url, HISTORY_PHOTOS_BUCKET);
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

                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="newsDestaque" checked={newsDestaque} onChange={(e) => setNewsDestaque(e.target.checked)} className="w-5 h-5 rounded" />
                    <label htmlFor="newsDestaque" className="font-semibold text-gray-700">⭐ Destacar notícia (aparece em primeiro)</label>
                  </div>

                  {newsCategory === 'social' && (
                    <Input
                      label="Link da publicação (Instagram / Facebook / TikTok)"
                      placeholder="https://instagram.com/p/..."
                      value={newsLinkExterno}
                      onChange={(e) => setNewsLinkExterno(e.target.value)}
                    />
                  )}

                  <ImageUpload
                    label="Imagem da Notícia"
                    currentUrl={newsImage}
                    onUpload={async (file) => {
                      const url = await uploadNewsImage(file, newsImage);
                      setNewsImage(url);
                      return url;
                    }}
                  />

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
                          setNewsDestaque(false);
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
                        <p className="text-xs text-gray-500">{news.data_criacao}{(news as any).destaque ? ' · ⭐ Destaque' : ''}</p>
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
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingPlayer ? '✏️ Editar Jogador' : '⚽ Adicionar Novo Jogador'}</h2>

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
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Posição</label>
                    <select
                      value={(() => {
                        const u = (playerPosition || '').toUpperCase();
                        if (u.includes('GOL') || u.includes('GOLEIRO')) return 'GOL';
                        if (u.includes('ZAG') || u.includes('ZAGUEIRO')) return 'ZAG';
                        if (u.includes('VOL') || u.includes('VOLANTE')) return 'VOL';
                        if (u.includes('MEI') || u.includes('MEIA')) return 'MEI';
                        if (u.includes('ATA') || u.includes('ATACANTE') || u === 'AT') return 'ATA';
                        return playerPosition || 'MEI';
                      })()}
                      onChange={(e) => setPlayerPosition(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 bg-white text-gray-900"
                    >
                      {(() => {
                        const LIMITES: Record<string, number> = { GOL: 1, ZAG: 5, VOL: 4, MEI: 6, ATA: 4 };
                        const norm = (p: string) => {
                          const u = (p || '').toUpperCase();
                          if (u.includes('GOL') || u.includes('GOLEIRO')) return 'GOL';
                          if (u.includes('ZAG') || u.includes('ZAGUEIRO')) return 'ZAG';
                          if (u.includes('VOL') || u.includes('VOLANTE')) return 'VOL';
                          if (u.includes('MEI') || u.includes('MEIA')) return 'MEI';
                          if (u.includes('ATA') || u.includes('ATACANTE') || u === 'AT') return 'ATA';
                          return u || 'MEI';
                        };
                        const counts: Record<string, number> = { GOL: 0, ZAG: 0, VOL: 0, MEI: 0, ATA: 0 };
                        playersList.forEach((p) => {
                          const n = norm(p.posicao);
                          if (n in counts && (p.id !== editingPlayer?.id)) counts[n]++;
                        });
                        const currentNorm = norm(playerPosition || '');
                        return ['GOL', 'ZAG', 'VOL', 'MEI', 'ATA'].map((pos) => {
                          const atLimit = counts[pos] >= (LIMITES[pos] ?? 99);
                          const isCurrent = editingPlayer && (currentNorm === pos || norm(editingPlayer.posicao) === pos);
                          const disabled = atLimit && !isCurrent;
                          return (
                            <option key={pos} value={pos} disabled={disabled}>
                              {pos} {disabled ? `(limite ${LIMITES[pos]} atingido)` : ''}
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>
                  <Input 
                    label="Idade" 
                    type="number" 
                    placeholder="25"
                    value={playerAge}
                    onChange={(e) => setPlayerAge(e.target.value)}
                  />
                  {editingPlayer && (
                    <>
                      <Input label="Gols" type="number" value={String(editPlayerGols)} onChange={(e) => setEditPlayerGols(parseInt(e.target.value) || 0)} />
                      <Input label="Cartões Amarelos" type="number" value={String(editPlayerCartoesA)} onChange={(e) => setEditPlayerCartoesA(parseInt(e.target.value) || 0)} />
                      <Input label="Cartões Vermelhos" type="number" value={String(editPlayerCartoesV)} onChange={(e) => setEditPlayerCartoesV(parseInt(e.target.value) || 0)} />
                      <Input label="Faltas" type="number" value={String(editPlayerFaltas)} onChange={(e) => setEditPlayerFaltas(parseInt(e.target.value) || 0)} />
                      <ImageUpload
                        label="Foto (aba Jogos)"
                        currentUrl={editPlayerFotoUrl}
                        onUpload={async (file) => {
                          const p = editingPlayer;
                          const url = await uploadPlayerPhoto(file, p?.id || crypto.randomUUID(), editPlayerFotoUrl);
                          setEditPlayerFotoUrl(url);
                          return url;
                        }}
                      />
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="editReserva" checked={editPlayerReserva} onChange={(e) => setEditPlayerReserva(e.target.checked)} className="w-5 h-5 rounded" />
                          <label htmlFor="editReserva" className="font-semibold text-gray-700">Reserva</label>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-semibold text-gray-700">Destaque por categoria (máx. 3 por modalidade):</span>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" id="editDestaqueCampo" checked={editPlayerDestaqueCampo} onChange={(e) => setEditPlayerDestaqueCampo(e.target.checked)} className="w-5 h-5 rounded" />
                            <span>Campo</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" id="editDestaqueFut7" checked={editPlayerDestaqueFut7} onChange={(e) => setEditPlayerDestaqueFut7(e.target.checked)} className="w-5 h-5 rounded" />
                            <span>FUT 7</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" id="editDestaqueFutsal" checked={editPlayerDestaqueFutsal} onChange={(e) => setEditPlayerDestaqueFutsal(e.target.checked)} className="w-5 h-5 rounded" />
                            <span>Futsal</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
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

                <div className="flex gap-3 mt-6">
                  <Button size="lg" className="flex-1" onClick={editingPlayer ? handleSavePlayerFull : handleAddPlayer}>
                    {editingPlayer ? '💾 Salvar alterações' : '➕ Adicionar Jogador'}
                  </Button>
                  {editingPlayer && (
                    <Button size="lg" variant="secondary" onClick={() => { setEditingPlayer(null); clearPlayerForm(); }}>
                      Cancelar
                    </Button>
                  )}
                </div>
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
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">🟨</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">🟥</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Faltas</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Reserva</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playersList.map((player) => {
                        const jogaCampo = player.joga_campo !== false;
                        const jogaFut7 = !!player.joga_fut7;
                        const jogaFutsal = !!player.joga_futsal;
                        return (
                        <tr key={player.id} className="border-b border-gray-200 hover:bg-red-50">
                          <td className="py-3 px-4 font-bold text-red-600">{player.numero}</td>
                          <td className="py-3 px-4 text-gray-800">{player.nome}</td>
                          <td className="py-3 px-4 text-gray-600">{player.posicao}</td>
                          <td className="py-3 px-4">
                            <span className="flex flex-wrap gap-1">
                              {jogaCampo && <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">Campo</span>}
                              {jogaFut7 && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">FUT 7</span>}
                              {jogaFutsal && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs">Futsal</span>}
                              {!jogaCampo && !jogaFut7 && !jogaFutsal && <span className="text-gray-400 text-xs">—</span>}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{player.idade ?? '—'} {player.idade != null ? 'anos' : ''}</td>
                          <td className="py-3 px-4 text-gray-600">{player.gols ?? 0}</td>
                          <td className="py-3 px-4">{player.cartoes_amarelos ?? 0}</td>
                          <td className="py-3 px-4">{player.cartoes_vermelhos ?? 0}</td>
                          <td className="py-3 px-4">{player.faltas ?? 0}</td>
                          <td className="py-3 px-4">{player.reserva ? 'Sim' : 'Não'}</td>
                          <td className="py-3 px-4 flex gap-2 flex-wrap">
                            <Button size="sm" variant="secondary" onClick={() => openEditPlayer(player)}>
                              ✏️ Editar
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeletePlayer(player.id)}>
                              🗑️
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

                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Modalidade</label>
                    <select
                      value={lineupModalidade}
                      onChange={(e) => {
                        const v = e.target.value as 'campo' | 'fut7' | 'futsal';
                        setLineupModalidade(v);
                        const forms = getFormationsForModalidade(v);
                        setLineupFormacao(forms.includes(lineupFormacao) ? lineupFormacao : forms[0]);
                        setLineupSlotPlayers({});
                        setLineupSlotLabels({});
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 bg-white text-gray-900"
                    >
                      <option value="campo">Campo (11)</option>
                      <option value="fut7">FUT 7 (7)</option>
                      <option value="futsal">Futsal (5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Formação</label>
                    <select
                      value={lineupFormacao}
                      onChange={(e) => setLineupFormacao(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 bg-white text-gray-900"
                    >
                      {getFormationsForModalidade(lineupModalidade).map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Próxima partida</label>
                    <input
                      type="date"
                      value={lineupProximaPartida}
                      onChange={(e) => setLineupProximaPartida(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 bg-white text-gray-900"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button size="lg" onClick={handleSaveLineup} disabled={lineupSaving}>
                      {lineupSaving ? 'Salvando...' : '💾 Salvar Escalação'}
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => { setLineupSlotPlayers({}); setLineupSlotLabels({}); }}>
                      Limpar
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione o jogador em cada posição do campo. Cadastre os jogadores na aba Jogadores e marque em qual modalidade cada um joga.
                </p>

                {(() => {
                  const jogamModalidade = playersList
                    .filter((p) =>
                      lineupModalidade === 'campo' ? p.joga_campo !== false : lineupModalidade === 'fut7' ? !!p.joga_fut7 : !!p.joga_futsal
                    )
                    .sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0))
                    .map((p) => ({ id: p.id, nome: p.nome, numero: p.numero ?? p.numero_camisa ?? 0 }));
                  return (
                    <div className="flex justify-center">
                      <LineupField
                        formacao={lineupFormacao}
                        modalidade={lineupModalidade}
                        mode="admin"
                        players={jogamModalidade}
                        slotPlayers={lineupSlotPlayers}
                        slotLabels={lineupSlotLabels}
                        onSlotChange={handleLineupSlotChange}
                        onLabelChange={handleLineupLabelChange}
                      />
                    </div>
                  );
                })()}
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

                {/* Imagens do Produto - upload direto */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Imagens do Produto</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    <input
                      ref={productImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadProductImage(file);
                          setProductImages((prev) => (prev.length === 0 ? [url] : [...prev, url]));
                          setProductImage((prev) => prev || url);
                        } catch (err: any) { showFeedback('error', err?.message || 'Erro ao enviar'); }
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => productImageInputRef.current?.click()}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
                    >
                      + Adicionar imagem
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto flex-wrap">
                    {(productImages.length > 0 ? productImages : productImage ? [productImage] : []).map((img, idx) => (
                      <div key={idx} className="w-36 h-24 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                        <img src={img} alt={`img-${idx}`} className="w-full h-full object-contain" onError={(e: any)=>{e.currentTarget.src='https://via.placeholder.com/150?text=Sem+Imagem'}} />
                        <button
                          onClick={async () => {
                            if (isOurStorageUrl(img, PRODUCTS_BUCKET)) await deleteOldFileIfOurs(img, PRODUCTS_BUCKET);
                            const next = (productImages.length > 0 ? productImages : productImage ? [productImage] : []).filter((_, i) => i !== idx);
                            setProductImages(next);
                            setProductImage(next[0] || '');
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variações do produto (Tamanho, Cor, etc.) */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Variações do produto (Tamanho, Cor, etc.)</label>
                  <p className="text-xs text-gray-500 mb-3">Adicione tipos de variação (ex: Tamanho) e suas opções (P, M, G, GG). O cliente poderá selecionar na loja.</p>
                  {/* Nova variação */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <input
                      placeholder="Tipo (ex: Tamanho)"
                      value={newVariationTipo}
                      onChange={(e) => setNewVariationTipo(e.target.value)}
                      className="w-36 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                    <input
                      placeholder="Opção (ex: P, M, G)"
                      value={newVariationOpcao}
                      onChange={(e) => setNewVariationOpcao(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariationOption())}
                      className="w-28 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                    <button
                      onClick={() => {
                        if (newVariationTipo.trim() && newVariationOpcao.trim()) {
                          addVariationOption();
                        } else if (newVariationTipo.trim()) {
                          setProductVariations([...productVariations, { tipo: newVariationTipo.trim(), opcoes: [] }]);
                          setNewVariationTipo('');
                        }
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold"
                    >+ Adicionar</button>
                  </div>
                  {/* Lista de variações */}
                  <div className="space-y-3">
                    {productVariations.map((v, vidx) => (
                      <div key={vidx} className="bg-white border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">{v.tipo}</span>
                          <button onClick={() => setProductVariations(productVariations.filter((_, i) => i !== vidx))} className="text-red-600 text-xs">Remover tipo</button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {v.opcoes.map((op, oidx) => (
                            <span key={oidx} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                              {op}
                              <button onClick={() => {
                                const copy = [...productVariations];
                                copy[vidx] = { ...copy[vidx], opcoes: copy[vidx].opcoes.filter((_, i) => i !== oidx) };
                                setProductVariations(copy);
                              }} className="hover:text-red-600">×</button>
                            </span>
                          ))}
                          {editingVariationIdx === vidx ? (
                            <>
                              <input
                                autoFocus
                                placeholder="Nova opção"
                                className="w-24 px-2 py-1 border rounded text-sm text-gray-900 bg-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val) {
                                      const copy = [...productVariations];
                                      copy[vidx] = { ...copy[vidx], opcoes: [...copy[vidx].opcoes, val] };
                                      setProductVariations(copy);
                                      setEditingVariationIdx(null);
                                    }
                                  }
                                }}
                                onBlur={() => setEditingVariationIdx(null)}
                              />
                            </>
                          ) : (
                            <button onClick={() => setEditingVariationIdx(vidx)} className="text-orange-600 text-xs border border-orange-300 rounded px-2 py-1">+ Opção</button>
                          )}
                        </div>
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
                        setProductVariations([]);
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

                          {(product.variacoes && product.variacoes.length > 0) && (
                            <div className="mb-3 flex gap-2 flex-wrap">
                              {product.variacoes.map((v: ProductVariation, i: number) => (
                                <span key={i} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                  {v.tipo}: {v.opcoes.join(', ')}
                                </span>
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
          )}
        </div>
      </main>
      {confirmModal && (
        <ConfirmModal
          open={!!confirmModal}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel="Confirmar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </>
  );
}