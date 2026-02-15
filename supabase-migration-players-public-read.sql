-- Garante que jogadores possam ser lidos na página de jogos (incluindo visitantes não logados)
-- Execute se as estatísticas de jogadores/gols aparecerem zeradas na página Jogos
DROP POLICY IF EXISTS "Allow public read players" ON public.players;
DROP POLICY IF EXISTS "Users can view all players" ON public.players;
CREATE POLICY "Allow public read players"
  ON public.players FOR SELECT TO anon, authenticated
  USING (true);
