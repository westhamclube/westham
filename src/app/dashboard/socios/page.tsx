'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';

interface SocioItem {
  id: string;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

export default function DashboardSociosPage() {
  const { user } = useAuth();
  const [socios, setSocios] = useState<SocioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, avatar_url, role')
        .eq('role', 'sócio')
        .order('full_name', { ascending: true });

      if (!error && data) {
        setSocios(
          data.map((p: any) => ({
            id: p.id,
            full_name: p.full_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim(),
            first_name: p.first_name,
            last_name: p.last_name,
            avatar_url: p.avatar_url,
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
              Sócios do Sport Club Westham
            </h1>
            <p className="text-neutral-300 text-sm md:text-base mt-2">
              Lista de sócios cadastrados no sistema. As informações de contato e detalhes
              sensíveis permanecem restritos ao painel administrativo.
            </p>
          </div>
        </div>

        {loading && (
          <p className="text-neutral-400 text-sm">Carregando sócios...</p>
        )}

        {!loading && socios.length === 0 && (
          <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
            Ainda não há sócios cadastrados. Assim que usuários forem promovidos a sócios, eles
            aparecerão aqui.
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {socios.map((socio) => (
            <Card
              key={socio.id}
              className="bg-neutral-900 border border-neutral-800 text-neutral-50 flex items-center gap-4 p-4"
            >
              <div className="w-14 h-14 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center flex-shrink-0 aspect-square">
                {socio.avatar_url ? (
                  <img
                    src={socio.avatar_url}
                    alt={socio.full_name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <span className="text-2xl font-bold text-neutral-500">
                    {socio.full_name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate text-sm">{socio.full_name}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-semibold">
                  Sócio
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

