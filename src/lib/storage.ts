import { supabase } from './supabase';

const AVATARS_BUCKET = 'avatars';
export const NEWS_BUCKET = 'news';
export const PLAYERS_BUCKET = 'players';
export const PRODUCTS_BUCKET = 'products';
export const PROJECTS_BUCKET = 'projects';
export const HISTORY_PHOTOS_BUCKET = 'history-photos';

/**
 * Utilitários de Storage - deletar arquivo antigo antes de substituir (economiza espaço).
 */

/**
 * Extrai o caminho do arquivo a partir da URL pública do Storage.
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
export function isOurStorageUrl(url: string | null | undefined, bucket: string): boolean {
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
 * Remove vários arquivos se forem do nosso storage.
 */
export async function deleteOldFilesIfOurs(
  urls: (string | undefined | null)[],
  bucket: string
): Promise<void> {
  const paths: string[] = [];
  for (const url of urls) {
    if (!url || !isOurStorageUrl(url, bucket)) continue;
    const path = extractStoragePathFromUrl(url, bucket);
    if (path) paths.push(path);
  }
  if (paths.length > 0) await supabase.storage.from(bucket).remove(paths);
}

/**
 * Upload genérico: remove antigo se for nosso, sobe novo, retorna URL.
 */
async function uploadToBucket(
  bucket: string,
  path: string,
  file: File,
  oldUrl?: string | null
): Promise<string> {
  await deleteOldFileIfOurs(oldUrl, bucket);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function getFileExt(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() || 'jpg';
}

/**
 * Avatar do usuário (já existia).
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  oldAvatarUrl?: string | null
): Promise<string> {
  const ext = getFileExt(file);
  const path = `${userId}/avatar.${ext}`;
  return uploadToBucket(AVATARS_BUCKET, path, file, oldAvatarUrl);
}

/**
 * Imagem de notícia.
 */
export async function uploadNewsImage(
  file: File,
  oldUrl?: string | null
): Promise<string> {
  const ext = getFileExt(file);
  const id = crypto.randomUUID();
  const path = `${id}.${ext}`;
  return uploadToBucket(NEWS_BUCKET, path, file, oldUrl);
}

/**
 * Foto do jogador (aba Jogos).
 */
export async function uploadPlayerPhoto(
  file: File,
  playerId: string,
  oldUrl?: string | null
): Promise<string> {
  const ext = getFileExt(file);
  const path = `${playerId}/foto.${ext}`;
  return uploadToBucket(PLAYERS_BUCKET, path, file, oldUrl);
}

/**
 * Imagem de produto (uma por vez; várias imagens = vários uploads).
 */
export async function uploadProductImage(
  file: File,
  oldUrl?: string | null
): Promise<string> {
  const ext = getFileExt(file);
  const id = crypto.randomUUID();
  const path = `${id}.${ext}`;
  return uploadToBucket(PRODUCTS_BUCKET, path, file, oldUrl);
}

/**
 * Imagem de capa do projeto. projectId opcional (para novos projetos usa uuid).
 */
export async function uploadProjectImage(
  file: File,
  projectId: string | null,
  oldUrl?: string | null
): Promise<string> {
  const ext = getFileExt(file);
  const id = projectId || crypto.randomUUID();
  const path = `${id}/capa.${ext}`;
  return uploadToBucket(PROJECTS_BUCKET, path, file, oldUrl);
}

/**
 * Foto da galeria de história do clube.
 */
export async function uploadHistoryPhoto(
  file: File,
  historyId: string,
  oldUrl?: string | null
): Promise<string> {
  const ext = getFileExt(file);
  const id = crypto.randomUUID();
  const path = `${historyId}/${id}.${ext}`;
  return uploadToBucket(HISTORY_PHOTOS_BUCKET, path, file, oldUrl);
}
