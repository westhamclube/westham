/**
 * Configuração centralizada do site - redes sociais e links oficiais.
 * Usado no Footer e no Dashboard automaticamente.
 */
export const SITE_SOCIAL = {
  facebook: 'https://facebook.com/share/1FEcnNWcKn/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/clubewestham?igsh=MXN2eHQ5Yndqcmpoaw==',
  youtube: 'https://youtube.com/@westtvguaiba?si=pN9qoLURDF-GXrgh',
  youtubeStreams: 'https://www.youtube.com/@WESTTVGUAIBA/streams',
  tiktok: 'https://tiktok.com/@clubewestham?_t=ZM-90LzxjMPxSV&_r=1',
} as const;

/** URL embed para transmissão ao vivo. Use NEXT_PUBLIC_LIVE_STREAM_URL quando houver vídeo ao vivo. */
export const LIVE_STREAM_EMBED = process.env.NEXT_PUBLIC_LIVE_STREAM_URL || '';
