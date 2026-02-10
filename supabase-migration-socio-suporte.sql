-- Solicitações para virar sócio e mensagens de suporte/defeitos

-- 1. Tabela de solicitações de sócio (formulário "Como virar sócio")
CREATE TABLE IF NOT EXISTS public.socio_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de mensagens de suporte / reporte de defeitos
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.socio_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (formulários públicos)
CREATE POLICY "Anyone can submit socio request"
  ON public.socio_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can submit support message"
  ON public.support_messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Apenas admins podem ver
CREATE POLICY "Admins can view socio requests"
  ON public.socio_requests FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can view support messages"
  ON public.support_messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins podem marcar como lido
CREATE POLICY "Admins can update socio requests"
  ON public.socio_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update support messages"
  ON public.support_messages FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
