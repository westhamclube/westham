# Sport Club Westham - Webapp

Um aplicativo web completo para o Sport Club Westham, com sistema de autenticação, gerenciamento de jogadores, notícias, escalações e painel administrativo.

## 🎨 Características Principais

- ✅ **Autenticação de Usuários**: Sistema de login e cadastro com controle de roles
- 📰 **Notícias**: Publicação e visualização de notícias sobre o time
- ⚽ **Gerenciamento de Jogadores**: Dados completos dos jogadores (gols, assists, nível, etc)
- 🏆 **Escalação**: Gerenciamento de formações e escalações para partidas
- 🔐 **Painel Admin**: Controle total do sistema, aprovação de usuários e gerenciamento de conteúdo
- 👥 **Sistema de Ranks**: Diferentes níveis de acesso (sócio, jogador, admin)
- 📊 **Estatísticas**: Visualização de dados do time e jogadores
- 🎯 **Interface Dinâmica**: Design moderno com cores vermelha e laranja

## 🎨 Paleta de Cores

- **Vermelho**: `#DC2626` (red-600) - Cor principal
- **Laranja**: `#EA580C` (orange-600) - Cor secundária
- **Gradientes**: Combinações de vermelho e laranja para elementos destacados

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env.local` já está configurado para localhost. Quando usar em produção com Vercel + Supabase, atualize as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

### 3. Executar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 👤 Credenciais de Demo

### Admin
- **Email**: `admin@westham.com`
- **Senha**: `admin123`

## 🗂️ Estrutura do Projeto

```
src/
├── app/                      # App Router pages
│   ├── page.tsx             # Home page
│   ├── login/page.tsx       # Página de login
│   ├── signup/page.tsx      # Página de cadastro
│   ├── dashboard/page.tsx   # Dashboard de usuário
│   ├── admin/page.tsx       # Painel administrativo
│   ├── api/                 # API routes
│   ├── layout.tsx           # Layout principal
│   └── globals.css          # Estilos globais
│
├── components/              # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Header.tsx
│
├── context/                 # Context API
│   └── AuthContext.tsx      # Contexto de autenticação
│
├── lib/                     # Utilitários e configurações
│   └── supabase.ts          # Configuração do Supabase
│
└── types/                   # Tipos TypeScript
    └── index.ts             # Definições de tipos
```

## 📋 Funcionalidades por Role

### Sócio
- ✓ Visualizar notícias
- ✓ Ver escalação
- ✓ Acompanhar estatísticas dos jogadores
- ✓ Ver próximas partidas

### Jogador
- ✓ Todas as funcionalidades do sócio
- ✓ Perfil pessoal com estatísticas
- ✓ Histórico de gols e assistências

### Admin
- ✓ Todas as funcionalidades do jogador
- ✓ Publicar e editar notícias
- ✓ Gerenciar escalação
- ✓ Adicionar/editar/deletar jogadores
- ✓ Aprovar ou rejeitar solicitações de usuários
- ✓ Definir ranks de usuários

## 🔧 Tecnologias Utilizadas

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e autenticação
- **React Hook Form** - Gerenciamento de formulários
- **Context API** - State management

## 📱 Páginas Disponíveis

| Página | URL | Descrição |
|--------|-----|-----------|
| Home | `/` | Página inicial com visão geral do time |
| Login | `/login` | Autenticação de usuários |
| Cadastro | `/signup` | Registro de novos sócios |
| Dashboard | `/dashboard` | Painel do usuário |
| Admin | `/admin` | Painel administrativo |

## 🔐 Sistema de Autenticação

O sistema utiliza localStorage para desenvolvimento local. Em produção, será integrado com Supabase Auth:

```typescript
// Login
POST /api/auth/login

// Signup
POST /api/auth/signup

// Logout
POST /api/auth/logout
```

## 📊 Dados Principais

### Usuário
- ID único
- Email e senha
- Nome e sobrenome
- CPF e telefone
- Role (sócio/jogador/admin)
- Data de cadastro

### Jogador
- Número da camisa
- Posição (atacante, meio-campo, zagueiro, goleiro)
- Gols e assistências
- Nível (1-10)
- Dados físicos (altura, peso)
- Data de entrada no clube

### Notícia
- Título e conteúdo
- Categoria (match, player, general, academy)
- Autor (admin)
- Data de criação/atualização
- Destaque (sim/não)

### Escalação
- Formação tática (4-3-3, 4-2-3-1, etc)
- Jogadores selecionados
- Próxima partida
- Data de criação

## 🌐 Produção com Vercel + Supabase

### Passos:

1. **Supabase Setup**
   - Criar conta em [supabase.com](https://supabase.com)
   - Criar novo projeto
   - Copiar URL e chave anon

2. **Vercel Deploy**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Variáveis de Ambiente no Vercel**
   - Adicionar `NEXT_PUBLIC_SUPABASE_URL`
   - Adicionar `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Banco de Dados**
   - Executar migrations do Supabase
   - Configurar Row Level Security (RLS)

## 📚 Próximas Melhorias

- [ ] Integração completa com Supabase
- [ ] Upload de imagens para jogadores e notícias
- [ ] Sistema de comentários em notícias
- [ ] Push notifications
- [ ] Estatísticas avançadas
- [ ] Ranking de melhores jogadores
- [ ] Histórico de partidas
- [ ] App mobile (React Native)

## 📝 Licença

Todos os direitos reservados ao Sport Club Westham © 2026

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para o Sport Club Westham
