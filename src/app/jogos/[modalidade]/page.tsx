'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { LineupField } from '@/components/LineupField';
import type { Match, NewsModalidade } from '@/types';
import { supabase } from '@/lib/supabase';

const MODALIDADES: Record<string, NewsModalidade> = {
  campo: 'campo',
  fut7: 'fut7',
  futsal: 'futsal',
};

const LABEL: Record<string, string> = {
  campo: 'Campo',
  fut7: 'FUT 7',
  futsal: 'Futsal',
};

export default function JogosModalidadePage() {
  const params = useParams();
  const slug = (params?.modalidade as string) || 'campo';
  const modalidade = MODALIDADES[slug] || 'campo';

  const [matches, setMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [modalidadeStats, setModalidadeStats] = useState<{ ultimo_resultado: string | null; gols_total: number; vitorias: number; derrotas: number } | null>(null);
  const [lineup, setLineup] = useState<{
    id: string;
    formacao: string;
    proxima_partida: string;
    descricao?: string;
    lineup_players?: Array<{
      posicao: string;
      numero_camisa: number;
      posicao_label?: string;
      titular: boolean;
      player_id: string;
    }>;
  } | null>(null);
  const [allPlayersMap, setAllPlayersMap] = useState<Record<string, { nome: string; numero: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        { data: matchesData },
        { data: newsData },
        { data: allPlayersData },
        { data: lineupData },
        { data: statsData },
      ] = await Promise.all([
        supabase
          .from('matches')
          .select('*')
          .gte('data', new Date().toISOString())
          .or(`modalidade.eq.${modalidade},modalidade.is.null`)
          .order('data', { ascending: true })
          .limit(10),
        (async () => {
          const { data, error } = await supabase
            .from('news')
            .select('id, titulo, conteudo, imagem_url, created_at')
            .order('destaque', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8);
          if (error) return { data: [] };
          return { data: (data || []).slice(0, 4) };
        })(),
        (async () => {
          const { data, error } = await supabase.from('players').select('*');
          if (error) {
            console.warn('[Jogos] Erro ao buscar jogadores:', error.message);
            return { data: [] };
          }
          return { data: data || [] };
        })(),
        (async () => {
          const { data, error } = await supabase
            .from('lineups')
            .select('id, formacao, proxima_partida, descricao, modalidade, lineup_players(posicao, numero_camisa, posicao_label, titular, player_id)')
            .eq('modalidade', modalidade)
            .order('proxima_partida', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) return { data: null };
          return { data };
        })(),
        supabase.from('modalidade_stats').select('ultimo_resultado, gols_total, vitorias, derrotas').eq('modalidade', modalidade).maybeSingle(),
      ]);

      if (matchesData) {
        setMatches(
          matchesData.map((m: any) => ({
            id: m.id,
            data: m.data,
            adversario: m.adversario,
            local: m.local,
            resultado: m.resultado,
            gols_westham: m.gols_westham,
            gols_adversario: m.gols_adversario,
            tipo: m.tipo,
            descricao: m.descricao,
            modalidade: (m.modalidade || modalidade) as NewsModalidade,
          }))
        );
      }
      if (newsData) setNews(newsData);
      const jogaKey = modalidade === 'campo' ? 'joga_campo' : modalidade === 'fut7' ? 'joga_fut7' : 'joga_futsal';
      const filteredPlayers = (allPlayersData || []).filter((p: any) => p[jogaKey] !== false).sort((a: any, b: any) => (Number(b?.gols) || 0) - (Number(a?.gols) || 0));
      setPlayers(filteredPlayers);
      if (lineupData) setLineup(lineupData as any);
      if (statsData) {
        setModalidadeStats({
          ultimo_resultado: statsData.ultimo_resultado ?? null,
          gols_total: statsData.gols_total ?? 0,
          vitorias: statsData.vitorias ?? 0,
          derrotas: statsData.derrotas ?? 0,
        });
      } else {
        setModalidadeStats({ ultimo_resultado: null, gols_total: 0, vitorias: 0, derrotas: 0 });
      }
      const map: Record<string, { nome: string; numero: number }> = {};
      (allPlayersData || []).forEach((p: any) => {
        if (p?.id) map[p.id] = { nome: p.nome ?? 'Jogador', numero: p.numero ?? p.numero_camisa ?? 0 };
      });
      setAllPlayersMap(map);
      setLoading(false);
    };

    load();
  }, [modalidade]);

  const destaqueKey = modalidade === 'campo' ? 'destaque_campo' : modalidade === 'fut7' ? 'destaque_fut7' : 'destaque_futsal';
  const destaquesPlayers = players.filter((p: any) =>
    !!p[destaqueKey] || (!!p.destaque && (p[destaqueKey] === undefined || p[destaqueKey] === null))
  ).slice(0, 3);

  return (
    <main className="bg-neutral-950 min-h-screen py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-300">
            Jogos — {LABEL[slug] || slug}
          </h1>

          {/* Estatísticas da modalidade (admin preenche manualmente) */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Estatísticas</h2>
            <div className="space-y-4">
              {modalidadeStats?.ultimo_resultado && (
                <Card className="p-4 bg-neutral-900 border border-neutral-800">
                  <div className="text-sm text-neutral-400 mb-1">Último jogo</div>
                  <div className="text-lg font-bold text-orange-400">{modalidadeStats.ultimo_resultado}</div>
                </Card>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="text-center bg-neutral-900 border border-neutral-800 p-4">
                  <div className="text-2xl font-bold text-orange-400">{modalidadeStats?.gols_total ?? 0}</div>
                  <div className="text-sm text-neutral-400">Gols</div>
                </Card>
                <Card className="text-center bg-neutral-900 border border-neutral-800 p-4">
                  <div className="text-2xl font-bold text-orange-400">{modalidadeStats?.vitorias ?? 0}</div>
                  <div className="text-sm text-neutral-400">Vitórias</div>
                </Card>
                <Card className="text-center bg-neutral-900 border border-neutral-800 p-4">
                  <div className="text-2xl font-bold text-red-400">{modalidadeStats?.derrotas ?? 0}</div>
                  <div className="text-sm text-neutral-400">Derrotas</div>
                </Card>
              </div>
            </div>
            {!loading && !modalidadeStats?.ultimo_resultado && !modalidadeStats?.gols_total && !modalidadeStats?.vitorias && !modalidadeStats?.derrotas && (
              <p className="text-neutral-500 text-sm mt-2">O admin pode preencher as estatísticas no painel (Jogos → Estatísticas por categoria).</p>
            )}
          </section>

          {/* Escalação */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Escalação</h2>
            {!loading && !lineup && (
              <Card className="bg-neutral-900 border border-neutral-800 text-neutral-400 p-4">
                Nenhuma escalação cadastrada para esta modalidade. O admin pode cadastrar no painel (Escalações).
              </Card>
            )}
            {lineup && (
              <Card className="bg-neutral-900 border border-neutral-800 overflow-hidden p-4">
                <div className="mb-4">
                  <p className="font-semibold text-orange-400">Formação {lineup.formacao || '—'}</p>
                  {lineup.proxima_partida && (
                    <p className="text-sm text-neutral-400">
                      Próxima partida: {new Date(lineup.proxima_partida).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <LineupField
                  formacao={lineup.formacao || '4-3-3'}
                  modalidade={modalidade}
                  mode="display"
                  players={[]}
                  slotPlayers={(() => {
                    const lp = (lineup.lineup_players || []) as any[];
                    const map: Record<string, { id: string; nome: string; numero: number }> = {};
                    lp.forEach((row: any) => {
                      const p = allPlayersMap[row.player_id];
                      if (row.posicao && /^slot_\d+$/.test(row.posicao) && row.player_id) {
                        map[row.posicao] = {
                          id: row.player_id,
                          nome: p?.nome ?? 'Jogador',
                          numero: row.numero_camisa ?? p?.numero ?? 0,
                        };
                      }
                    });
                    return map;
                  })()}
                  slotLabels={(() => {
                    const lp = (lineup.lineup_players || []) as any[];
                    const labels: Record<string, string> = {};
                    lp.forEach((row: any) => {
                      if (row.posicao && row.posicao_label) {
                        labels[row.posicao] = row.posicao_label;
                      }
                    });
                    return labels;
                  })()}
                />
              </Card>
            )}
          </section>

          {/* Próximos jogos */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Próximos jogos</h2>
            {loading && <p className="text-neutral-400 text-sm">Carregando...</p>}
            {!loading && matches.length === 0 && (
              <Card className="bg-neutral-900 border border-neutral-800 text-neutral-400 p-4">
                Nenhuma partida futura cadastrada para esta modalidade.
              </Card>
            )}
            {!loading && matches.length > 0 && (
              <div className="space-y-3">
                {matches.map((m) => (
                  <Card key={m.id} className="p-4 bg-neutral-900 border border-neutral-800">
                    <p className="font-semibold text-neutral-50">Westham x {m.adversario}</p>
                    <p className="text-sm text-neutral-400">
                      {new Date(m.data).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {m.local}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* 4 últimas notícias */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Notícias</h2>
            {news.length === 0 && !loading && (
              <p className="text-neutral-500 text-sm">Nenhuma notícia desta modalidade.</p>
            )}
            {news.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {news.map((n) => (
                    <Link key={n.id} href={`/noticias/${n.id}`}>
                      <Card className="overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 transition h-full flex flex-col">
                        {n.imagem_url && (
                          <div className="aspect-video w-full rounded-t-lg overflow-hidden bg-neutral-800 flex items-center justify-center">
                            <img
                              src={n.imagem_url}
                              alt={n.titulo}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="p-3 flex-1 flex flex-col">
                          <p className="font-medium text-neutral-100 line-clamp-2">{n.titulo}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {n.created_at ? new Date(n.created_at).toLocaleDateString('pt-BR') : ''}
                          </p>
                          {n.conteudo && (
                            <p className="text-sm text-neutral-300 mt-2 line-clamp-2 flex-1">
                              {n.conteudo}
                            </p>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                <Link href="/noticias" className="text-orange-400 text-sm font-semibold hover:underline">
                  Ver todas as notícias →
                </Link>
              </div>
            )}
          </section>

          {/* Jogadores destaque (máx 3) */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Destaques</h2>
            {!loading && destaquesPlayers.length === 0 && (
              <p className="text-neutral-500 text-sm">
                Nenhum jogador em destaque para esta modalidade. O admin pode marcar no painel (Editar Jogador → Marcar como destaque).
              </p>
            )}
            {destaquesPlayers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {destaquesPlayers.map((p) => (
                  <Card key={p.id} className="p-4 bg-neutral-900 border border-neutral-800 flex flex-col items-center text-center">
                    {p.foto_url ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-orange-500/50 aspect-square">
                        <img
                          src={p.foto_url}
                          alt={p.nome}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-neutral-700 flex items-center justify-center mb-2 text-orange-400 text-2xl font-bold">
                        {p.nome?.charAt(0) ?? '?'}
                      </div>
                    )}
                    <p className="font-semibold text-neutral-100">{p.nome}</p>
                    <p className="text-sm text-orange-400">#{p.numero ?? p.numero_camisa ?? '?'} · {p.posicao ?? '—'}</p>
                    <p className="text-xs text-neutral-400">{p.gols ?? 0} gols</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      🟨 {p.cartoes_amarelos ?? 0} · 🟥 {p.cartoes_vermelhos ?? 0}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
  );
}
