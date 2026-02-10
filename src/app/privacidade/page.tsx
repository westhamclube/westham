'use client';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="bg-neutral-950 text-neutral-50 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400">
            Política de Privacidade
          </h1>

          <Card className="bg-neutral-900/70 border border-neutral-800 text-sm leading-relaxed space-y-4">
            <p>
              A privacidade dos torcedores, sócios, atletas e visitantes do{' '}
              <strong>Sport Club Westham</strong> é muito importante para nós. Esta Política de
              Privacidade explica como coletamos, usamos e protegemos seus dados no site oficial
              do clube.
            </p>

            <h2 className="font-bold text-orange-300 mt-4">1. Dados que Coletamos</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Nome e sobrenome</li>
              <li>E-mail de contato e senha (armazenada de forma segura pelo provedor Supabase)</li>
              <li>Documentos básicos como CPF e telefone para identificação de sócios</li>
              <li>Informações de perfil de jogador (quando aplicável)</li>
            </ul>

            <h2 className="font-bold text-orange-300 mt-4">2. Como Utilizamos os Dados</h2>
            <p>Usamos seus dados para:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Gerenciar o acesso à área do sócio e conteúdos exclusivos;</li>
              <li>Controlar status de sócio ativo/inativo para benefícios na loja;</li>
              <li>Organizar informações de jogadores, estatísticas e grupos (FUT SET / Campo/Futsal);</li>
              <li>Enviar comunicações importantes relacionadas ao clube (quando autorizado).</li>
            </ul>

            <h2 className="font-bold text-orange-300 mt-4">3. Armazenamento no Supabase</h2>
            <p>
              Os dados são armazenados em infraestrutura do{' '}
              <strong>Supabase (PostgreSQL + Storage)</strong>, com regras de segurança (RLS)
              configuradas para que cada usuário só consiga acessar as próprias informações,
              exceto o administrador, que possui permissões específicas para gestão do sistema.
            </p>

            <h2 className="font-bold text-orange-300 mt-4">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins
              comerciais. Informações podem ser compartilhadas apenas:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Quando exigido por lei ou autoridade competente;</li>
              <li>Quando necessário para cumprir obrigações legais ou proteger o clube.</li>
            </ul>

            <h2 className="font-bold text-orange-300 mt-4">5. Direitos do Usuário</h2>
            <p>Você pode solicitar ao clube:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Acesso às informações cadastradas em seu perfil;</li>
              <li>Correção de dados incorretos;</li>
              <li>Exclusão de conta (respeitando obrigações legais e históricas do clube).</li>
            </ul>

            <h2 className="font-bold text-orange-300 mt-4">6. Contato sobre Privacidade</h2>
            <p>
              Para qualquer solicitação ou dúvida sobre privacidade e dados pessoais, entre em
              contato:
            </p>
            <p>
              E-mail:{' '}
              <a
                href="mailto:westhamsuporteclube@gmail.com"
                className="text-orange-400 hover:text-orange-300"
              >
                westhamsuporteclube@gmail.com
              </a>
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}

