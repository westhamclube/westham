-- Script SQL para criar as tabelas do Supabase
-- Execute estas queries no SQL editor do Supabase

-- 1. TABELA DE USUÁRIOS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  sobrenome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  role VARCHAR(20) DEFAULT 'sócio', -- 'sócio', 'jogador', 'admin'
  avatar_url TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE JOGADORES
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  numero_camisa INTEGER NOT NULL UNIQUE,
  posicao VARCHAR(50) NOT NULL, -- 'Atacante', 'Meio-campo', 'Zagueiro', 'Goleiro'
  gols INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  nivel INTEGER CHECK (nivel >= 1 AND nivel <= 10) DEFAULT 5,
  altura DECIMAL(3, 2),
  peso INTEGER,
  data_nascimento DATE,
  nacionalidade VARCHAR(50),
  foto_url TEXT,
  data_entrada DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE NOTÍCIAS
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  autor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  categoria VARCHAR(50) NOT NULL, -- 'match', 'player', 'general', 'academy'
  imagem_url TEXT,
  destaque BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE ESCALAÇÕES
CREATE TABLE lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proxima_partida DATE NOT NULL,
  formacao VARCHAR(20), -- '4-3-3', '4-2-3-1', etc
  descricao TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE JOGADORES NA ESCALAÇÃO
CREATE TABLE lineup_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  escalacao_id UUID REFERENCES lineups(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  posicao VARCHAR(50) NOT NULL,
  numero_camisa INTEGER NOT NULL,
  titular BOOLEAN DEFAULT FALSE,
  UNIQUE(escalacao_id, player_id)
);

-- 6. TABELA DE PARTIDAS
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data TIMESTAMP NOT NULL,
  adversario VARCHAR(100) NOT NULL,
  local VARCHAR(200) NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- 'amistoso', 'campeonato'
  resultado VARCHAR(50),
  gols_westham INTEGER,
  gols_adversario INTEGER,
  descricao TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA DE SOLICITAÇÕES DE RANK
CREATE TABLE user_rank_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_requisitada VARCHAR(20) NOT NULL, -- 'jogador', 'admin'
  status VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado'
  motivo TEXT,
  data_requisicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_players_numero ON players(numero_camisa);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_news_categoria ON news(categoria);
CREATE INDEX idx_news_autor_id ON news(autor_id);
CREATE INDEX idx_news_destaque ON news(destaque);
CREATE INDEX idx_matches_data ON matches(data);
CREATE INDEX idx_rank_requests_user_id ON user_rank_requests(user_id);
CREATE INDEX idx_rank_requests_status ON user_rank_requests(status);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rank_requests ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURANÇA
-- Usuários podem ver todos os users
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (true);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Todos podem ver notícias
CREATE POLICY "Users can view all news"
  ON news FOR SELECT
  USING (true);

-- Apenas admins podem inserir notícias
CREATE POLICY "Only admins can create news"
  ON news FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Todos podem ver jogadores
CREATE POLICY "Users can view all players"
  ON players FOR SELECT
  USING (true);

-- Todos podem ver partidas
CREATE POLICY "Users can view all matches"
  ON matches FOR SELECT
  USING (true);

-- Todos podem ver escalações
CREATE POLICY "Users can view all lineups"
  ON lineups FOR SELECT
  USING (true);

-- Usuários podem ver suas próprias solicitações de rank
CREATE POLICY "Users can view their rank requests"
  ON user_rank_requests FOR SELECT
  USING (user_id = auth.uid()::uuid);

-- NOTAS ADICIONAIS:
-- 1. Use Supabase Auth para gerenciar autenticação
-- 2. Configure JWT com a secret key do seu projeto
-- 3. Teste as políticas RLS antes de ir para produção
-- 4. Faça backups regulares dos dados
-- 5. Monitore o uso da base de dados
