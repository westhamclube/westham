-- Cartões amarelos e vermelhos por modalidade (players)
-- Execute no SQL Editor do Supabase após fazer backup se necessário.

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS cartoes_amarelos_campo INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cartoes_amarelos_fut7 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cartoes_amarelos_futsal INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cartoes_vermelhos_campo INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cartoes_vermelhos_fut7 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cartoes_vermelhos_futsal INTEGER DEFAULT 0;

-- Copiar totais legados só quando o jogador tem uma única modalidade (evita duplicar em várias).
UPDATE public.players SET
  cartoes_amarelos_campo = COALESCE(cartoes_amarelos, 0),
  cartoes_vermelhos_campo = COALESCE(cartoes_vermelhos, 0)
WHERE COALESCE(joga_campo, true) = true
  AND COALESCE(joga_fut7, false) = false
  AND COALESCE(joga_futsal, false) = false;

UPDATE public.players SET
  cartoes_amarelos_fut7 = COALESCE(cartoes_amarelos, 0),
  cartoes_vermelhos_fut7 = COALESCE(cartoes_vermelhos, 0)
WHERE COALESCE(joga_campo, true) = false
  AND COALESCE(joga_fut7, false) = true
  AND COALESCE(joga_futsal, false) = false;

UPDATE public.players SET
  cartoes_amarelos_futsal = COALESCE(cartoes_amarelos, 0),
  cartoes_vermelhos_futsal = COALESCE(cartoes_vermelhos, 0)
WHERE COALESCE(joga_campo, true) = false
  AND COALESCE(joga_fut7, false) = false
  AND COALESCE(joga_futsal, false) = true;

COMMENT ON COLUMN public.players.cartoes_amarelos IS 'Total legado; preferir soma das colunas cartoes_amarelos_* por modalidade.';
