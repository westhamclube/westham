-- =============================================================================
-- Remover escalações; adicionar contador por modalidade e estatísticas por partida
-- Execute no SQL Editor do Supabase
-- =============================================================================

-- 1) Remover tabelas de escalação (FK primeiro)
DROP TABLE IF EXISTS public.lineup_players;
DROP TABLE IF EXISTS public.lineups;

-- 2) Jogadores: gols e assistências por modalidade + melhor goleiro por modalidade
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS gols_campo INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gols_fut7 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gols_futsal INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assistencias_campo INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assistencias_fut7 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assistencias_futsal INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS melhor_goleiro_campo BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS melhor_goleiro_fut7 BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS melhor_goleiro_futsal BOOLEAN DEFAULT FALSE;

-- 3) Partidas: placar (se não existir)
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS gols_westham INTEGER,
  ADD COLUMN IF NOT EXISTS gols_adversario INTEGER,
  ADD COLUMN IF NOT EXISTS resultado TEXT;

-- 4) Estatísticas por partida (quem fez gols e assistências em cada jogo)
CREATE TABLE IF NOT EXISTS public.match_player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  gols INTEGER DEFAULT 0,
  assistencias INTEGER DEFAULT 0,
  UNIQUE(match_id, player_id)
);

ALTER TABLE public.match_player_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "match_player_stats select" ON public.match_player_stats;
CREATE POLICY "match_player_stats select" ON public.match_player_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "match_player_stats admin" ON public.match_player_stats;
CREATE POLICY "match_player_stats admin" ON public.match_player_stats FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
