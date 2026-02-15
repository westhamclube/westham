-- =============================================================================
-- Migração: lineups e lineup_players - permitir admin criar/editar escalações
-- Execute no SQL Editor do Supabase
-- Requer: tabela lineups com coluna modalidade (adicionada por supabase_migration_westham.sql)
-- =============================================================================

-- 0) Garantir coluna modalidade em lineups
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lineups') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lineups' AND column_name = 'modalidade') THEN
      ALTER TABLE public.lineups ADD COLUMN modalidade TEXT DEFAULT 'campo' CHECK (modalidade IN ('campo', 'fut7', 'futsal'));
    END IF;
  END IF;
END $$;

-- 1) lineups: políticas para admin inserir/atualizar
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

-- 2) lineup_players: RLS e políticas
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
