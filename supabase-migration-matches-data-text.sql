-- Data/hora da partida como texto (ex.: "22/02/2026 23:00") — sem conversão de fuso
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS data_text TEXT;

COMMENT ON COLUMN public.matches.data_text IS 'Data e hora para exibição, em texto (ex.: 22/02/2026 23:00).';
