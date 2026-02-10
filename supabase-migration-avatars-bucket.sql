-- Execute no SQL Editor do Supabase para criar o bucket de avatares

-- 1. Criar o bucket 'avatars' (público para exibir fotos, máx. 2 MB por arquivo)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas: usuário autenticado pode fazer upload/atualizar/deletar apenas o próprio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Qualquer pessoa pode ver avatares (bucket público)
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
