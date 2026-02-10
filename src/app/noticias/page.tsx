'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { NewsCard } from '@/components/NewsCard';
import { supabase } from '@/lib/supabase';
import type { News } from '@/types';

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNews(
          data.map((n: any) => ({
            id: n.id,
            titulo: n.titulo,
            conteudo: n.conteudo,
            autor_id: n.autor_id,
            data_criacao: n.created_at,
            data_atualizacao: n.updated_at,
            categoria: n.categoria,
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
      setLoading(false);
    };

    load();
  }, []);

  return (
    <>
      <Header />
      <main className="bg-neutral-950 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-300">
            Notícias do Clube
          </h1>
          <p className="text-neutral-300 text-sm md:text-base">
            Acompanhe aqui as notícias oficiais dos grupos FUT SET, Campo/Futsal, projetos e
            bastidores do Sport Club Westham. O administrador publica tudo pelo painel.
          </p>

          {loading && (
            <p className="text-neutral-400 text-sm">Carregando notícias...</p>
          )}

          {!loading && news.length === 0 && (
            <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
              Ainda não há notícias cadastradas. Assim que o admin publicar, elas aparecerão aqui.
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n) => (
              <NewsCard
                key={n.id}
                news={{
                  ...n,
                  data: n.data_criacao
                    ? new Date(n.data_criacao).toLocaleDateString('pt-BR')
                    : '',
                  category: n.categoria,
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

