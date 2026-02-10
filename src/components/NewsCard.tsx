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

  const handleLikeNews = () => {
    if (!user || user.role !== 'sócio') return;
    
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
    if (!user || user.role !== 'sócio' || !newComment.trim()) return;

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
    if (!user || user.role !== 'sócio') return;

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
    <Card className="hover:shadow-lg transition">
      <div className="mb-3">
        <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
          {localNews.category || localNews.categoria}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2">{localNews.titulo}</h3>
      <p className="text-gray-600 text-sm mb-3">{localNews.data}</p>
      
      {/* Image Preview */}
      {localNews.imagem_url && (
        <div className="w-full h-40 bg-gray-100 mb-3 rounded overflow-hidden flex items-center justify-center">
          <img 
            src={localNews.imagem_url} 
            alt={localNews.titulo}
            className="w-full h-full object-contain"
            onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/300?text=Sem+Imagem'; }}
          />
        </div>
      )}

      <p className="text-gray-700 mb-4">{localNews.conteudo}</p>

      {/* Likes and Comments Section */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex gap-4 text-sm">
          <button
            onClick={handleLikeNews}
            disabled={!user || user.role !== 'sócio'}
            className={`flex items-center gap-1 font-semibold transition ${
              !user || user.role !== 'sócio'
                ? 'text-gray-400 cursor-not-allowed'
                : localNews.usuarios_curtidas?.includes(user?.id)
                ? 'text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            ❤️ {localNews.curtidas || 0}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 font-semibold text-gray-600 hover:text-blue-600 transition"
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
          {user && user.role === 'sócio' && (
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
            <p className="text-sm text-gray-500 text-center">Faça login como sócio para comentar</p>
          )}
          {user && user.role !== 'sócio' && (
            <p className="text-sm text-gray-500 text-center">
              Somente sócios ativos podem comentar e curtir notícias.
            </p>
          )}

          {/* Comments List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {localNews.comentarios?.map((comment: NewsComment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-semibold text-gray-800">{comment.user_nome}</p>
                  <p className="text-xs text-gray-500">{comment.data_criacao}</p>
                </div>
                <p className="text-sm text-gray-700 mb-2">{comment.conteudo}</p>
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`text-xs font-semibold transition ${
                    comment.usuarios_curtidas?.includes(user?.id || '')
                      ? 'text-red-600'
                      : 'text-gray-600 hover:text-red-600'
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
