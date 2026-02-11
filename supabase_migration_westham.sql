-- =============================================================================
-- MIGRAÇÃO WESTHAM - Novas funcionalidades (destaque loja, modalidades jogadores,
-- escalação por modalidade, história do clube, etc.)
-- Execute no SQL Editor do Supabase. Pode rodar em projeto já existente.
-- NÃO exige tabelas lineups/lineup_players (só altera se existirem).
-- =============================================================================

-- 1) Produtos em destaque na página inicial (4 da loja)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_products' AND column_name = 'destaque'
  ) THEN
    ALTER TABLE store_products ADD COLUMN destaque BOOLEAN DEFAULT FALSE;
    COMMENT ON COLUMN store_products.destaque IS 'Se true, aparece entre os 4 destaques na página inicial';
  END IF;
END $$;

-- 2) Jogador: em quais modalidades joga (pode ser mais de uma)
-- Três colunas booleanas: admin marca Campo, FUT 7 e/ou Futsal
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'joga_campo') THEN
    ALTER TABLE players ADD COLUMN joga_campo BOOLEAN DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'joga_fut7') THEN
    ALTER TABLE players ADD COLUMN joga_fut7 BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'joga_futsal') THEN
    ALTER TABLE players ADD COLUMN joga_futsal BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Se existir coluna antiga modalidade (texto único), preencher as novas colunas a partir dela
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'modalidade') THEN
    UPDATE players SET
      joga_campo  = (modalidade = 'campo'),
      joga_fut7   = (modalidade = 'fut7'),
      joga_futsal = (modalidade = 'futsal')
    WHERE modalidade IS NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3) Partidas: coluna modalidade se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'modalidade'
  ) THEN
    ALTER TABLE matches ADD COLUMN modalidade TEXT DEFAULT 'campo' CHECK (modalidade IN ('campo', 'fut7', 'futsal'));
  END IF;
END $$;

-- 4) Escalações por modalidade — SÓ se a tabela lineups EXISTIR
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lineups') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lineups' AND column_name = 'modalidade') THEN
      ALTER TABLE lineups ADD COLUMN modalidade TEXT DEFAULT 'campo' CHECK (modalidade IN ('campo', 'fut7', 'futsal'));
    END IF;
  END IF;
END $$;

-- Posição na formação — SÓ se a tabela lineup_players EXISTIR
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lineup_players') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lineup_players' AND column_name = 'posicao_campo') THEN
      ALTER TABLE lineup_players ADD COLUMN posicao_campo VARCHAR(20);
    END IF;
  END IF;
END $$;

-- 4b) Notícias: link para publicação em redes sociais (Instagram, Facebook, TikTok)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'link_externo'
  ) THEN
    ALTER TABLE news ADD COLUMN link_externo TEXT;
    COMMENT ON COLUMN news.link_externo IS 'URL da publicação quando categoria = social';
  END IF;
END $$;

-- 5) Tabela de formação (ex: 4-3-3, 4-4-2) para o admin escolher
CREATE TABLE IF NOT EXISTS formation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(20) NOT NULL UNIQUE,
  descricao TEXT,
  linhas JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO formation_templates (nome, descricao, linhas) VALUES
  ('4-3-3', 'Clássico 4-3-3', '[1, 4, 3, 3]'),
  ('4-4-2', '4-4-2', '[1, 4, 4, 2]'),
  ('4-2-3-1', '4-2-3-1', '[1, 4, 2, 3, 1]'),
  ('3-5-2', '3-5-2', '[1, 3, 5, 2]'),
  ('5-3-2', '5-3-2', '[1, 5, 3, 2]'),
  ('4-5-1', '4-5-1', '[1, 4, 5, 1]'),
  ('3-4-3', '3-4-3', '[1, 3, 4, 3]')
ON CONFLICT (nome) DO NOTHING;

-- 6) História do clube (conteúdo editável pelo admin)
CREATE TABLE IF NOT EXISTS club_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL DEFAULT 'História do Westham',
  conteudo TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS club_history_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  history_id UUID REFERENCES club_history(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  legenda TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO club_history (titulo, conteudo, ordem)
SELECT 'História do Westham', 'O admin pode editar esta página pelo painel.', 0
WHERE NOT EXISTS (SELECT 1 FROM club_history LIMIT 1);

-- 7) RLS e políticas
ALTER TABLE formation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_history_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "formation_templates read" ON formation_templates;
CREATE POLICY "formation_templates read" ON formation_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "club_history read" ON club_history;
CREATE POLICY "club_history read" ON club_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "club_history_photos read" ON club_history_photos;
CREATE POLICY "club_history_photos read" ON club_history_photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "club_history admin" ON club_history;
CREATE POLICY "club_history admin" ON club_history FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "club_history_photos admin" ON club_history_photos;
CREATE POLICY "club_history_photos admin" ON club_history_photos FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8) Bucket para fotos da história
-- No Supabase: Storage → New bucket → Nome: history-photos → Public: sim.

-- Fim da migração.
