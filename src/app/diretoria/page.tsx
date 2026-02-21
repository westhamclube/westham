'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Ata = {
  id: string;
  titulo: string;
  conteudo: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export default function DiretoriaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const canAccess = user && (user.role === 'diretor' || user.role === 'admin');

  useEffect(() => {
    if (!authLoading && !canAccess) {
      router.replace('/dashboard');
      return;
    }
    if (!canAccess) return;

    const load = async () => {
      const { data, error } = await supabase
        .from('atas')
        .select('id, titulo, conteudo, created_by, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        setFeedback({ type: 'error', message: error.message });
        setLoading(false);
        return;
      }
      setAtas((data || []) as Ata[]);
      setLoading(false);
    };
    load();
  }, [authLoading, canAccess, router]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value ?? undefined);
    editorRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      showFeedback('error', 'Informe o título da ata.');
      return;
    }
    const html = editorRef.current?.innerHTML ?? '';

    if (editingId) {
      const { error } = await supabase
        .from('atas')
        .update({ titulo: titulo.trim(), conteudo: html, updated_at: new Date().toISOString() })
        .eq('id', editingId);
      if (error) {
        showFeedback('error', error.message);
        return;
      }
      setAtas((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, titulo: titulo.trim(), conteudo: html } : a))
      );
      showFeedback('success', 'Ata atualizada!');
      setEditingId(null);
    } else {
      const { data, error } = await supabase
        .from('atas')
        .insert({ titulo: titulo.trim(), conteudo: html, created_by: user?.id ?? null })
        .select('id, titulo, conteudo, created_by, created_at, updated_at')
        .single();
      if (error) {
        showFeedback('error', error.message);
        return;
      }
      setAtas((prev) => [data as Ata, ...prev]);
      showFeedback('success', 'Ata publicada!');
    }
    setTitulo('');
    setConteudo('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const openEdit = (ata: Ata) => {
    setEditingId(ata.id);
    setTitulo(ata.titulo);
    setConteudo(ata.conteudo);
    if (editorRef.current) editorRef.current.innerHTML = ata.conteudo || '';
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitulo('');
    setConteudo('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta ata?')) return;
    const { error } = await supabase.from('atas').delete().eq('id', id);
    if (error) {
      showFeedback('error', error.message);
      return;
    }
    setAtas((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) cancelEdit();
    showFeedback('success', 'Ata excluída.');
  };

  if (authLoading || !user) {
    return (
      <>
        <Header />
        <main className="bg-neutral-950 min-h-screen py-10 flex items-center justify-center">
          <p className="text-neutral-400">Carregando...</p>
        </main>
      </>
    );
  }

  if (!canAccess) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="bg-neutral-950 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <h1 className="text-3xl font-bold text-amber-300">Diretoria — Atas</h1>
          <p className="text-neutral-400 text-sm">
            Relatórios de reuniões, valores, horários, contratados e demais registros. Somente diretores e administradores têm acesso.
          </p>

          {feedback && (
            <div
              className={`p-4 rounded-lg ${
                feedback.type === 'success' ? 'bg-emerald-900/40 text-emerald-200' : 'bg-red-900/40 text-red-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <Card className="p-6 bg-neutral-900 border border-neutral-700">
            <h2 className="text-xl font-bold text-neutral-100 mb-4">
              {editingId ? 'Editar ata' : 'Nova ata'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Ata da reunião de 20/02/2025"
                className="bg-neutral-800 border-neutral-600 text-neutral-100"
              />
              <div>
                <label className="block text-sm font-semibold text-neutral-300 mb-2">Conteúdo (formatação)</label>
                <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-lg bg-neutral-800 border border-neutral-600">
                  <button type="button" onClick={() => execCmd('bold')} className="px-3 py-1.5 rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 font-bold text-sm" title="Negrito">N</button>
                  <button type="button" onClick={() => execCmd('italic')} className="px-3 py-1.5 rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 italic text-sm" title="Itálico">I</button>
                  <button type="button" onClick={() => execCmd('underline')} className="px-3 py-1.5 rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 text-sm underline" title="Sublinhado">S</button>
                  <span className="text-neutral-500 mx-1">|</span>
                  <button type="button" onClick={() => execCmd('justifyLeft')} className="px-3 py-1.5 rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 text-sm" title="Alinhar à esquerda">≡ Esq</button>
                  <button type="button" onClick={() => execCmd('justifyCenter')} className="px-3 py-1.5 rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 text-sm" title="Centralizar">≡ Centro</button>
                  <button type="button" onClick={() => execCmd('justifyRight')} className="px-3 py-1.5 rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 text-sm" title="Alinhar à direita">≡ Dir</button>
                  <span className="text-neutral-500 mx-1">|</span>
                  <button type="button" onClick={() => execCmd('insertUnorderedList')} className="px-3 py-1.5 rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 text-sm" title="Lista">• Lista</button>
                  <button type="button" onClick={() => execCmd('insertOrderedList')} className="px-3 py-1.5 rounded bg-neutral-700 text-neutral-200 hover:bg-neutral-600 text-sm" title="Lista numerada">1. Lista</button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[200px] w-full p-4 rounded-lg bg-neutral-800 border border-neutral-600 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500 prose prose-invert max-w-none"
                  data-placeholder="Digite o conteúdo da ata: reuniões, valores, horários, contratados..."
                  onInput={() => setConteudo(editorRef.current?.innerHTML ?? '')}
                  suppressContentEditableWarning
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Salvar alterações' : 'Publicar ata'}
                </Button>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <section>
            <h2 className="text-xl font-bold text-neutral-200 mb-4">Atas publicadas</h2>
            {loading && <p className="text-neutral-500">Carregando...</p>}
            {!loading && atas.length === 0 && (
              <p className="text-neutral-500">Nenhuma ata ainda. Use o formulário acima para publicar.</p>
            )}
            {!loading && atas.length > 0 && (
              <div className="space-y-4">
                {atas.map((ata) => (
                  <Card key={ata.id} className="p-5 bg-neutral-900 border border-neutral-700">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-orange-300 mb-2">{ata.titulo}</h3>
                        <div
                          className="text-sm text-neutral-300 prose prose-invert prose-sm max-w-none line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: ata.conteudo || '' }}
                        />
                        <p className="text-xs text-neutral-500 mt-2">
                          {new Date(ata.updated_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(ata)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="secondary" className="text-red-400 hover:bg-red-900/30" onClick={() => handleDelete(ata.id)}>
                          Excluir
                        </Button>
                      </div>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-amber-400 hover:underline">Ver conteúdo completo</summary>
                      <div
                        className="mt-2 p-3 rounded bg-neutral-800 text-neutral-200 text-sm prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: ata.conteudo || '' }}
                      />
                    </details>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
