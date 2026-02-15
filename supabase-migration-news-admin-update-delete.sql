-- =============================================================================
-- Migração: Admin pode editar e excluir qualquer notícia
-- Execute no SQL Editor do Supabase
-- =============================================================================

DROP POLICY IF EXISTS "Admins can update news" ON public.news;
CREATE POLICY "Admins can update news"
  ON public.news FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
CREATE POLICY "Admins can delete news"
  ON public.news FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
