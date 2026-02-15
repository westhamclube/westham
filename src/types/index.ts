// Tipos de usuário
export type UserRole = 'usuário' | 'sócio' | 'jogador' | 'admin' | 'moderador';

// Categorias de movimentação de caixa
export type CashFlowCategory =
  | 'patrocinio'
  | 'despesa_jogadores'
  | 'despesa_locomocao'
  | 'medicamentos'
  | 'arbitragem'
  | 'material_esportivo'
  | 'alimentacao'
  | 'uniformes'
  | 'outros';

export type CashFlowTipo = 'entrada' | 'saida';

export interface CashFlowTransaction {
  id: string;
  tipo: CashFlowTipo;
  categoria: CashFlowCategory;
  descricao: string;
  valor: number;
  data_movimento: string;
  created_by?: string;
  created_at: string;
}

export interface CashFlowModerator {
  id: string;
  user_id: string;
  added_by: string;
  created_at: string;
  user_nome?: string;
  user_email?: string;
}

// Interface do usuário
export interface User {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  role: UserRole;
  data_cadastro: string;
  cpf: string;
  telefone: string;
  avatar_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
}

// Interface do jogador
export interface Player {
  id: string;
  user_id: string;
  numero_camisa: number;
  posicao: string;
  data_entrada: string;
  gols: number;
  assists: number;
  nivel: number; // 1-10
  altura: number;
  peso: number;
  data_nascimento: string;
  idade: number;
  nacionalidade: string;
  foto_url?: string;
  ativo: boolean;
}

// Interface de coment\u00e1rio em not\u00edcia
export interface NewsComment {
  id: string;
  news_id: string;
  user_id: string;
  user_nome?: string;
  conteudo: string;
  data_criacao: string;
  curtidas: number;
  usuarios_curtidas?: string[]; // IDs de usuários que curtiram
}

export type NewsModalidade = 'campo' | 'futsal' | 'fut7';

// Interface de notícia
export interface News {
  id: string;
  titulo: string;
  conteudo: string;
  autor_id: string;
  data_criacao: string;
  data_atualizacao: string;
  categoria: 'match' | 'player' | 'general' | 'academy' | 'social';
  modalidade?: NewsModalidade;
  imagem_url?: string;
  /** URL da publicação (Instagram, Facebook, TikTok) — usado quando categoria é 'social' */
  link_externo?: string;
  video_url?: string;
  midia_url?: string; // URLs adicionais de mídia (separadas por vírgula)
  destaque: boolean;
  curtidas: number;
  usuarios_curtidas?: string[]; // IDs de usuários que curtiram
  comentarios?: NewsComment[];
}

/** Variação do produto: tipo (ex: Tamanho, Cor) e opções (ex: P, M, G, GG) */
export interface ProductVariation {
  tipo: string;
  opcoes: string[];
}

// Interface de produto da loja
export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string; // fallback main image
  imagens?: string[]; // gallery images (admin can add multiple)
  modelos?: string[]; // modelos/variantes (legado; usar variacoes)
  /** Variações flexíveis: Tamanho (P,M,G,GG), Cor (Bordô,Azul), etc. */
  variacoes?: ProductVariation[];
  categoria: string;
  estoque: number;
  data_criacao: string;
  ativo: boolean;
  desconto_socio?: number; // Desconto em % para sócios (ex: 10 para 10%)
  tem_desconto_socio?: boolean; // Flag se o produto tem desconto para sócios
}

// Interface de escalação
export interface Lineup {
  id: string;
  proxima_partida: string;
  data_criacao: string;
  data_atualizacao: string;
  descricao: string;
  formacao: string;
  titulares: LineupPlayer[];
  reservas: LineupPlayer[];
}

export interface LineupPlayer {
  id: string;
  escalacao_id: string;
  player_id: string;
  player_nome?: string;
  player_numero?: number;
  posicao: string;
  numero_camisa: number;
  titular: boolean;
  gols_jogo?: number; // Gols do jogador nesta partida
}

// Interface de match/partida
export interface Match {
  id: string;
  data: string;
  adversario: string;
  local: string;
  resultado?: string;
  gols_westham?: number;
  gols_adversario?: number;
  tipo: 'amistoso' | 'campeonato';
  descricao?: string;
  modalidade?: NewsModalidade;
}

// Interface de rank/aprovação
export interface UserRankRequest {
  id: string;
  user_id: string;
  user_nome?: string;
  user_email?: string;
  role_atual: UserRole;
  role_requisitada: UserRole;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  data_requisicao: string;
  data_atualizacao: string;
  motivo?: string;
  observacao_admin?: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface SignupData {
  email: string;
  password: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
}
