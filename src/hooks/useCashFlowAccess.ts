'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Verifica se o usuário tem acesso ao módulo de caixa.
 * Acesso: admin (sempre) OU estar na lista cash_flow_moderators (máx 2).
 */
export function useCashFlowAccess() {
  const { user, loading: authLoading } = useAuth();
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) {
      setLoading(authLoading);
      setIsModerator(false);
      return;
    }

    // Admin sempre tem acesso
    if (user.role === 'admin' || user.role === 'moderador') {
      setIsModerator(true);
      setLoading(false);
      return;
    }

    // Verificar se está na lista de moderadores
    const check = async () => {
      const { data } = await supabase
        .from('cash_flow_moderators')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsModerator(!!data);
      setLoading(false);
    };
    check();
  }, [user, authLoading]);

  const hasAccess = !!(user && (user.role === 'admin' || isModerator));

  return {
    hasAccess,
    loading: authLoading || loading,
    isAdmin: user?.role === 'admin',
  };
}
