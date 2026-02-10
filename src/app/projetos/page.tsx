'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  tipo: string | null;
  destaque: boolean;
  imagem_capa_url?: string | null;
  created_at: string;
}

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProjects(
          data.map((p: any) => ({
            id: p.id,
            titulo: p.titulo,
            descricao: p.descricao,
            status: p.status,
            tipo: p.tipo,
            destaque: p.destaque,
            imagem_capa_url: p.imagem_capa_url,
            created_at: p.created_at,
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
            Projetos &amp; Escolinha Westham
          </h1>
          <p className="text-neutral-300 text-sm md:text-base">
            Aqui ficam os projetos oficiais do clube: escolinha infantil, ações sociais, peneiras
            e outras iniciativas que aproximam o Westham da comunidade.
          </p>

          {loading && <p className="text-neutral-400 text-sm">Carregando projetos...</p>}

          {!loading && projects.length === 0 && (
            <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
              Nenhum projeto cadastrado ainda. O administrador pode criar projetos (como a
              escolinha infantil) pelo painel.
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <Card
                key={p.id}
                className={`bg-neutral-900 border ${
                  p.destaque ? 'border-orange-500' : 'border-neutral-800'
                } text-neutral-100 flex flex-col`}
              >
                {p.imagem_capa_url && (
                  <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center">
                    <img
                      src={p.imagem_capa_url}
                      alt={p.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://via.placeholder.com/300?text=Projeto+Westham';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-orange-300">{p.titulo}</h2>
                    {p.tipo && (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-200">
                        {p.tipo}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-200 mb-3 line-clamp-3">{p.descricao}</p>
                  <div className="mt-auto flex items-center justify-between text-xs text-neutral-400">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        p.status === 'ativo'
                          ? 'bg-emerald-900/40 text-emerald-300'
                          : p.status === 'inscricoes_abertas'
                          ? 'bg-orange-900/40 text-orange-300'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {p.status}
                    </span>
                    <span>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString('pt-BR')
                        : ''}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

