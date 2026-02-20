-- =============================================================================
-- Permitir que admin insira, atualize e exclua jogadores
-- Execute no SQL Editor do Supabase se "Adicionar Jogador" não estiver salvando
-- =============================================================================

DROP POLICY IF EXISTS "Admins can insert players" ON public.players;
CREATE POLICY "Admins can insert players"
  ON public.players FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update players" ON public.players;
CREATE POLICY "Admins can update players"
  ON public.players FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete players" ON public.players;
CREATE POLICY "Admins can delete players"
  ON public.players FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
