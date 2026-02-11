# Notícias tipo "Redes sociais"

## No site

- **Painel admin:** em Notícias, escolha a categoria **"Redes sociais"**. Preencha título, descrição, URL da imagem (opcional) e **Link da publicação** (Instagram, Facebook ou TikTok). A notícia aparece na aba **Notícias** com filtro **"Redes sociais"** e um botão "Conferir publicação →".
- **Banco:** foi adicionada a coluna `link_externo` na tabela `news` (migração em `supabase_migration_westham.sql`). Execute a migração se ainda não rodou.

## Script para publicar via terminal/cron

Para publicar uma notícia "Redes sociais" sem abrir o painel (útil para automação):

1. No Supabase, crie uma **Service Role Key** (Settings → API) e coloque em `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   ```

2. Execute:
   ```bash
   node scripts/post-social-news.mjs "https://instagram.com/p/..." "Título" "Descrição curta" "https://url-da-foto.jpg"
   ```
   Ou com variáveis de ambiente:
   ```bash
   LINK="https://..." TITULO="..." DESCRICAO="..." IMAGEM_URL="..." node scripts/post-social-news.mjs
   ```

Assim você pode, por exemplo, usar um cron que lê um RSS ou outra fonte e chama o script com os dados da publicação.

## Automação total (Instagram / Facebook / TikTok)

Puxar posts **automaticamente** das redes exige uso das **APIs oficiais**:

- **Instagram:** [Instagram Graph API](https://developers.facebook.com/docs/instagram-api) (via Meta/Facebook). Requer app no Facebook for Developers, permissões e token de longa duração.
- **Facebook:** [Facebook Graph API](https://developers.facebook.com/docs/graph-api). Mesmo ecossistema Meta.
- **TikTok:** [TikTok for Developers](https://developers.tiktok.com/). Requer app aprovado e OAuth.

Passos gerais:

1. Criar app na plataforma (Meta/TikTok), obter credenciais e configurar permissões.
2. No seu backend (ou Vercel Cron / GitHub Actions), rodar um job que:
   - usa a API para listar as últimas publicações;
   - para cada uma, chama o script acima (ou insere direto no Supabase) com título, descrição, link e imagem.

Por enquanto, o fluxo **manual** no painel e o **script** `post-social-news.mjs` já permitem publicar notícias "Redes sociais" com título, descrição, link e foto; a automação completa pode ser adicionada depois quando as chaves de API estiverem configuradas.
