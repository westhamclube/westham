'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';

export default function MarcarAmistosoPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const mensagem = `FORMULÁRIO: Marcar amistoso / contato com o time

Nome: ${nome}
E-mail: ${email}
Telefone: ${telefone}

Intenções / descrição:
${descricao}`;

      const { error: err } = await supabase.from('support_messages').insert({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        mensagem,
        tipo: 'amistoso',
      });

      if (err) throw err;

      setSent(true);
      setNome('');
      setEmail('');
      setTelefone('');
      setDescricao('');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-neutral-950 text-neutral-50 min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div>
            <Link
              href="/"
              className="text-sm text-orange-400 hover:text-orange-300 mb-2 inline-block"
            >
              ← Voltar à página inicial
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400">
              Marcar um amistoso
            </h1>
            <p className="text-neutral-300 text-sm md:text-base mt-2">
              Quer marcar um amistoso com o Sport Club Westham? Preencha o formulário abaixo e
              nossa equipe entrará em contato o mais breve possível.
            </p>
          </div>

          <Card className="bg-neutral-900/70 border border-neutral-800 p-6">
            {sent ? (
              <div className="p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm">
                Formulário enviado com sucesso! Aguarde que entraremos em contato o mais breve possível.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  label="E-mail para retorno"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Telefone / WhatsApp"
                  placeholder="(51) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Descrição (intenções)
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-neutral-900 bg-white"
                    placeholder="Conte sobre o amistoso que deseja marcar: data preferida, modalidade (Campo, FUT 7 ou Futsal), local, etc."
                  />
                </div>

                <Button type="submit" isLoading={loading} className="w-full">
                  Enviar solicitação
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
