import { supabase } from './supabase';

const AVATARS_BUCKET = 'avatars';

/**
 * Utilitários de Storage - deletar arquivo antigo antes de substituir (economiza espaço).
 * Pode ser reutilizado em outros buckets (notícias, produtos, etc.).
 */

/**
 * Extrai o caminho do arquivo a partir da URL pública do Storage.
 * Ex: https://xxx.supabase.co/storage/v1/object/public/avatars/userId/avatar.jpg
 *     -> userId/avatar.jpg
 */
function extractStoragePathFromUrl(url: string, bucket: string): string | null {
  try {
    const match = url.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`));
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Verifica se a URL pertence ao nosso bucket do Supabase.
 */
function isOurStorageUrl(url: string, bucket: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('/storage/v1/object/public/') && url.includes(`/${bucket}/`);
}

/**
 * Remove arquivo antigo do storage antes de subir um novo (economiza espaço).
 * Só remove se a URL pertencer ao nosso bucket.
 */
export async function deleteOldFileIfOurs(
  oldUrl: string | undefined | null,
  bucket: string = AVATARS_BUCKET
): Promise<void> {
  if (!oldUrl || !isOurStorageUrl(oldUrl, bucket)) return;
  const path = extractStoragePathFromUrl(oldUrl, bucket);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}

/**
 * Faz upload do avatar do usuário.
 * Remove o avatar antigo (se existir no nosso bucket) antes de subir o novo.
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  oldAvatarUrl?: string | null
): Promise<string> {
  await deleteOldFileIfOurs(oldAvatarUrl);
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    upsert: true, // Substitui o arquivo existente (economiza espaço)
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
