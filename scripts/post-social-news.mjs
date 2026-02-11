/**
 * Publica uma notícia do tipo "Redes sociais" no Supabase.
 * Uso: node scripts/post-social-news.mjs <link> [titulo] [descricao] [imagem_url]
 * Ou defina variáveis de ambiente: LINK, TITULO, DESCRICAO, IMAGEM_URL
 *
 * Requer .env.local com SUPABASE_SERVICE_ROLE_KEY (e NEXT_PUBLIC_SUPABASE_URL).
 * Para automação (cron): pode receber os dados de um scraper ou da API do Instagram/Facebook/TikTok.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const path = resolve(__dirname, '..', '.env.local');
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const args = process.argv.slice(2);
const link = process.env.LINK || args[0];
const titulo = process.env.TITULO || args[1] || 'Publicação das redes sociais';
const descricao = process.env.DESCRICAO || args[2] || 'Confira nossa publicação no link abaixo.';
const imagemUrl = process.env.IMAGEM_URL || args[3] || null;

if (!link) {
  console.error('Uso: node scripts/post-social-news.mjs <link> [titulo] [descricao] [imagem_url]');
  console.error('Ou: LINK=... TITULO=... DESCRICAO=... IMAGEM_URL=... node scripts/post-social-news.mjs');
  process.exit(1);
}

if (!supabaseUrl || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data, error } = await supabase
    .from('news')
    .insert({
      titulo,
      conteudo: descricao,
      categoria: 'social',
      link_externo: link,
      imagem_url: imagemUrl,
      destaque: false,
      autor_id: null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao publicar:', error.message);
    process.exit(1);
  }
  console.log('Notícia publicada (Redes sociais). ID:', data.id);
}

main();
