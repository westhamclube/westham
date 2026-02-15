-- =============================================================================
-- Migração: correções admin (profiles, support_messages, players)
-- Execute no SQL Editor do Supabase
-- =============================================================================

-- 1) support_messages: adicionar coluna tipo para separar suporte vs amistoso
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'suporte';

-- 2) profiles: garantir que admin pode atualizar role de qualquer usuário
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 3) players: adicionar colunas para detalhes do time
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS cartoes_amarelos INTEGER DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS cartoes_vermelhos INTEGER DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS faltas INTEGER DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS reserva BOOLEAN DEFAULT FALSE;
