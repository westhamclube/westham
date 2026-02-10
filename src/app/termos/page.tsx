'use client';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';

export default function TermosPage() {
  return (
    <>
      <Header />
      <main className="bg-neutral-950 text-neutral-50 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400">
            Termos de Uso
          </h1>

          <Card className="bg-neutral-900/70 border border-neutral-800 text-sm leading-relaxed space-y-4">
            <p>
              Bem-vindo ao site oficial do <strong>Sport Club Westham</strong>. Ao acessar e
              utilizar este site, você concorda com estes Termos de Uso. Leia com atenção antes
              de continuar.
            </p>

            <h2 className="font-bold text-orange-300 mt-4">1. Finalidade da Plataforma</h2>
            <p>
              Este site tem como objetivo divulgar informações oficiais do clube, como notícias,
              calendário de jogos, projetos, loja oficial, área do sócio e conteúdos relacionados
              aos grupos <strong>FUT SET</strong> e <strong>Campo/Futsal</strong>.
            </p>

            <h2 className="font-bold text-orange-300 mt-4">2. Cadastro de Usuário e Sócio</h2>
            <p>
              Para acessar áreas restritas (como área do sócio, painel de jogador ou painel
              administrativo), é necessário criar uma conta utilizando um e-mail válido e senha.
              A confirmação de e-mail pode ser dispensada conforme configuração interna do
              sistema.
            </p>
            <p>
              O status de <strong>sócio ativo</strong> é controlado exclusivamente pela
              administração do clube. O pagamento de mensalidades e a ativação/desativação do
              acesso são gerenciados pelo clube, podendo ser revogados em caso de inadimplência
              ou uso indevido.
            </p>

            <h2 className="font-bold text-orange-300 mt-4">3. Conteúdos e Responsabilidades</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Todo o conteúdo publicado (notícias, fotos, vídeos, estatísticas) é de caráter informativo.</li>
              <li>
                Comentários ou interações feitos por usuários são de responsabilidade exclusiva
                de quem os publicou.
              </li>
              <li>
                A administração pode remover conteúdos, suspender contas ou restringir acessos em
                caso de violação destes termos, uso inadequado ou desrespeito à comunidade.
              </li>
            </ul>

            <h2 className="font-bold text-orange-300 mt-4">4. Loja e Benefícios de Sócio</h2>
            <p>
              A loja oficial disponibiliza produtos do clube e pode oferecer{' '}
              <strong>descontos exclusivos para sócios ativos</strong>. Os valores, prazos,
              estoques e condições podem ser alterados sem aviso prévio.
            </p>

            <h2 className="font-bold text-orange-300 mt-4">5. Alterações dos Termos</h2>
            <p>
              O Sport Club Westham pode atualizar estes Termos de Uso a qualquer momento. As
              versões atualizadas serão sempre disponibilizadas nesta página.
            </p>

            <h2 className="font-bold text-orange-300 mt-4">6. Contato</h2>
            <p>
              Em caso de dúvidas, entre em contato pelo e-mail:{' '}
              <a
                href="mailto:westhamsuporteclube@gmail.com"
                className="text-orange-400 hover:text-orange-300"
              >
                westhamsuporteclube@gmail.com
              </a>
              .
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}

