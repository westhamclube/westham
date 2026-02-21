-- Tabela de atas da diretoria (relatórios de reuniões)
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.atas ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas diretor e admin podem ler/escrever (via role em profiles)
-- Leitura: usuários com role 'diretor' ou 'admin'
CREATE POLICY "Diretor e admin podem ler atas"
  ON public.atas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('diretor', 'admin')
    )
  );

-- Inserir/atualizar: diretor e admin
CREATE POLICY "Diretor e admin podem inserir atas"
  ON public.atas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('diretor', 'admin')
    )
  );

CREATE POLICY "Diretor e admin podem atualizar atas"
  ON public.atas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('diretor', 'admin')
    )
  );

CREATE POLICY "Diretor e admin podem deletar atas"
  ON public.atas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('diretor', 'admin')
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_atas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS atas_updated_at ON public.atas;
CREATE TRIGGER atas_updated_at
  BEFORE UPDATE ON public.atas
  FOR EACH ROW EXECUTE FUNCTION public.set_atas_updated_at();
