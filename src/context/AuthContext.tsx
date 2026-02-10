'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, SignupData, User } from '@/types';
import { supabase } from '@/lib/supabase';

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) return 'E-mail ou senha incorretos. Verifique e tente novamente.';
  if (m.includes('email not confirmed')) return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
  if (m.includes('user not found')) return 'Usuário não encontrado. Verifique o e-mail.';
  if (m.includes('wrong password') || m.includes('incorrect password')) return 'Senha incorreta. Tente novamente ou use "Esqueci minha senha".';
  if (m.includes('too many requests')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (m.includes('network') || m.includes('fetch')) return 'Erro de conexão. Verifique sua internet e tente novamente.';
  return message || 'Erro ao fazer login. Tente novamente.';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromSupabase = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setUser(null);
          return;
        }

        const authUser = session.user;

        // Buscar perfil estendido na tabela `profiles`
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name, role, cpf, telefone, avatar_url, created_at, instagram_url, facebook_url, tiktok_url')
          .eq('id', authUser.id)
          .single();

        if (error) {
          // eslint-disable-next-line no-console
          console.error('[Auth] Erro ao carregar perfil:', error.message);
        }

        const appUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          nome: profile?.first_name || profile?.full_name || authUser.user_metadata?.nome || '',
          sobrenome: profile?.last_name || authUser.user_metadata?.sobrenome || '',
          role: profile?.role || (authUser.user_metadata?.role as any) || 'usuário',
          data_cadastro: profile?.created_at || authUser.created_at,
          cpf: profile?.cpf || authUser.user_metadata?.cpf || '',
          telefone: profile?.telefone || authUser.user_metadata?.telefone || '',
          avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
          instagram_url: profile?.instagram_url,
          facebook_url: profile?.facebook_url,
          tiktok_url: profile?.tiktok_url,
        };

        setUser(appUser);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[Auth] Erro ao carregar sessão:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

  // Carregar usuário da sessão do Supabase ao montar
  useEffect(() => {
    loadUserFromSupabase();

    // Listener para mudanças de sessão (login/logout/refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        return;
      }

      // Para simplificar, recarregamos o usuário completo
      loadUserFromSupabase();
    });

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = translateAuthError(error.message);
        throw new Error(msg);
      }

      const session = data.session;
      if (!session) {
        throw new Error('Sessão não encontrada. Tente novamente.');
      }

      // A sessão listener cuidará de popular o user
    } catch (error: any) {
      const msg = typeof error.message === 'string' && error.message
        ? translateAuthError(error.message)
        : 'Erro ao fazer login. Tente novamente.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUserFromSupabase();
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    try {
      // 1) Criar usuário no Supabase Auth
      // Para não exigir confirmação de e-mail, configure isso no painel do Supabase (Auth -> Providers -> Email)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            sobrenome: data.sobrenome,
            cpf: data.cpf,
            telefone: data.telefone,
            role: 'usuário',
          },
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message || 'Erro ao cadastrar');
      }

      const authUser = signUpData.user;
      if (!authUser) {
        throw new Error('Usuário não retornado pelo Supabase');
      }

      // 2) Criar/atualizar registro em `profiles`
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: authUser.id,
          email: data.email,
          full_name: `${data.nome} ${data.sobrenome}`,
          first_name: data.nome,
          last_name: data.sobrenome,
          cpf: data.cpf,
          telefone: data.telefone,
          role: 'usuário',
        },
        {
          onConflict: 'id',
        },
      );

      if (profileError) {
        throw new Error(profileError.message || 'Erro ao salvar perfil');
      }

      // 3) Login automático após cadastro (se a instância estiver sem confirmação de email)
      // Caso o Supabase ainda esteja exigindo confirmação, este login pode falhar até o e-mail ser confirmado.
      await login(data.email, data.password);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider');
  }
  return context;
}
