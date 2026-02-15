'use client';

import { useAuth } from '@/context/AuthContext';
import { useCashFlowAccess } from '@/hooks/useCashFlowAccess';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  type CashFlowTransaction,
  type CashFlowCategory,
  type CashFlowTipo,
} from '@/types';
import { generateCashFlowPdf } from '@/lib/generateCashFlowPdf';

const CATEGORIAS: { value: CashFlowCategory; label: string }[] = [
  { value: 'patrocinio', label: 'Patrocínio' },
  { value: 'despesa_jogadores', label: 'Despesa Jogadores' },
  { value: 'despesa_locomocao', label: 'Despesa Locomoção' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'arbitragem', label: 'Arbitragem' },
  { value: 'material_esportivo', label: 'Material Esportivo' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'uniformes', label: 'Uniformes' },
  { value: 'outros', label: 'Outros' },
];

function formatMoney(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}

function formatDate(s: string): string {
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');
}

function getCategoriaLabel(cat: string): string {
  return CATEGORIAS.find((c) => c.value === cat)?.label ?? cat;
}

export default function CaixaPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: accessLoading } = useCashFlowAccess();
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  const [formTipo, setFormTipo] = useState<CashFlowTipo>('entrada');
  const [formCategoria, setFormCategoria] = useState<CashFlowCategory>('patrocinio');
  const [formDescricao, setFormDescricao] = useState('');
  const [formValor, setFormValor] = useState('');
  const [formData, setFormData] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!accessLoading && user && !hasAccess) {
      router.push('/dashboard');
      return;
    }
  }, [user, authLoading, accessLoading, hasAccess, router]);

  const loadTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from('cash_flow_transactions')
      .select('*')
      .order('data_movimento', { ascending: false })
      .order('created_at', { ascending: false });

    if (filterYear) {
      query = query.gte('data_movimento', `${filterYear}-01-01`);
      query = query.lte('data_movimento', `${filterYear}-12-31`);
    }
    if (filterMonth) {
      const m = filterMonth.padStart(2, '0');
      query = query.gte('data_movimento', `${filterYear || '2020'}-${m}-01`);
      const lastDay = new Date(parseInt(filterYear || '2020', 10), parseInt(filterMonth, 10), 0).getDate();
      query = query.lte('data_movimento', `${filterYear || '2020'}-${m}-${lastDay.toString().padStart(2, '0')}`);
    }
    if (filterDay) {
      const d = filterDay.padStart(2, '0');
      const m = filterMonth.padStart(2, '0') || '01';
      query = query.eq('data_movimento', `${filterYear || '2020'}-${m}-${d}`);
    }

    const { data, error } = await query;
    if (error) {
      setFeedback({ type: 'error', message: error.message });
      setTransactions([]);
    } else {
      setTransactions(
        (data || []).map((r: any) => ({
          id: r.id,
          tipo: r.tipo,
          categoria: r.categoria,
          descricao: r.descricao,
          valor: Number(r.valor),
          data_movimento: r.data_movimento,
          created_by: r.created_by,
          created_at: r.created_at,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (hasAccess) loadTransactions();
  }, [hasAccess, filterDay, filterMonth, filterYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formDescricao.trim() || !formValor || parseFloat(formValor) <= 0) {
      setFeedback({ type: 'error', message: 'Preencha descrição e valor válido.' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('cash_flow_transactions').insert({
      tipo: formTipo,
      categoria: formCategoria,
      descricao: formDescricao.trim(),
      valor: parseFloat(formValor),
      data_movimento: formData,
      created_by: user.id,
    });
    setSubmitting(false);
    if (error) {
      setFeedback({ type: 'error', message: error.message });
      return;
    }
    setFeedback({ type: 'success', message: 'Movimentação registrada!' });
    setFormDescricao('');
    setFormValor('');
    loadTransactions();
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      title: 'Excluir movimentação',
      message: 'Excluir esta movimentação?',
      onConfirm: async () => {
        const { error } = await supabase.from('cash_flow_transactions').delete().eq('id', id);
        if (error) setFeedback({ type: 'error', message: error.message });
        else {
          setFeedback({ type: 'success', message: 'Excluído!' });
          loadTransactions();
        }
      },
    });
  };

  const handleGeneratePdf = async () => {
    if (transactions.length === 0) {
      setFeedback({ type: 'error', message: 'Não há movimentações para gerar o extrato.' });
      return;
    }
    setGeneratingPdf(true);
    const start = filterYear && filterMonth
      ? `${filterYear}-${filterMonth.padStart(2, '0')}-01`
      : `${filterYear}-01-01`;
    const end = filterYear && filterMonth
      ? `${filterYear}-${filterMonth.padStart(2, '0')}-${new Date(parseInt(filterYear, 10), parseInt(filterMonth, 10), 0).getDate().toString().padStart(2, '0')}`
      : `${filterYear}-12-31`;

    const entradas = transactions.filter((t) => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0);
    const saidas = transactions.filter((t) => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);
    const saldo = entradas - saidas;

    await generateCashFlowPdf(transactions, start, end, 0, saldo);
    setGeneratingPdf(false);
    setFeedback({ type: 'success', message: 'PDF gerado com sucesso!' });
  };

  const totalEntradas = transactions.filter((t) => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0);
  const totalSaidas = transactions.filter((t) => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  if (authLoading || accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !hasAccess) return null;

  return (
    <>
      <Header />
      <main className="bg-neutral-950 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-6">
          {feedback && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-900/30 border border-emerald-500/60 text-emerald-200'
                  : 'bg-red-900/30 border border-red-500/60 text-red-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <Card className="mb-8 bg-gradient-to-r from-black via-neutral-900 to-orange-600 text-white shadow-2xl border border-orange-500/60">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">💰 Fluxo de Caixa</h1>
                <p className="text-orange-100">
                  Controle de entradas, saídas, patrocínios e despesas do clube
                </p>
              </div>
              <div className="text-5xl">📊</div>
            </div>
          </Card>

          {/* Filtros */}
          <Card className="mb-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Filtros</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dia</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Todos"
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mês</label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg"
                >
                  <option value="">Todos</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ano</label>
                <input
                  type="number"
                  min={2020}
                  max={2030}
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <Button size="sm" onClick={loadTransactions}>
                Aplicar
              </Button>
              <Button size="sm" variant="secondary" onClick={handleGeneratePdf} disabled={loading || transactions.length === 0 || generatingPdf}>
                {generatingPdf ? 'Gerando...' : '📄 Gerar Extrato PDF'}
              </Button>
            </div>
          </Card>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-emerald-50 border-2 border-emerald-200">
              <p className="text-sm font-semibold text-emerald-800">Total Entradas</p>
              <p className="text-2xl font-bold text-emerald-700">{formatMoney(totalEntradas)}</p>
            </Card>
            <Card className="bg-red-50 border-2 border-red-200">
              <p className="text-sm font-semibold text-red-800">Total Saídas</p>
              <p className="text-2xl font-bold text-red-700">{formatMoney(totalSaidas)}</p>
            </Card>
            <Card className={`border-2 ${saldo >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-sm font-semibold text-gray-800">Saldo do Período</p>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatMoney(saldo)}</p>
            </Card>
          </div>

          {/* Formulário */}
          <Card className="mb-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Nova Movimentação</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as CashFlowTipo)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                <select
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value as CashFlowCategory)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Descrição"
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                placeholder="Ex: Pagamento arbitragem jogo dia 10"
                required
              />
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                min="0"
                value={formValor}
                onChange={(e) => setFormValor(e.target.value)}
                placeholder="0,00"
                required
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={formData}
                  onChange={(e) => setFormData(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Registrar'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Lista */}
          <Card className="shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Movimentações</h2>
            {loading ? (
              <p className="text-gray-600 py-8">Carregando...</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-600 py-8">Nenhuma movimentação no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Categoria</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Descrição</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-800">Valor</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-800">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{formatDate(t.data_movimento)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${t.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{getCategoriaLabel(t.categoria)}</td>
                        <td className="py-3 px-4 text-gray-700 max-w-xs truncate" title={t.descricao}>{t.descricao}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.tipo === 'entrada' ? '+' : '-'} {formatMoney(t.valor)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
      {confirmModal && (
        <ConfirmModal
          open
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </>
  );
}
