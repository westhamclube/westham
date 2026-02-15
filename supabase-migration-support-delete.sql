-- Admins podem excluir mensagens de suporte/amistoso/projetos
DROP POLICY IF EXISTS "Admins can delete support messages" ON public.support_messages;
CREATE POLICY "Admins can delete support messages"
  ON public.support_messages FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
