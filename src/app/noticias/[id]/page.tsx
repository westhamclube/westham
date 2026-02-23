'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const CAT_LABELS: Record<string, string> = {
  general: 'Geral',
  match: 'Partida',
  player: 'Jogador',
  academy: 'Academia',
  social: 'Redes sociais',
};

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
  } catch { return null; }
  return null;
}

export default function NoticiaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data, error } = await supabase.from('news').select('*').eq('id', id).single();
      if (error || !data) {
        setNews(null);
      } else {
        setNews({
          id: data.id,
          titulo: data.titulo,
          conteudo: data.conteudo,
          categoria: data.categoria,
          modalidade: data.modalidade,
          imagem_url: data.imagem_url,
          video_url: data.video_url,
          link_externo: data.link_externo,
          created_at: data.created_at,
        });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="bg-neutral-950 min-h-screen py-12 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full" />
        </main>
      </>
    );
  }

  if (!news) {
    return (
      <>
        <Header />
        <main className="bg-neutral-950 min-h-screen py-12">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-neutral-400 mb-4">Notícia não encontrada.</p>
            <Link href="/noticias" className="text-orange-400 hover:underline">
              ← Voltar para notícias
            </Link>
          </div>
        </main>
      </>
    );
  }

  const modalidadeLabel = news.modalidade === 'fut7' ? 'FUT 7' : news.modalidade === 'futsal' ? 'FUTSAL' : news.modalidade === 'campo' ? 'FUT11' : null;
  const catLabel = CAT_LABELS[news.categoria] || news.categoria || 'Geral';
  const videoEmbed = news.video_url ? getYouTubeEmbed(news.video_url) : null;

  return (
    <>
      <Header />
      <main className="bg-neutral-950 min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/noticias" className="text-sm text-orange-400 hover:text-orange-300 mb-4 inline-block">
            ← Voltar para notícias
          </Link>

          <Card className="bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-semibold">
                {catLabel}
              </span>
              {modalidadeLabel && (
                <span className="inline-block bg-neutral-700 text-neutral-200 px-3 py-1 rounded-full text-xs font-semibold">
                  {modalidadeLabel}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-neutral-50 mb-2">{news.titulo}</h1>
            <p className="text-neutral-400 text-sm mb-4">
              {news.created_at ? new Date(news.created_at).toLocaleDateString('pt-BR') : ''}
            </p>

            {news.imagem_url && (
              <div className="w-full aspect-video mb-6 rounded-lg overflow-hidden bg-neutral-800">
                <img
                  src={news.imagem_url}
                  alt={news.titulo}
                  className="w-full h-full object-contain object-center"
                  onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/600?text=Sem+Imagem'; }}
                />
              </div>
            )}

            {videoEmbed && (
              <div className="w-full aspect-video mb-6 rounded-lg overflow-hidden">
                <iframe className="w-full h-full" src={videoEmbed} title={news.titulo} allowFullScreen />
              </div>
            )}

            <div className="text-neutral-200 whitespace-pre-wrap leading-relaxed mb-6">
              {news.conteudo}
            </div>

            {news.link_externo && (
              <a
                href={news.link_externo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-orange-400 font-semibold hover:text-orange-300 hover:underline"
              >
                Conferir publicação original →
              </a>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
