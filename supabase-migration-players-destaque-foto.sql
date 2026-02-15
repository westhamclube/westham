-- =============================================================================
-- Migração: destaque por categoria e foto do jogador
-- Execute no SQL Editor do Supabase
-- =============================================================================

-- Destaque por modalidade (máx 3 por categoria na página de jogos)
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_campo BOOLEAN DEFAULT FALSE;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_fut7 BOOLEAN DEFAULT FALSE;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_futsal BOOLEAN DEFAULT FALSE;

-- Migrar destaque antigo para destaque_campo (se existir coluna destaque)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'destaque') THEN
    UPDATE public.players SET destaque_campo = COALESCE(destaque, false) WHERE destaque = true;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- foto_url: foto do jogador na aba de jogos (definida pelo admin, independente do perfil)
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS foto_url TEXT;
