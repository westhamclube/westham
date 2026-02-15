-- =============================================================================
-- Migração OBRIGATÓRIA: Destaques e colunas na página /jogos/[modalidade]
-- Execute no SQL Editor do Supabase para jogadores em destaque aparecerem
-- =============================================================================

-- 1) matches: coluna modalidade (se não existir)
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS modalidade TEXT DEFAULT 'campo' CHECK (modalidade IN ('campo', 'fut7', 'futsal'));

-- 2) news: coluna modalidade (se não existir)
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS modalidade TEXT DEFAULT 'campo' CHECK (modalidade IN ('campo', 'fut7', 'futsal'));

-- 3) players: destaque por categoria (se não existir)
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_campo BOOLEAN DEFAULT FALSE;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_fut7 BOOLEAN DEFAULT FALSE;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS destaque_futsal BOOLEAN DEFAULT FALSE;

-- 4) players: numero (alias/compatibilidade - alguns schemas usam numero em vez de numero_camisa)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'numero') THEN
    ALTER TABLE public.players ADD COLUMN numero INTEGER;
    UPDATE public.players SET numero = numero_camisa WHERE numero IS NULL;
    CREATE INDEX IF NOT EXISTS idx_players_numero ON public.players(numero);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5) modalidade_stats: garantir que existe
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
