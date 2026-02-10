'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';

export default function VirarSocioPage() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.from('socio_requests').insert({
        nome_completo: nomeCompleto.trim(),
        cpf: cpf.trim(),
        data_nascimento: dataNascimento.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
      });
      if (err) throw err;
      setSent(true);
      setNomeCompleto('');
      setCpf('');
      setDataNascimento('');
      setEmail('');
      setTelefone('');
      setEndereco('');
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
        <div className="max-w-2xl mx-auto px-6 space-y-8">
          <div>
            <Link href="/" className="text-sm text-orange-400 hover:text-orange-300 mb-2 inline-block">
              ← Voltar ao início
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400">
              Como virar sócio
            </h1>
            <p className="text-neutral-300 mt-2">
              A sociedade de sócios é o coração do Sport Club Westham. Preencha o formulário abaixo
              e entraremos em contato para concluir sua adesão.
            </p>
          </div>

          <Card className="bg-neutral-900/70 border border-neutral-800 p-6">
            <p className="text-neutral-200 mb-6">
              Você também pode entrar em contato diretamente pelo e-mail de suporte:{' '}
              <a
                href="mailto:westhamsuporteclube@gmail.com"
                className="text-orange-400 hover:text-orange-300 font-semibold"
              >
                westhamsuporteclube@gmail.com
              </a>
            </p>

            {sent ? (
              <div className="p-6 bg-emerald-900/30 border border-emerald-500/50 rounded-lg text-center">
                <p className="text-emerald-200 font-semibold mb-2">Solicitação enviada com sucesso!</p>
                <p className="text-neutral-300 text-sm">
                  Nossa equipe entrará em contato em breve pelo e-mail ou telefone informados.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-gray-800">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label="Nome completo"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  required
                />
                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
                <Input
                  type="date"
                  label="Data de nascimento"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Telefone"
                  placeholder="(51) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endereço completo
                  </label>
                  <textarea
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Rua, número, bairro, cidade, CEP"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                  Enviar solicitação
                </Button>
              </form>
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
