-- =============================================================================
-- Migração: posicao_label em lineup_players para nomes personalizados
-- Execute no SQL Editor do Supabase
-- =============================================================================

ALTER TABLE public.lineup_players
  ADD COLUMN IF NOT EXISTS posicao_label VARCHAR(80);

COMMENT ON COLUMN public.lineup_players.posicao_label IS 'Nome customizado da posição (ex: Volante, Ala, Centroavante)';
