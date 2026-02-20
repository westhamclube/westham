'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
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
  const [pastMatches, setPastMatches] = useState<Match[]>([]);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [matchStats, setMatchStats] = useState<Record<string, { player_id: string; nome: string; numero: number; gols: number; assistencias: number }[]>>({});
  const [news, setNews] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [modalidadeStats, setModalidadeStats] = useState<{ ultimo_resultado: string | null; gols_total: number; vitorias: number; derrotas: number } | null>(null);
  const [allPlayersMap, setAllPlayersMap] = useState<Record<string, { nome: string; numero: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        { data: matchesData },
        { data: pastMatchesData },
        { data: newsData },
        { data: allPlayersData },
        { data: statsData },
      ] = await Promise.all([
        supabase
          .from('matches')
          .select('*')
          .gte('data', new Date().toISOString())
          .or(`modalidade.eq.${modalidade},modalidade.is.null`)
          .order('data', { ascending: true })
          .limit(10),
        supabase
          .from('matches')
          .select('*')
          .lt('data', new Date().toISOString())
          .or(`modalidade.eq.${modalidade},modalidade.is.null`)
          .order('data', { ascending: false })
          .limit(15),
        (async () => {
          const { data, error } = await supabase
            .from('news')
            .select('id, titulo, conteudo, imagem_url, created_at')
            .eq('modalidade', modalidade)
            .order('destaque', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(4);
          if (error) return { data: [] };
          return { data: data || [] };
        })(),
        (async () => {
          const { data, error } = await supabase.from('players').select('*');
          if (error) {
            console.warn('[Jogos] Erro ao buscar jogadores:', error.message);
            return { data: [] };
          }
          return { data: data || [] };
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
      if (pastMatchesData) {
        setPastMatches(
          pastMatchesData.map((m: any) => ({
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
      const filteredPlayers = (allPlayersData || []).filter((p: any) => p[jogaKey] !== false);
      setPlayers(filteredPlayers);
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

  const loadMatchStats = async (matchId: string) => {
    if (matchStats[matchId]) return;
    const { data } = await supabase
      .from('match_player_stats')
      .select('player_id, gols, assistencias')
      .eq('match_id', matchId);
    const list = (data || []).map((r: any) => ({
      player_id: r.player_id,
      nome: allPlayersMap[r.player_id]?.nome ?? 'Jogador',
      numero: allPlayersMap[r.player_id]?.numero ?? 0,
      gols: r.gols ?? 0,
      assistencias: r.assistencias ?? 0,
    })).filter((x) => x.gols > 0 || x.assistencias > 0);
    setMatchStats((prev) => ({ ...prev, [matchId]: list }));
  };

  const golsKey = modalidade === 'campo' ? 'gols_campo' : modalidade === 'fut7' ? 'gols_fut7' : 'gols_futsal';
  const assistsKey = modalidade === 'campo' ? 'assistencias_campo' : modalidade === 'fut7' ? 'assistencias_fut7' : 'assistencias_futsal';
  const melhorGoleiroKey = modalidade === 'campo' ? 'melhor_goleiro_campo' : modalidade === 'fut7' ? 'melhor_goleiro_fut7' : 'melhor_goleiro_futsal';
  const melhorGoleiro = players.find((p: any) => !!p[melhorGoleiroKey]);
  const artilheiro = [...players].filter((p: any) => (p[golsKey] ?? 0) > 0).sort((a: any, b: any) => (b[golsKey] ?? 0) - (a[golsKey] ?? 0))[0];
  const melhorAssistente = [...players].filter((p: any) => (p[assistsKey] ?? 0) > 0).sort((a: any, b: any) => (b[assistsKey] ?? 0) - (a[assistsKey] ?? 0))[0];

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

          {/* Jogos anteriores */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Jogos anteriores</h2>
            {loading && <p className="text-neutral-400 text-sm">Carregando...</p>}
            {!loading && pastMatches.length === 0 && (
              <p className="text-neutral-500 text-sm">Nenhum jogo anterior cadastrado para esta modalidade.</p>
            )}
            {!loading && pastMatches.length > 0 && (
              <div className="space-y-2">
                {pastMatches.map((m) => (
                  <Card key={m.id} className="p-4 bg-neutral-900 border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedMatchId((prev) => (prev === m.id ? null : m.id));
                        if (expandedMatchId !== m.id) loadMatchStats(m.id);
                      }}
                      className="w-full text-left"
                    >
                      <p className="font-semibold text-neutral-50">
                        Westham x {m.adversario}
                        {(m.gols_westham != null && m.gols_adversario != null) && (
                          <span className="ml-2 text-orange-400">
                            {m.gols_westham} x {m.gols_adversario}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {new Date(m.data).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {m.local}
                      </p>
                    </button>
                    {expandedMatchId === m.id && (
                      <div className="mt-4 pt-4 border-t border-neutral-700 space-y-3">
                        {(m.gols_westham != null && m.gols_adversario != null) && (
                          <p className="text-lg font-bold text-orange-400">
                            Placar: Westham {m.gols_westham} x {m.gols_adversario} {m.adversario}
                          </p>
                        )}
                        {matchStats[m.id]?.length ? (
                          <>
                            <div>
                              <p className="text-sm font-semibold text-neutral-300 mb-1">Gols na partida</p>
                              <ul className="text-sm text-neutral-400 space-y-0.5">
                                {matchStats[m.id]
                                  .filter((x) => x.gols > 0)
                                  .map((x) => (
                                    <li key={x.player_id}>
                                      {x.nome} #{x.numero} — {x.gols} {x.gols === 1 ? 'gol' : 'gols'}
                                    </li>
                                  ))}
                                {matchStats[m.id].filter((x) => x.gols > 0).length === 0 && (
                                  <li>Nenhum gol registrado por jogador.</li>
                                )}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-300 mb-1">Assistências na partida</p>
                              <ul className="text-sm text-neutral-400 space-y-0.5">
                                {matchStats[m.id]
                                  .filter((x) => x.assistencias > 0)
                                  .map((x) => (
                                    <li key={x.player_id}>
                                      {x.nome} #{x.numero} — {x.assistencias} {x.assistencias === 1 ? 'assistência' : 'assistências'}
                                    </li>
                                  ))}
                                {matchStats[m.id].filter((x) => x.assistencias > 0).length === 0 && (
                                  <li>Nenhuma assistência registrada.</li>
                                )}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <p className="text-neutral-500 text-sm">Nenhum gol ou assistência cadastrado para esta partida. O admin pode preencher ao editar a partida.</p>
                        )}
                      </div>
                    )}
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

          {/* Jogadores Destaque: artilheiro (auto), melhor assistências (auto), melhor goleiro (admin) */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Jogadores Destaque</h2>
            {!loading && !melhorGoleiro && !artilheiro && !melhorAssistente && (
              <p className="text-neutral-500 text-sm">
                Nenhum jogador destaque para esta modalidade. O artilheiro e o melhor em assistências são calculados automaticamente; o admin marca o melhor goleiro na edição do jogador.
              </p>
            )}
            {(melhorGoleiro || artilheiro || melhorAssistente) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {artilheiro && (
                  <Card className="p-4 bg-neutral-900 border border-neutral-800 text-center">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Artilheiro</p>
                    <p className="font-bold text-orange-400">{artilheiro.nome}</p>
                    <p className="text-sm text-neutral-400">#{artilheiro.numero ?? artilheiro.numero_camisa ?? '?'} · {artilheiro[golsKey] ?? 0} gols</p>
                  </Card>
                )}
                {melhorAssistente && (
                  <Card className="p-4 bg-neutral-900 border border-neutral-800 text-center">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Melhor em assistências</p>
                    <p className="font-bold text-orange-400">{melhorAssistente.nome}</p>
                    <p className="text-sm text-neutral-400">#{melhorAssistente.numero ?? melhorAssistente.numero_camisa ?? '?'} · {melhorAssistente[assistsKey] ?? 0} assistências</p>
                  </Card>
                )}
                {melhorGoleiro && (
                  <Card className="p-4 bg-neutral-900 border border-neutral-800 text-center">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Melhor goleiro</p>
                    <p className="font-bold text-orange-400">{melhorGoleiro.nome}</p>
                    <p className="text-sm text-neutral-400">#{melhorGoleiro.numero ?? melhorGoleiro.numero_camisa ?? '?'}</p>
                  </Card>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
  );
}
