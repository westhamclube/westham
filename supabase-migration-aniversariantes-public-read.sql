-- =============================================================================
-- Leitura pública para aniversariantes (página inicial)
-- Permite que qualquer pessoa (logada ou não) leia nome e data_nascimento
-- dos perfis que têm data de nascimento preenchida.
-- Execute no SQL Editor do Supabase.
-- =============================================================================

-- Garantir que a tabela profiles tem RLS (comum em projetos Supabase)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: qualquer um pode ler first_name, last_name, full_name e data_nascimento
-- apenas das linhas onde data_nascimento está preenchido (para o widget de aniversariantes)
DROP POLICY IF EXISTS "Public read aniversariantes (nome e data_nascimento)" ON public.profiles;
CREATE POLICY "Public read aniversariantes (nome e data_nascimento)"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (data_nascimento IS NOT NULL);
