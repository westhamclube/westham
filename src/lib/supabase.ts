import { createClient } from '@supabase/supabase-js';

// Cliente único do Supabase para o app inteiro
// URL e ANON KEY vêm do `.env.local` (e do painel do Supabase)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  // Ajuda em desenvolvimento
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configurados. Verifique seu .env.local.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
