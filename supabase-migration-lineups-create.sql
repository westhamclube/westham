-- =============================================================================
-- Migração: CRIAR tabelas lineups e lineup_players
-- Execute no SQL Editor do Supabase se receber "Could not find the table 'lineups'"
-- =============================================================================

-- 1) Criar tabela lineups
CREATE TABLE IF NOT EXISTS public.lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proxima_partida DATE NOT NULL,
  formacao VARCHAR(20),
  descricao TEXT,
  modalidade TEXT DEFAULT 'campo' CHECK (modalidade IN ('campo', 'fut7', 'futsal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Criar tabela lineup_players
CREATE TABLE IF NOT EXISTS public.lineup_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escalacao_id UUID NOT NULL REFERENCES public.lineups(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  posicao VARCHAR(50) NOT NULL,
  numero_camisa INTEGER NOT NULL,
  titular BOOLEAN DEFAULT FALSE,
  UNIQUE(escalacao_id, player_id)
);

-- 3) RLS e políticas para lineups
ALTER TABLE public.lineups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lineups select" ON public.lineups;
CREATE POLICY "lineups select" ON public.lineups FOR SELECT USING (true);

DROP POLICY IF EXISTS "lineups admin insert" ON public.lineups;
CREATE POLICY "lineups admin insert" ON public.lineups FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "lineups admin update" ON public.lineups;
CREATE POLICY "lineups admin update" ON public.lineups FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "lineups admin delete" ON public.lineups;
CREATE POLICY "lineups admin delete" ON public.lineups FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4) RLS e políticas para lineup_players
ALTER TABLE public.lineup_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lineup_players select" ON public.lineup_players;
CREATE POLICY "lineup_players select" ON public.lineup_players FOR SELECT USING (true);

DROP POLICY IF EXISTS "lineup_players admin insert" ON public.lineup_players;
CREATE POLICY "lineup_players admin insert" ON public.lineup_players FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "lineup_players admin update" ON public.lineup_players;
CREATE POLICY "lineup_players admin update" ON public.lineup_players FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "lineup_players admin delete" ON public.lineup_players;
CREATE POLICY "lineup_players admin delete" ON public.lineup_players FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
