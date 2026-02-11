'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
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
  const [news, setNews] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [stats, setStats] = useState({ jogadores: 0, gols: 0, vitorias: 0 });
  const [lineup, setLineup] = useState<{
    id: string;
    formacao: string;
    proxima_partida: string;
    descricao?: string;
    lineup_players?: Array<{
      posicao: string;
      numero_camisa: number;
      titular: boolean;
      players: { nome: string; numero_camisa: number } | null;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        { data: matchesData },
        { data: newsData },
        { data: playersData },
        { data: matchesForStats },
        { data: lineupData },
      ] = await Promise.all([
        supabase
          .from('matches')
          .select('*')
          .gte('data', new Date().toISOString())
          .or(`modalidade.eq.${modalidade},modalidade.is.null`)
          .order('data', { ascending: true })
          .limit(10),
        supabase
          .from('news')
          .select('id, titulo, created_at')
          .eq('modalidade', modalidade)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('players')
          .select('id, nome, numero, posicao, gols, foto_url')
          .eq(modalidade === 'campo' ? 'joga_campo' : modalidade === 'fut7' ? 'joga_fut7' : 'joga_futsal', true)
          .order('gols', { ascending: false })
          .limit(10),
        supabase
          .from('matches')
          .select('gols_westham, gols_adversario')
          .not('gols_westham', 'is', null)
          .not('gols_adversario', 'is', null)
          .or(`modalidade.eq.${modalidade},modalidade.is.null`),
        (async () => {
          const { data } = await supabase
            .from('lineups')
            .select('id, formacao, proxima_partida, descricao, modalidade, lineup_players(posicao, numero_camisa, titular, players(nome, numero_camisa))')
            .order('proxima_partida', { ascending: false })
            .limit(5);
          const withModalidade = data?.filter((l: any) => l.modalidade == null || l.modalidade === modalidade);
          return { data: withModalidade?.[0] ?? null };
        })(),
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
      if (playersData) setPlayers(playersData);
      if (matchesForStats) {
        const jogadores = playersData?.length ?? 0;
        const gols = playersData?.reduce((s, p) => s + (Number(p.gols) || 0), 0) ?? 0;
        const vitorias =
          matchesForStats.filter(
            (m: any) => (Number(m.gols_westham) ?? 0) > (Number(m.gols_adversario) ?? 0)
          ).length ?? 0;
        setStats({ jogadores, gols, vitorias });
      }
      if (lineupData) setLineup(lineupData as any);
      setLoading(false);
    };

    load();
  }, [modalidade]);

  const top2Players = players.slice(0, 2);

  return (
    <main className="bg-neutral-950 min-h-screen py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-300">
            Jogos — {LABEL[slug] || slug}
          </h1>

          {/* Estatísticas da modalidade */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Estatísticas</h2>
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center bg-neutral-900 border border-neutral-800 p-4">
                <div className="text-2xl font-bold text-orange-400">{stats.jogadores}</div>
                <div className="text-sm text-neutral-400">Jogadores</div>
              </Card>
              <Card className="text-center bg-neutral-900 border border-neutral-800 p-4">
                <div className="text-2xl font-bold text-orange-400">{stats.gols}</div>
                <div className="text-sm text-neutral-400">Gols</div>
              </Card>
              <Card className="text-center bg-neutral-900 border border-neutral-800 p-4">
                <div className="text-2xl font-bold text-orange-400">{stats.vitorias}</div>
                <div className="text-sm text-neutral-400">Vitórias</div>
              </Card>
            </div>
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
              <Card className="bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div className="p-4 border-b border-neutral-800">
                  <p className="font-semibold text-orange-400">Formação {lineup.formacao || '—'}</p>
                  {lineup.proxima_partida && (
                    <p className="text-sm text-neutral-400">
                      Próxima partida: {new Date(lineup.proxima_partida).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {lineup.descricao && <p className="text-sm text-neutral-300 mt-1">{lineup.descricao}</p>}
                </div>
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-4">
                    <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Titulares</p>
                    <ul className="space-y-1">
                      {(lineup.lineup_players || [])
                        .filter((lp: any) => lp.titular)
                        .map((lp: any) => (
                          <li key={lp.posicao + lp.numero_camisa} className="text-neutral-200 text-sm">
                            <span className="text-orange-400 font-medium">#{lp.numero_camisa}</span>{' '}
                            {lp.players?.nome ?? 'Jogador'} — {lp.posicao}
                          </li>
                        ))}
                      {(lineup.lineup_players || []).filter((lp: any) => lp.titular).length === 0 && (
                        <li className="text-neutral-500 text-sm">Nenhum titular cadastrado.</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 border-t md:border-t-0 md:border-l border-neutral-800">
                    <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Reservas</p>
                    <ul className="space-y-1">
                      {(lineup.lineup_players || [])
                        .filter((lp: any) => !lp.titular)
                        .map((lp: any) => (
                          <li key={lp.posicao + lp.numero_camisa} className="text-neutral-200 text-sm">
                            <span className="text-orange-400 font-medium">#{lp.numero_camisa}</span>{' '}
                            {lp.players?.nome ?? 'Jogador'} — {lp.posicao}
                          </li>
                        ))}
                      {(lineup.lineup_players || []).filter((lp: any) => !lp.titular).length === 0 && (
                        <li className="text-neutral-500 text-sm">Nenhum reserva cadastrado.</li>
                      )}
                    </ul>
                  </div>
                </div>
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

          {/* 3 notícias */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Notícias</h2>
            {news.length === 0 && !loading && (
              <p className="text-neutral-500 text-sm">Nenhuma notícia desta modalidade.</p>
            )}
            {news.length > 0 && (
              <div className="space-y-2">
                {news.map((n) => (
                  <Link key={n.id} href="/noticias">
                    <Card className="p-3 bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 transition">
                      <p className="font-medium text-neutral-100">{n.titulo}</p>
                      <p className="text-xs text-neutral-400">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString('pt-BR') : ''}
                      </p>
                    </Card>
                  </Link>
                ))}
                <Link href="/noticias" className="text-orange-400 text-sm font-semibold hover:underline">
                  Ver todas as notícias →
                </Link>
              </div>
            )}
          </section>

          {/* 2 jogadores destaque */}
          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Destaques</h2>
            {!loading && top2Players.length === 0 && (
              <p className="text-neutral-500 text-sm">Nenhum jogador cadastrado para esta modalidade.</p>
            )}
            {top2Players.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {top2Players.map((p) => (
                  <Card key={p.id} className="p-4 bg-neutral-900 border border-neutral-800">
                    <p className="font-semibold text-neutral-100">{p.nome}</p>
                    <p className="text-sm text-orange-400">#{p.numero} · {p.posicao}</p>
                    <p className="text-xs text-neutral-400">{p.gols ?? 0} gols</p>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
  );
}
