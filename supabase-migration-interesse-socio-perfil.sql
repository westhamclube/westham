-- Interesse em ser sócio + campos de endereço/data no perfil
-- Execute no SQL Editor do Supabase

-- 1) profiles: CEP, endereço (logradouro, número, bairro) e data de nascimento
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cep TEXT,
  ADD COLUMN IF NOT EXISTS logradouro TEXT,
  ADD COLUMN IF NOT EXISTS numero TEXT,
  ADD COLUMN IF NOT EXISTS bairro TEXT,
  ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- 2) support_messages: tipo 'interesse_socio' e user_id (opcional, para vincular ao cadastro)
ALTER TABLE public.support_messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.support_messages DROP CONSTRAINT IF EXISTS support_messages_tipo_check;
ALTER TABLE public.support_messages ADD CONSTRAINT support_messages_tipo_check
  CHECK (tipo IN ('suporte', 'amistoso', 'projetos', 'interesse_socio'));
