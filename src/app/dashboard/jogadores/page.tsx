'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';

interface PlayerListItem {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  gols: number;
  nivel: number;
  foto_url?: string | null;
}

export default function DashboardJogadoresPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<PlayerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, nome, numero, posicao, gols, nivel, foto_url')
        .order('numero', { ascending: true });

      if (!error && data) {
        setPlayers(
          data.map((p: any) => ({
            id: p.id,
            nome: p.nome,
            numero: p.numero,
            posicao: p.posicao,
            gols: Number(p.gols) || 0,
            nivel: Number(p.nivel) || 0,
            foto_url: p.foto_url,
          })),
        );
      }
      setLoading(false);
    };

    load();
  }, []);

  if (!user) return null;

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
              Elenco do Sport Club Westham
            </h1>
            <p className="text-neutral-300 text-sm md:text-base mt-2">
              Veja os jogadores cadastrados pelo administrador. Detalhes completos de estatísticas
              estão disponíveis para sócios do clube.
            </p>
          </div>
        </div>

        {loading && (
          <p className="text-neutral-400 text-sm">Carregando elenco...</p>
        )}

        {!loading && players.length === 0 && (
          <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
            Nenhum jogador cadastrado ainda. O administrador pode adicionar atletas pelo painel.
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Card
              key={player.id}
              className="bg-neutral-900 border border-neutral-800 text-neutral-50 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {player.foto_url ? (
                    <img
                      src={player.foto_url}
                      alt={player.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-neutral-500">
                      {player.nome?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate text-sm">{player.nome}</p>
                  <p className="text-xs text-neutral-400">
                    #{player.numero} • {player.posicao}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-neutral-300 mb-3">
                <span>
                  Gols:{' '}
                  <span className="font-semibold text-orange-300">
                    {player.gols}
                  </span>
                </span>
                <span>
                  Nível:{' '}
                  <span className="font-semibold text-orange-300">
                    {player.nivel || 0}/10
                  </span>
                </span>
              </div>
              <Link
                href={`/dashboard/jogadores/${player.id}`}
                className="mt-auto inline-flex justify-center px-3 py-2 rounded-lg text-xs font-semibold bg-orange-600 text-white hover:bg-orange-500 transition"
              >
                Ver perfil do jogador
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

