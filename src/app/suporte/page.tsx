'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';

export default function SuportePage() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitDefeito = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.from('support_messages').insert({
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        mensagem: mensagem.trim(),
        tipo: 'suporte',
      });
      if (err) throw err;
      setSent(true);
      setNome('');
      setTelefone('');
      setEmail('');
      setMensagem('');
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
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400">
            Suporte &amp; Contato
          </h1>

          <Card className="bg-neutral-900/70 border border-neutral-800 p-6">
            <h2 className="font-bold text-orange-300 mb-4">Reportar defeito ou problema no site</h2>
            <p className="text-neutral-300 text-sm mb-4">
              Encontrou algum erro, defeito ou tem sugestão? Preencha o formulário abaixo para
              retorno por e-mail ou telefone.
            </p>
            {sent ? (
              <div className="p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm">
                Mensagem enviada. Retornaremos em breve.
              </div>
            ) : (
              <form onSubmit={handleSubmitDefeito} className="space-y-4 max-w-xl">
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
                <Input
                  label="Telefone"
                  placeholder="(51) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  label="E-mail para retorno"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descreva o defeito ou problema</label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Ex.: ao clicar em X não acontece Y; página não carrega; etc."
                  />
                </div>
                <Button type="submit" isLoading={loading}>
                  Enviar
                </Button>
              </form>
            )}
          </Card>

          <Card className="bg-neutral-900/70 border border-neutral-800 text-sm leading-relaxed space-y-4">
            <p>
              Se você é sócio, jogador, responsável por atleta da escolinha ou torcedor do{' '}
              <strong>Sport Club Westham</strong>, este é o canal oficial de suporte digital do
              site.
            </p>

            <h2 className="font-bold text-orange-300 mt-4">Contato Oficial</h2>
            <p>
              Para qualquer dúvida, problema de acesso, sugestão ou reporte de erro, envie um
              e-mail para:
            </p>
            <p className="text-lg font-semibold">
              <a
                href="mailto:westhamsuporteclube@gmail.com"
                className="text-orange-400 hover:text-orange-300 break-all"
              >
                westhamsuporteclube@gmail.com
              </a>
            </p>

            <h2 className="font-bold text-orange-300 mt-4">
              Como adicionar o site na tela inicial (versão &quot;app&quot;)
            </h2>
            <p>
              O site do Westham foi preparado para funcionar como um aplicativo quando você
              adiciona à tela inicial do celular. Assim, fica com ícone do escudo e abre em tela
              cheia, como um app.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-orange-300">Android (Chrome)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Acesse o site oficial do Westham no navegador Google Chrome.</li>
                  <li>Toque no ícone de menu (⋮) no canto superior direito.</li>
                  <li>Escolha a opção &quot;Adicionar à tela inicial&quot;.</li>
                  <li>Confirme o nome do atalho e toque em &quot;Adicionar&quot;.</li>
                </ol>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-orange-300">iOS (iPhone / Safari)</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Acesse o site oficial do Westham no navegador Safari.</li>
                  <li>Toque no ícone de &quot;Compartilhar&quot; (quadrado com seta para cima).</li>
                  <li>Role a lista e escolha &quot;Adicionar à Tela de Início&quot;.</li>
                  <li>Confirme o nome e toque em &quot;Adicionar&quot; no canto superior direito.</li>
                </ol>
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              Dica: mantenha seu login salvo para acessar rapidamente a área do sócio, cronograma
              de jogos, estatísticas e a loja oficial direto do ícone na tela do seu celular.
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}

