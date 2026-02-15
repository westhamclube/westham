-- Admins podem criar, atualizar e excluir partidas (jogos)
DROP POLICY IF EXISTS "Admins can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can update matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can delete matches" ON public.matches;

CREATE POLICY "Admins can insert matches"
  ON public.matches FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update matches"
  ON public.matches FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete matches"
  ON public.matches FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
