-- Adicionar colunas de redes sociais à tabela leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT '';
