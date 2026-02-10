# 🌐 Integração com Supabase - Guia Completo

## Visão Geral

Este guia mostra como integrar o Sport Club Westham com Supabase para produção no Vercel.

---

## 📋 Pré-requisitos

- [x] Conta GitHub
- [x] Conta Vercel
- [x] Conta Supabase
- [x] Projeto local funcionando
- [x] Git configurado

---

## 🚀 Passo 1: Criar Projeto no Supabase

### 1.1 Ir para Supabase
```
https://supabase.com
```

### 1.2 Clicar em "New Project"
- Organization: Criar ou selecionar
- Project Name: `sport-club-westham`
- Database Password: Gerar senha forte
- Region: Escolher próximo ao seu usuário (Ex: São Paulo)
- Pricing Plan: Free (suficiente para começar)

### 1.3 Aguardar criação
Pode levar 1-2 minutos...

---

## 📊 Passo 2: Criar Tabelas no Banco

### 2.1 Ir para SQL Editor
Na dashboard do Supabase, clique em "SQL Editor"

### 2.2 Criar nova query
Clique em "New Query"

### 2.3 Copiar e executar script
Abra o arquivo `DATABASE_SCHEMA.sql` do projeto e copie TODO o conteúdo.

Cole no SQL Editor e execute com o botão ▶️.

### 2.4 Verificar tabelas
Vá para "Table Editor" e confirme que todas as 7 tabelas foram criadas:
- ✅ users
- ✅ players
- ✅ news
- ✅ lineups
- ✅ lineup_players
- ✅ matches
- ✅ user_rank_requests

---

## 🔑 Passo 3: Configurar Autenticação

### 3.1 Ir para Authentication
Na sidebar esquerda, clique em "Authentication"

### 3.2 Providers
Habilitar os provedores que deseja:
- Email (OBRIGATÓRIO)
- Google (opcional)
- GitHub (opcional)

### 3.3 Email/Password
- Confirmar que está habilitado
- Supabase usará como padrão

---

## 🔐 Passo 4: Obter Chaves de API

### 4.1 Ir para Settings
Clique em "Settings" → "API"

### 4.2 Copiar Chaves
Você precisa de:

**NEXT_PUBLIC_SUPABASE_URL**
```
Encontrar em: Project URL
Exemplo: https://seu-projeto.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Encontrar em: anon public
Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.3 Guardar em lugar seguro
Não compartilhar essas chaves publicamente!

---

## 📝 Passo 5: Atualizar .env.local

### 5.1 Editar arquivo
Abra `.env.local` no projeto:

```env
# Supabase Configuration (ATUALIZAR COM SUAS CHAVES)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5.2 Testar localmente
```bash
npm run dev
```

Tudo deve funcionar normalmente!

---

## 🚀 Passo 6: Deploy no Vercel

### 6.1 Ir para Vercel
```
https://vercel.com
```

### 6.2 Fazer login
Usar GitHub ou criar conta

### 6.3 Importar Projeto
```
New Project → Import Git Repository
```

Selecionar o repositório do `westham`

### 6.4 Configurar Environment Variables
Na tela de configuração:

1. Clique em "Environment Variables"
2. Adicionar:
   - Nome: `NEXT_PUBLIC_SUPABASE_URL`
   - Valor: (copiar do Supabase)
   
3. Clique em "Add"
4. Repetir para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6.5 Deploy
Clique em "Deploy"

Vercel começará a compilar...

⏳ Aguarde 2-3 minutos

✅ Quando ver "✓ Deployed" - pronto!

---

## 🔗 Passo 7: Vincular Domínio (Opcional)

### 7.1 Domínio próprio
Se quiser usar seu próprio domínio:

1. Em Vercel → Settings → Domains
2. Adicionar domínio
3. Seguir instruções DNS do seu provedor

### 7.2 Domínio Vercel padrão
Já vem com algo como:
```
sport-club-westham.vercel.app
```

---

## 🧪 Passo 8: Testar em Produção

### 8.1 Verificar
Abra a URL do seu app:
```
https://seu-app.vercel.app
```

### 8.2 Testar funcionalidades
- [x] Home page carrega
- [x] Login funciona
- [x] Cadastro funciona
- [x] Dashboard funciona
- [x] Admin panel funciona

### 8.3 Verificar dados
- [x] Notícias salvam no Supabase
- [x] Jogadores salvam
- [x] Escalações salvam
- [x] Usuários salvam

---

## 📧 Passo 9: Configurar Email (Opcional)

Para enviar emails de confirmação:

### 9.1 Provider SMTP
No Supabase → Authentication → Email:

- Opção 1: Usar Supabase SMTP (padrão)
- Opção 2: Configurar seu próprio (SendGrid, Mailgun, etc)

### 9.2 Templates
Customizar templates de email em:
Authentication → Email Templates

---

## 🔧 Passo 10: Atualizações Futuras

### 10.1 Fazer mudanças locais
```bash
git add .
git commit -m "nova feature"
git push origin main
```

### 10.2 Vercel auto-deploy
Vercel detecta push e faz deploy automático!

---

## 🚨 Troubleshooting

### Erro: "Database connection failed"
- [ ] Verificar se as chaves estão corretas
- [ ] Confirmar que tabelas foram criadas
- [ ] Verificar firewall/network

### Erro: "CORS error"
- [ ] Adicionar URL do app às origens permitidas no Supabase
- [ ] Settings → API → CORS

### Erro: "Unauthorized"
- [ ] Verificar políticas RLS
- [ ] Confirmar autenticação

### Dados não salvam
- [ ] Verificar console do navegador (F12)
- [ ] Verificar logs do Supabase
- [ ] Testar query SQL manualmente

---

## 💡 Dicas Importantes

### Segurança
```
🔐 Nunca compartilhe chaves secretas
🔐 Use variáveis de ambiente
🔐 Configure RLS corretamente
🔐 Valide dados no backend
```

### Performance
```
⚡ Use índices no banco
⚡ Pagine resultados grandes
⚡ Cache dados quando possível
⚡ Otimize queries SQL
```

### Backup
```
💾 Fazer backups regulares
💾 Supabase oferece backup automático
💾 Exportar dados periodicamente
💾 Testar restauração
```

---

## 📊 Monitoramento

### Verificar saúde do app
1. Vercel Dashboard → Analytics
2. Verificar: Performance, Errors, Usage

### Verificar banco de dados
1. Supabase Dashboard → Database
2. Verificar: Storage, Connections, Queries

---

## 🎉 Pronto para Produção!

Seu app agora está:
- ✅ Rodando em produção
- ✅ Com banco de dados real
- ✅ Com autenticação
- ✅ Escalável
- ✅ Seguro

---

## 📞 Suporte

### Recursos
- Docs Supabase: https://supabase.com/docs
- Docs Vercel: https://vercel.com/docs
- Docs Next.js: https://nextjs.org/docs

### Comunidade
- Discord Supabase
- Discord Vercel
- GitHub Issues

---

## 🚀 Próximas Melhorias

Após estar em produção:

- [ ] Adicionar upload de imagens (Supabase Storage)
- [ ] Implementar sistema de comentários
- [ ] Adicionar push notifications
- [ ] Criar app mobile
- [ ] Implementar analytics avançados
- [ ] Adicionar cache com Redis
- [ ] Implementar CDN

---

**Seu app agora está pronto para o mundo! 🌍**
