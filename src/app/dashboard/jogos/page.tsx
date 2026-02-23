'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import type { Match, NewsModalidade } from '@/types';
import { supabase } from '@/lib/supabase';

type ModalidadeFilter = 'todas' | NewsModalidade;

export default function DashboardJogosPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModalidade, setFilterModalidade] = useState<ModalidadeFilter>('todas');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .gte('data', new Date().toISOString())
        .order('data', { ascending: true });

      if (!error && data) {
        setMatches(
          data.map((m: any) => ({
            id: m.id,
            data: m.data,
            data_text: m.data_text,
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
      setLoading(false);
    };

    load();
  }, []);

  const byModalidade = matches.reduce<Record<NewsModalidade, Match[]>>(
    (acc, match) => {
      const m = (match.modalidade || 'campo') as NewsModalidade;
      acc[m].push(match);
      return acc;
    },
    { campo: [], futsal: [], fut7: [] },
  );

  const modalidadeLabel = (m: NewsModalidade) => {
    if (m === 'futsal') return 'FUTSAL';
    if (m === 'fut7') return 'FUT7';
    return 'FUT11';
  };

  const modalidadesToShow: NewsModalidade[] =
    filterModalidade === 'todas'
      ? (['campo', 'futsal', 'fut7'] as NewsModalidade[])
      : [filterModalidade];

  return (
    <main className="bg-neutral-950 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-orange-400 hover:text-orange-300 mb-2 inline-block"
            >
              ← Voltar ao dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-orange-300">
              Próximos jogos
            </h1>
            <p className="text-neutral-300 text-sm md:text-base mt-2">
              Veja o cronograma de partidas do FUT11, FUTSAL e FUT 7 do Sport Club Westham.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-neutral-300 text-sm">Filtrar por modalidade:</p>
            <select
              value={filterModalidade}
              onChange={(e) => setFilterModalidade(e.target.value as ModalidadeFilter)}
              className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 text-sm"
            >
              <option value="todas">Todas</option>
              <option value="campo">FUT11</option>
              <option value="futsal">FUTSAL</option>
              <option value="fut7">FUT7</option>
            </select>
          </div>
        </div>

        {loading && (
          <p className="text-neutral-400 text-sm">Carregando partidas...</p>
        )}

        {!loading && matches.length === 0 && (
          <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
            Nenhuma partida futura cadastrada no sistema.
          </Card>
        )}

        {!loading &&
          modalidadesToShow.map((mod) => {
            const lista = byModalidade[mod];
            if (lista.length === 0) return null;
            return (
              <section key={mod} className="space-y-4">
                <h2 className="text-2xl font-bold text-orange-300">
                  {modalidadeLabel(mod)}
                </h2>
                <div className="space-y-3">
                  {lista.map((m) => {
                    const dataFormatada = m.data_text || (m.data ? new Date(m.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');
                    return (
                      <Card
                        key={m.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-neutral-900 border border-neutral-800"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-neutral-50">
                            Westham x {m.adversario}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {dataFormatada} • {m.local}
                          </p>
                          {m.descricao && (
                            <p className="text-xs text-neutral-400">
                              {m.descricao}
                            </p>
                          )}
                        </div>
                        <span className="mt-2 md:mt-0 text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 font-semibold">
                          {m.tipo === 'campeonato' ? 'Campeonato' : 'Amistoso'}
                        </span>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>
    </main>
  );
}

