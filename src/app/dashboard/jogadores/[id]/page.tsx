'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';

interface PlayerDetail {
  id: string;
  nome: string;
  numero: number;
  posicao: string;
  idade?: number | null;
  gols: number;
  assists?: number | null;
  nivel: number;
  altura?: number | null;
  peso?: number | null;
  foto_url?: string | null;
}

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('players')
        .select(
          'id, nome, numero, posicao, idade, gols, assists, nivel, altura, peso, foto_url',
        )
        .eq('id', params.id)
        .maybeSingle();

      if (!error && data) {
        setPlayer({
          id: data.id,
          nome: data.nome,
          numero: data.numero,
          posicao: data.posicao,
          idade: data.idade,
          gols: Number(data.gols) || 0,
          assists: data.assists,
          nivel: Number(data.nivel) || 0,
          altura: data.altura,
          peso: data.peso,
          foto_url: data.foto_url,
        });
      } else {
        setPlayer(null);
      }
      setLoading(false);
    };

    load();
  }, [params.id]);

  if (!user) return null;

  const canViewDetails = user.role === 'sócio' || user.role === 'admin';

  return (
    <main className="bg-neutral-950 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Link
              href="/dashboard/jogadores"
              className="text-sm text-orange-400 hover:text-orange-300 mb-2 inline-block"
            >
              ← Voltar para elenco
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-orange-300">
              Perfil do jogador
            </h1>
            <p className="text-neutral-300 text-sm md:text-base mt-2">
              Estatísticas oficiais do elenco do Sport Club Westham.
            </p>
          </div>
        </div>

        {loading && (
          <p className="text-neutral-400 text-sm">Carregando informações do jogador...</p>
        )}

        {!loading && !player && (
          <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
            Jogador não encontrado. Verifique com o administrador se o cadastro está correto.
          </Card>
        )}

        {!loading && player && !canViewDetails && (
          <Card className="bg-neutral-900 border border-amber-500/60 text-neutral-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                {player.foto_url ? (
                  <img
                    src={player.foto_url}
                    alt={player.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-neutral-500">
                    {player.nome[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-300">Conteúdo exclusivo</p>
                <p className="font-bold text-lg">
                  #{player.numero} • {player.nome}
                </p>
                <p className="text-xs text-neutral-400">Posição: {player.posicao}</p>
              </div>
            </div>
            <p className="text-sm text-neutral-200">
              Os detalhes completos de desempenho e estatísticas dos jogadores são{' '}
              <strong>exclusivos para sócios do clube</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/virar-socio">
                <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500">
                  Seja sócio para ver estatísticas
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Voltar ao dashboard
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {!loading && player && canViewDetails && (
          <Card className="bg-neutral-900 border border-neutral-800 text-neutral-50 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                {player.foto_url ? (
                  <img
                    src={player.foto_url}
                    alt={player.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-neutral-500">
                    {player.nome[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Jogador do elenco
                </p>
                <h2 className="text-2xl font-extrabold">
                  #{player.numero} • {player.nome}
                </h2>
                <p className="text-sm text-neutral-300">Posição: {player.posicao}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral-400">Gols</p>
                <p className="text-xl font-bold text-orange-300">{player.gols}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral-400">Assistências</p>
                <p className="text-xl font-bold text-orange-300">
                  {player.assists ? Number(player.assists) : 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral-400">Nível</p>
                <p className="text-xl font-bold text-orange-300">
                  {player.nivel ? `${player.nivel}/10` : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral-400">Idade</p>
                <p className="font-semibold">
                  {player.idade ? `${player.idade} anos` : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral-400">Altura</p>
                <p className="font-semibold">
                  {player.altura ? `${player.altura.toFixed(2)} m` : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral-400">Peso</p>
                <p className="font-semibold">
                  {player.peso ? `${player.peso} kg` : '—'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

