-- Tabela de logs de execução das buscas
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id UUID REFERENCES apify_searches(id) ON DELETE SET NULL,
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'success')),
  step TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_search_id ON search_logs(search_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);

-- RLS: cada usuário vê apenas os seus próprios logs
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON search_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON search_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins veem todos os logs
CREATE POLICY "Admins can view all logs"
  ON search_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
