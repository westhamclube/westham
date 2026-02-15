-- =============================================================================
-- Migração COMPLETA: Jogadores - leitura pública, destaque por categoria, foto
-- Execute no SQL Editor do Supabase para corrigir estatísticas e destaques
-- =============================================================================

-- 1) RLS: Permitir leitura pública (anon + authenticated) para jogadores aparecerem na página Jogos
DROP POLICY IF EXISTS "Allow public read players" ON public.players;
DROP POLICY IF EXISTS "Users can view all players" ON public.players;
CREATE POLICY "Allow public read players"
  ON public.players FOR SELECT TO anon, authenticated
  USING (true);

-- 2) Destaque por modalidade (um jogador pode ser destaque em Campo mas não em FUT 7)
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_campo BOOLEAN DEFAULT FALSE;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_fut7 BOOLEAN DEFAULT FALSE;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_futsal BOOLEAN DEFAULT FALSE;

-- Migrar destaque antigo → destaque_campo (se coluna destaque existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'destaque') THEN
    UPDATE public.players SET destaque_campo = COALESCE(destaque, false) WHERE destaque = true;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3) Foto do jogador (admin define manualmente, independente do perfil)
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 4) Estatísticas por modalidade (admin preenche manualmente - último jogo, gols, vitórias, derrotas)
CREATE TABLE IF NOT EXISTS public.modalidade_stats (
  modalidade TEXT PRIMARY KEY CHECK (modalidade IN ('campo', 'fut7', 'futsal')),
  ultimo_resultado TEXT,
  gols_total INTEGER DEFAULT 0,
  vitorias INTEGER DEFAULT 0,
  derrotas INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.modalidade_stats (modalidade, ultimo_resultado, gols_total, vitorias, derrotas)
VALUES ('campo', NULL, 0, 0, 0), ('fut7', NULL, 0, 0, 0), ('futsal', NULL, 0, 0, 0)
ON CONFLICT (modalidade) DO NOTHING;
ALTER TABLE public.modalidade_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read modalidade_stats" ON public.modalidade_stats;
CREATE POLICY "Public read modalidade_stats" ON public.modalidade_stats FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage modalidade_stats" ON public.modalidade_stats;
CREATE POLICY "Admins manage modalidade_stats" ON public.modalidade_stats FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
