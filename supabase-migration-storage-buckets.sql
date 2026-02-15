-- =============================================================================
-- Migração: Buckets de Storage + Políticas
-- Execute no SQL Editor do Supabase
-- =============================================================================
-- Buckets: news, players, products, projects, history-photos
-- Limite: 5 MB por imagem | Tipos: jpeg, png, webp, gif
-- Upload/Delete: apenas admins (role = 'admin' em profiles)
-- Leitura: pública (buckets públicos)
-- =============================================================================

-- 1) Criar buckets que ainda não existem
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'news', 'news', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'news');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'players', 'players', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'players');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'products');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'projects', 'projects', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'projects');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'history-photos', 'history-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'history-photos');

-- 2) Remover políticas antigas (evita conflito)
DROP POLICY IF EXISTS "Admin upload news" ON storage.objects;
DROP POLICY IF EXISTS "Admin update news" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete news" ON storage.objects;
DROP POLICY IF EXISTS "Public read news" ON storage.objects;

DROP POLICY IF EXISTS "Admin upload players" ON storage.objects;
DROP POLICY IF EXISTS "Admin update players" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete players" ON storage.objects;
DROP POLICY IF EXISTS "Public read players" ON storage.objects;

DROP POLICY IF EXISTS "Admin upload products" ON storage.objects;
DROP POLICY IF EXISTS "Admin update products" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete products" ON storage.objects;
DROP POLICY IF EXISTS "Public read products" ON storage.objects;

DROP POLICY IF EXISTS "Admin upload projects" ON storage.objects;
DROP POLICY IF EXISTS "Admin update projects" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete projects" ON storage.objects;
DROP POLICY IF EXISTS "Public read projects" ON storage.objects;

DROP POLICY IF EXISTS "Admin upload history-photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin update history-photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete history-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read history-photos" ON storage.objects;

-- 3) Políticas para bucket NEWS
CREATE POLICY "Admin upload news"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'news'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin update news"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'news'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin delete news"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'news'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read news"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'news');

-- 4) Políticas para bucket PLAYERS
CREATE POLICY "Admin upload players"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'players'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin update players"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'players'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin delete players"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'players'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read players"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'players');

-- 5) Políticas para bucket PRODUCTS
CREATE POLICY "Admin upload products"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin update products"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'products'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin delete products"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'products'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read products"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'products');

-- 6) Políticas para bucket PROJECTS
CREATE POLICY "Admin upload projects"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'projects'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin update projects"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'projects'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin delete projects"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'projects'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read projects"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'projects');

-- 7) Políticas para bucket HISTORY-PHOTOS
CREATE POLICY "Admin upload history-photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'history-photos'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin update history-photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'history-photos'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin delete history-photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'history-photos'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read history-photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'history-photos');
