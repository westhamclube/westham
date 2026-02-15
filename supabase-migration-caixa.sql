-- =============================================================================
-- MIGRAÇÃO CAIXA - Sistema de fluxo de caixa para o Westham
-- Entradas, saídas, patrocínios, despesas (jogadores, locomoção, medicamentos, etc.)
-- Acesso: admin + até 2 moderadores escolhidos pelo admin
-- Execute no SQL Editor do Supabase
-- =============================================================================

-- 1) Tabela de moderadores de caixa (máx 2 - admin escolhe quem tem acesso)
CREATE TABLE IF NOT EXISTS public.cash_flow_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 2) Tabela de movimentações de caixa
-- Categorias: patrocínio, despesa_jogadores, despesa_locomocao, medicamentos,
-- arbitragem, material_esportivo, alimentacao, uniformes, outros
CREATE TABLE IF NOT EXISTS public.cash_flow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cash_flow_transactions_data ON public.cash_flow_transactions(data_movimento);
CREATE INDEX IF NOT EXISTS idx_cash_flow_transactions_tipo ON public.cash_flow_transactions(tipo);
CREATE INDEX IF NOT EXISTS idx_cash_flow_moderators_user ON public.cash_flow_moderators(user_id);

-- RLS
ALTER TABLE public.cash_flow_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_transactions ENABLE ROW LEVEL SECURITY;
-- =============================================================================
-- MIGRAÇÃO CAIXA - Sistema de fluxo de caixa para o Westham
-- Entradas, saídas, patrocínios, despesas (jogadores, locomoção, medicamentos, etc.)
-- Acesso: admin + até 2 moderadores escolhidos pelo admin
-- Execute no SQL Editor do Supabase
-- =============================================================================

-- 1) Tabela de moderadores de caixa (máx 2 - admin escolhe quem tem acesso)
CREATE TABLE IF NOT EXISTS public.cash_flow_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 2) Tabela de movimentações de caixa
-- Categorias: patrocínio, despesa_jogadores, despesa_locomocao, medicamentos,
-- arbitragem, material_esportivo, alimentacao, uniformes, outros
CREATE TABLE IF NOT EXISTS public.cash_flow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cash_flow_transactions_data ON public.cash_flow_transactions(data_movimento);
CREATE INDEX IF NOT EXISTS idx_cash_flow_transactions_tipo ON public.cash_flow_transactions(tipo);
CREATE INDEX IF NOT EXISTS idx_cash_flow_moderators_user ON public.cash_flow_moderators(user_id);

-- RLS
ALTER TABLE public.cash_flow_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_transactions ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: usuário tem acesso ao caixa? (admin ou está em cash_flow_moderators)
CREATE OR REPLACE FUNCTION public.user_has_cash_flow_access(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.cash_flow_moderators WHERE user_id = uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Moderadores: admin e moderadores podem ver; só admin pode inserir/atualizar/deletar
CREATE POLICY "Cash flow users can view moderators"
  ON public.cash_flow_moderators FOR SELECT TO authenticated
  USING (public.user_has_cash_flow_access(auth.uid()));

CREATE POLICY "Admin insert moderators"
  ON public.cash_flow_moderators FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update moderators"
  ON public.cash_flow_moderators FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete moderators"
  ON public.cash_flow_moderators FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Transações: quem tem acesso pode ver, inserir, editar, deletar
CREATE POLICY "Cash flow access select"
  ON public.cash_flow_transactions FOR SELECT TO authenticated
  USING (public.user_has_cash_flow_access(auth.uid()));

CREATE POLICY "Cash flow access insert"
  ON public.cash_flow_transactions FOR INSERT TO authenticated
  WITH CHECK (public.user_has_cash_flow_access(auth.uid()));

CREATE POLICY "Cash flow access update"
  ON public.cash_flow_transactions FOR UPDATE TO authenticated
  USING (public.user_has_cash_flow_access(auth.uid()));

CREATE POLICY "Cash flow access delete"
  ON public.cash_flow_transactions FOR DELETE TO authenticated
  USING (public.user_has_cash_flow_access(auth.uid()));

-- Função auxiliar: usuário tem acesso ao caixa? (admin ou está em cash_flow_moderators)
CREATE OR REPLACE FUNCTION public.user_has_cash_flow_access(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.cash_flow_moderators WHERE user_id = uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Moderadores: admin e moderadores podem ver; só admin pode inserir/atualizar/deletar
CREATE POLICY "Cash flow users can view moderators"
  ON public.cash_flow_moderators FOR SELECT TO authenticated
  USING (public.user_has_cash_flow_access(auth.uid()));

CREATE POLICY "Admin insert moderators"
  ON public.cash_flow_moderators FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update moderators"
  ON public.cash_flow_moderators FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete moderators"
  ON public.cash_flow_moderators FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Transações: quem tem acesso pode ver, inserir, editar, deletar
CREATE POLICY "Cash flow access select"
  ON public.cash_flow_transactions FOR SELECT TO authenticated
  USING (public.user_has_cash_flow_access(auth.uid()));

CREATE POLICY "Cash flow access insert"
  ON public.cash_flow_transactions FOR INSERT TO authenticated
  WITH CHECK (public.user_has_cash_flow_access(auth.uid()));

CREATE POLICY "Cash flow access update"
  ON public.cash_flow_transactions FOR UPDATE TO authenticated
  USING (public.user_has_cash_flow_access(auth.uid()));

CREATE POLICY "Cash flow access delete"
  ON public.cash_flow_transactions FOR DELETE TO authenticated
  USING (public.user_has_cash_flow_access(auth.uid()));
