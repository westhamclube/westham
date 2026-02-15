'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';

interface HistoryBlock {
  id: string;
  titulo: string;
  conteudo: string | null;
  ordem: number;
}

interface HistoryPhoto {
  id: string;
  history_id: string;
  url: string;
  legenda: string | null;
  ordem: number;
}

export default function HistoriaPage() {
  const [blocks, setBlocks] = useState<HistoryBlock[]>([]);
  const [photos, setPhotos] = useState<HistoryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [hRes, pRes] = await Promise.all([
        supabase.from('club_history').select('*').order('ordem', { ascending: true }),
        supabase.from('club_history_photos').select('*').order('ordem', { ascending: true }),
      ]);
      if (!hRes.error && hRes.data) {
        setBlocks(
          hRes.data.map((b: any) => ({
            id: b.id,
            titulo: b.titulo || 'História do Westham',
            conteudo: b.conteudo,
            ordem: b.ordem ?? 0,
          }))
        );
      }
      if (!pRes.error && pRes.data) {
        setPhotos(
          pRes.data.map((p: any) => ({
            id: p.id,
            history_id: p.history_id,
            url: p.url,
            legenda: p.legenda,
            ordem: p.ordem ?? 0,
          }))
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
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-300">
            História do Clube
          </h1>
          <p className="text-neutral-300 text-sm md:text-base">
            Conheça a trajetória do Sport Club Westham e os momentos que marcaram a história do clube em Guaíba.
          </p>

          {loading && <p className="text-neutral-400 text-sm">Carregando...</p>}

          {!loading && blocks.length === 0 && (
            <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200 p-8">
              <p className="text-center">
                A história do clube ainda não foi cadastrada. O administrador pode editá-la pelo painel (aba História).
              </p>
            </Card>
          )}

          {!loading &&
            blocks.map((block) => (
              <Card
                key={block.id}
                className="bg-neutral-900 border border-neutral-800 text-neutral-100"
              >
                <h2 className="text-2xl font-bold text-orange-300 mb-4">{block.titulo}</h2>
                <p className="text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {block.conteudo || ''}
                </p>
              </Card>
            ))}

          {!loading && photos.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-orange-300 mb-4">Galeria</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700"
                  >
                    <img
                      src={p.url}
                      alt={p.legenda || 'Foto do clube'}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://via.placeholder.com/200?text=Westham';
                      }}
                    />
                    {p.legenda && (
                      <p className="p-2 text-xs text-neutral-400 text-center">{p.legenda}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
