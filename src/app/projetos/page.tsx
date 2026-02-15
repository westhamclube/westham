'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  tipo: string | null;
  destaque: boolean;
  imagem_capa_url?: string | null;
  video_url?: string | null;
  created_at: string;
}

function getYouTubeEmbed(url: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch { return null; }
  return null;
}

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [inscreverProject, setInscreverProject] = useState<Project | null>(null);
  const [inscricaoNome, setInscricaoNome] = useState('');
  const [inscricaoEmail, setInscricaoEmail] = useState('');
  const [inscricaoTelefone, setInscricaoTelefone] = useState('');
  const [inscricaoMsg, setInscricaoMsg] = useState('');
  const [inscricaoLoading, setInscricaoLoading] = useState(false);
  const [inscricaoSent, setInscricaoSent] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('destaque', { ascending: false })
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
            video_url: p.video_url,
            created_at: p.created_at,
          })),
        );
      }
      setLoading(false);
    };

    load();
  }, []);

  const handleInscrever = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inscreverProject || !inscricaoNome.trim() || !inscricaoEmail.trim() || !inscricaoTelefone.trim()) return;
    setInscricaoLoading(true);
    const mensagem = `FORMULÁRIO: Inscrição em projeto

Projeto: ${inscreverProject.titulo} (ID: ${inscreverProject.id})

Nome: ${inscricaoNome}
E-mail: ${inscricaoEmail}
Telefone: ${inscricaoTelefone}

Mensagem adicional:
${inscricaoMsg || '(não informada)'}`;
    const { error } = await supabase.from('support_messages').insert({
      nome: inscricaoNome.trim(),
      email: inscricaoEmail.trim(),
      telefone: inscricaoTelefone.trim(),
      mensagem,
      tipo: 'projetos',
    });
    setInscricaoLoading(false);
    if (error) return;
    setInscricaoSent(true);
    setTimeout(() => {
      setInscreverProject(null);
      setInscricaoSent(false);
      setInscricaoNome('');
      setInscricaoEmail('');
      setInscricaoTelefone('');
      setInscricaoMsg('');
    }, 2000);
  };

  return (
    <>
      <Header />
      <main className="bg-neutral-950 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-300">
            Projetos
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
                  <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center">
                    <img
                      src={p.imagem_capa_url}
                      alt={p.titulo}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://via.placeholder.com/300?text=Projeto+Westham';
                      }}
                    />
                  </div>
                )}
                {p.video_url && getYouTubeEmbed(p.video_url) && (
                  <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden">
                    <iframe className="w-full h-full" src={getYouTubeEmbed(p.video_url)!} title={p.titulo} allowFullScreen />
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
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          p.status === 'ativo'
                            ? 'bg-emerald-900/40 text-emerald-300'
                            : p.status === 'inscricoes_abertas'
                            ? 'bg-orange-900/40 text-orange-300'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {p.status === 'inscricoes_abertas' ? 'Inscrições abertas' : p.status === 'encerrado' ? 'Encerrado' : 'Ativo'}
                      </span>
                      <span>
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString('pt-BR')
                          : ''}
                      </span>
                    </div>
                    {(p.status === 'inscricoes_abertas' || p.status === 'ativo') && (
                      <Button size="sm" className="w-full mt-2" onClick={() => setInscreverProject(p)}>
                        Inscrever-se
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {inscreverProject && (
          <>
            <div className="fixed inset-0 z-40 bg-black/60" onClick={() => !inscricaoLoading && setInscreverProject(null)} aria-hidden />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-neutral-900 border border-neutral-600 rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Inscrever-se em: {inscreverProject.titulo}</h3>
              {inscricaoSent ? (
                <p className="text-emerald-300 py-4">Inscrição enviada! Entraremos em contato em breve.</p>
              ) : (
                <form onSubmit={handleInscrever} className="space-y-4">
                  <Input label="Nome completo" value={inscricaoNome} onChange={(e) => setInscricaoNome(e.target.value)} required />
                  <Input type="email" label="E-mail" value={inscricaoEmail} onChange={(e) => setInscricaoEmail(e.target.value)} required />
                  <Input label="Telefone / WhatsApp" value={inscricaoTelefone} onChange={(e) => setInscricaoTelefone(e.target.value)} placeholder="(51) 99999-9999" required />
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-1">Mensagem (opcional)</label>
                    <textarea value={inscricaoMsg} onChange={(e) => setInscricaoMsg(e.target.value)} rows={3} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900" placeholder="Alguma informação adicional..." />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={inscricaoLoading}>{inscricaoLoading ? 'Enviando...' : 'Enviar inscrição'}</Button>
                    <Button type="button" variant="secondary" onClick={() => setInscreverProject(null)} disabled={inscricaoLoading}>Cancelar</Button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

