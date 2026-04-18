-- ============================================================
-- QUINDEMBA — Actualização: Sectores (LOJA, RECAUCHUTAGEM, LAVAGEM)
-- Cortar e colar no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de sectores
CREATE TABLE IF NOT EXISTS sectores (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome      VARCHAR(50) NOT NULL UNIQUE,
  cor       VARCHAR(20) DEFAULT '#f59e0b',
  activo    BOOLEAN DEFAULT true
);

INSERT INTO sectores (nome, cor) VALUES
  ('Loja',          '#3b82f6'),
  ('Recauchutagem', '#f59e0b'),
  ('Lavagem',       '#10b981')
ON CONFLICT (nome) DO NOTHING;

-- 2. Adicionar sector_id a movimentos_caixa
ALTER TABLE movimentos_caixa
  ADD COLUMN IF NOT EXISTS sector_id UUID REFERENCES sectores(id);

-- 3. Adicionar sector_id a movimentos_estoque
ALTER TABLE movimentos_estoque
  ADD COLUMN IF NOT EXISTS sector_id UUID REFERENCES sectores(id);

-- 4. Tabela de passagens de caixa DIÁRIAS por sector
CREATE TABLE IF NOT EXISTS passagens_caixa_diarias (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data            DATE NOT NULL,
  sector_id       UUID REFERENCES sectores(id),
  saldo_anterior  DECIMAL(12,2) DEFAULT 0,
  total_receitas  DECIMAL(12,2) DEFAULT 0,
  total_despesas  DECIMAL(12,2) DEFAULT 0,
  saldo_final     DECIMAL(12,2) DEFAULT 0,
  responsavel     VARCHAR(100),
  observacoes     TEXT,
  fechado         BOOLEAN DEFAULT false,
  data_fecho      TIMESTAMP,
  criado_em       TIMESTAMP DEFAULT now(),
  UNIQUE(data, sector_id)
);

-- 5. View: Resumo diário por sector
CREATE OR REPLACE VIEW v_resumo_diario_sectores AS
SELECT
  m.data_movimento AS data,
  s.id             AS sector_id,
  s.nome           AS sector,
  s.cor,
  SUM(CASE WHEN m.tipo = 'receita' THEN m.valor ELSE 0 END) AS total_receitas,
  SUM(CASE WHEN m.tipo = 'despesa' THEN m.valor ELSE 0 END) AS total_despesas,
  SUM(CASE WHEN m.tipo = 'receita' THEN m.valor ELSE -m.valor END) AS saldo
FROM movimentos_caixa m
JOIN sectores s ON s.id = m.sector_id
GROUP BY m.data_movimento, s.id, s.nome, s.cor
ORDER BY m.data_movimento DESC, s.nome;

-- 6. View: Resumo mensal por sector
CREATE OR REPLACE VIEW v_resumo_mensal_sectores AS
SELECT
  m.ano,
  m.mes,
  s.id   AS sector_id,
  s.nome AS sector,
  s.cor,
  SUM(CASE WHEN m.tipo = 'receita' THEN m.valor ELSE 0 END) AS total_receitas,
  SUM(CASE WHEN m.tipo = 'despesa' THEN m.valor ELSE 0 END) AS total_despesas,
  SUM(CASE WHEN m.tipo = 'receita' THEN m.valor ELSE -m.valor END) AS saldo
FROM movimentos_caixa m
JOIN sectores s ON s.id = m.sector_id
GROUP BY m.ano, m.mes, s.id, s.nome, s.cor
ORDER BY m.ano, m.mes, s.nome;

-- 7. RLS para novas tabelas
ALTER TABLE sectores                ENABLE ROW LEVEL SECURITY;
ALTER TABLE passagens_caixa_diarias ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sectores' AND policyname = 'auth_only'
  ) THEN
    CREATE POLICY "auth_only" ON sectores FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'passagens_caixa_diarias' AND policyname = 'auth_only'
  ) THEN
    CREATE POLICY "auth_only" ON passagens_caixa_diarias FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
