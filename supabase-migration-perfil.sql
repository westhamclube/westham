-- Execute no SQL Editor do Supabase para habilitar redes sociais no perfil do usuário

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
