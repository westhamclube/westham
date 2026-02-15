'use client';

import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { useAuth } from '@/context/AuthContext';

interface NewsComment {
  id: string;
  user_id: string;
  user_nome?: string;
  conteudo: string;
  data_criacao: string;
  curtidas: number;
  usuarios_curtidas?: string[];
}

interface NewsCardProps {
  news: any;
  onUpdate?: (updatedNews: any) => void;
  onDelete?: (newsId: string) => void;
  onEdit?: (news: any) => void;
}

export function NewsCard({ news, onUpdate, onDelete, onEdit }: NewsCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localNews, setLocalNews] = useState(news);

  const modalidadeLabel = (() => {
    const m = (localNews.modalidade || '').toLowerCase();
    if (m === 'fut7') return 'FUT7';
    if (m === 'futsal') return 'Futsal';
    if (m === 'campo') return 'Campo';
    return null;
  })();

  const categoriaLabel = (() => {
    const c = (localNews.categoria || localNews.category || '').toLowerCase();
    if (c === 'general') return 'Geral';
    if (c === 'match') return 'Partida';
    if (c === 'player') return 'Jogador';
    if (c === 'academy') return 'Academia';
    if (c === 'social') return 'Redes sociais';
    return c || 'Geral';
  })();

  const canLike = user && ['usuário', 'sócio', 'jogador'].includes(user.role);
  const canComment = user && ['sócio', 'jogador'].includes(user.role);

  const handleLikeNews = () => {
    if (!user || !canLike) return;
    
    const usuarios_curtidas = localNews.usuarios_curtidas || [];
    const jaGostou = usuarios_curtidas.includes(user.id);
    
    const updated = {
      ...localNews,
      curtidas: jaGostou ? localNews.curtidas - 1 : localNews.curtidas + 1,
      usuarios_curtidas: jaGostou 
        ? usuarios_curtidas.filter((id: string) => id !== user.id)
        : [...usuarios_curtidas, user.id],
    };
    
    setLocalNews(updated);
    onUpdate?.(updated);
  };

  const handleAddComment = () => {
    if (!user || !canComment || !newComment.trim()) return;

    const comentarios = localNews.comentarios || [];
    const novoComentario: NewsComment = {
      id: Date.now().toString(),
      user_id: user.id,
      user_nome: user.nome,
      conteudo: newComment,
      data_criacao: new Date().toLocaleDateString('pt-BR'),
      curtidas: 0,
      usuarios_curtidas: [],
    };

    const updated = {
      ...localNews,
      comentarios: [novoComentario, ...comentarios],
    };

    setLocalNews(updated);
    setNewComment('');
    onUpdate?.(updated);
  };

  const handleLikeComment = (commentId: string) => {
    if (!user || !canComment) return;

    const comentarios = localNews.comentarios || [];
    const updated = {
      ...localNews,
      comentarios: comentarios.map((c: NewsComment) => {
        if (c.id === commentId) {
          const usuarios_curtidas = c.usuarios_curtidas || [];
          const jaGostou = usuarios_curtidas.includes(user.id);
          
          return {
            ...c,
            curtidas: jaGostou ? c.curtidas - 1 : c.curtidas + 1,
            usuarios_curtidas: jaGostou 
              ? usuarios_curtidas.filter((id: string) => id !== user.id)
              : [...usuarios_curtidas, user.id],
          };
        }
        return c;
      }),
    };

    setLocalNews(updated);
    onUpdate?.(updated);
  };

  return (
    <Card className="hover:shadow-lg transition bg-neutral-900 border border-neutral-800">
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        {modalidadeLabel && (
          <span className="inline-block bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-semibold">
            {modalidadeLabel}
          </span>
        )}
        <span className="inline-block bg-neutral-700 text-neutral-200 px-3 py-1 rounded-full text-xs font-semibold">
          {categoriaLabel}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-neutral-50 mb-2">{localNews.titulo}</h3>
      <p className="text-neutral-400 text-sm mb-3">{localNews.data}</p>
      
      {/* Image Preview */}
      {localNews.imagem_url && (
        <div className="w-full aspect-video bg-neutral-800 mb-3 rounded-lg overflow-hidden flex items-center justify-center">
          <img 
            src={localNews.imagem_url} 
            alt={localNews.titulo}
            className="w-full h-full object-contain object-center"
            loading="lazy"
            decoding="async"
            onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/300?text=Sem+Imagem'; }}
          />
        </div>
      )}

      <p className="text-neutral-300 text-sm mb-4 line-clamp-3">{localNews.conteudo}</p>

      {localNews.link_externo && (
        <a
          href={localNews.link_externo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-orange-400 font-semibold hover:text-orange-300 hover:underline"
        >
          Conferir publicação →
        </a>
      )}

      {/* Likes and Comments Section */}
      <div className="border-t border-neutral-700 pt-3 space-y-2">
        <div className="flex gap-4 text-sm">
          <button
            onClick={handleLikeNews}
            disabled={!canLike}
            className={`flex items-center gap-1 font-semibold transition ${
              !canLike
                ? 'text-neutral-500 cursor-not-allowed'
                : localNews.usuarios_curtidas?.includes(user?.id)
                ? 'text-red-400'
                : 'text-neutral-400 hover:text-red-400'
            }`}
          >
            ❤️ {localNews.curtidas || 0}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 font-semibold text-neutral-400 hover:text-orange-400 transition"
          >
            💬 {localNews.comentarios?.length || 0}
          </button>
        </div>

        {/* Admin Actions */}
        {user?.role === 'admin' && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="secondary" onClick={() => onEdit?.(localNews)} className="flex-1">
              ✏️ Editar
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete?.(localNews.id)} className="flex-1">
              🗑️ Deletar
            </Button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-4 space-y-3">
          {canComment && (
            <div className="space-y-2">
              <Input
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={handleAddComment}
                className="w-full"
              >
                Comentar
              </Button>
            </div>
          )}

          {!user && (
            <p className="text-sm text-neutral-500 text-center">Faça login para curtir e comentar.</p>
          )}
          {user && !canLike && (
            <p className="text-sm text-neutral-500 text-center">
              Faça login como usuário, sócio ou jogador para interagir com as notícias.
            </p>
          )}
          {user && canLike && !canComment && (
            <p className="text-sm text-neutral-500 text-center">
              Você pode curtir notícias. Para comentar, torne-se sócio ou jogador.
            </p>
          )}

          {/* Comments List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {localNews.comentarios?.map((comment: NewsComment) => (
              <div key={comment.id} className="bg-neutral-800 p-3 rounded-lg border border-neutral-700">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-semibold text-neutral-100">{comment.user_nome}</p>
                  <p className="text-xs text-neutral-500">{comment.data_criacao}</p>
                </div>
                <p className="text-sm text-neutral-300 mb-2">{comment.conteudo}</p>
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`text-xs font-semibold transition ${
                    comment.usuarios_curtidas?.includes(user?.id || '')
                      ? 'text-red-400'
                      : 'text-neutral-400 hover:text-red-400'
                  }`}
                >
                  ❤️ {comment.curtidas || 0}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
