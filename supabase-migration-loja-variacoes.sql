-- =============================================================================
-- Migração: Variações de produtos (Tamanho, Cor, etc.)
-- Execute no SQL Editor do Supabase
-- =============================================================================

-- Adiciona coluna variacoes (JSONB) para armazenar variações flexíveis
-- Formato: [{"tipo":"Tamanho","opcoes":["P","M","G","GG"]},{"tipo":"Cor","opcoes":["Bordô","Azul"]}]
ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS variacoes JSONB DEFAULT '[]';

COMMENT ON COLUMN public.store_products.variacoes IS 'Variações do produto: [{tipo, opcoes}]. Ex: Tamanho (P,M,G), Cor (Bordô,Azul)';
