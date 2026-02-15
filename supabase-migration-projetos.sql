-- =============================================================================
-- Migração: Projetos e tipo projetos em support_messages
-- Execute no SQL Editor do Supabase
-- =============================================================================

-- 1) Criar tabela projects se não existir
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inscricoes_abertas', 'encerrado')),
  tipo VARCHAR(100),
  destaque BOOLEAN DEFAULT FALSE,
  imagem_capa_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar video_url se a tabela já existia sem essa coluna
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS video_url TEXT;

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "projects read" ON public.projects;
CREATE POLICY "projects read" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "projects admin" ON public.projects;
CREATE POLICY "projects admin" ON public.projects FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2) support_messages: incluir 'projetos' no tipo
ALTER TABLE public.support_messages DROP CONSTRAINT IF EXISTS support_messages_tipo_check;
ALTER TABLE public.support_messages ADD CONSTRAINT support_messages_tipo_check
  CHECK (tipo IN ('suporte', 'amistoso', 'projetos'));
