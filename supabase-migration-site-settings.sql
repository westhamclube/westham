-- =============================================================================
-- Migração: Página inicial editável (título, slogan, fundo hero, logo do quadrado)
-- Execute no SQL Editor do Supabase
-- =============================================================================
-- 1) Bucket site-assets: imagens de fundo da hero e logo dentro do quadrado
-- 2) Tabela site_settings: hero_title, hero_slogan, hero_bg_image_url, hero_logo_url
-- =============================================================================

-- 1) Criar bucket site-assets (público, 5 MB, imagens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'site-assets', 'site-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'site-assets');

-- 2) Políticas para bucket site-assets (apenas admin pode subir/atualizar/deletar)
DROP POLICY IF EXISTS "Admin upload site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin update site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read site-assets" ON storage.objects;

CREATE POLICY "Admin upload site-assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-assets'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin update site-assets"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'site-assets'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin delete site-assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'site-assets'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read site-assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'site-assets');

-- 3) Tabela site_settings (uma única linha, id = 1)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  hero_title text,
  hero_slogan text,
  hero_bg_image_url text,
  hero_logo_url text,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 4) Inserir linha padrão se não existir
INSERT INTO public.site_settings (id, hero_title, hero_slogan, hero_bg_image_url, hero_logo_url)
VALUES (
  1,
  'A casa oficial do Westham na web',
  'FUT11, FUT 7 e FUTSAL, área do sócio e loja oficial em um só lugar. Notícias, cronograma de jogos e projetos do clube.',
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 5) RLS: leitura pública, escrita apenas admin
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;

CREATE POLICY "Public read site_settings"
ON public.site_settings FOR SELECT TO public
USING (true);

CREATE POLICY "Admin update site_settings"
ON public.site_settings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
