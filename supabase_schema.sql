-- ============================================================
-- QUINDEMBA — Schema Supabase (PostgreSQL)
-- Cortar e colar no SQL Editor do Supabase
-- ============================================================

-- ─── Tabela: anos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anos (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano        INTEGER NOT NULL UNIQUE,
  activo     BOOLEAN DEFAULT false,
  criado_em  TIMESTAMP DEFAULT now()
);

-- Inserir ano inicial
INSERT INTO anos (ano, activo) VALUES (2026, true) ON CONFLICT DO NOTHING;

-- ─── Tabela: categorias ───────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  tipo       VARCHAR(50) NOT NULL CHECK (tipo IN ('produto', 'servico', 'despesa')),
  descricao  TEXT,
  activo     BOOLEAN DEFAULT true
);

-- Categorias iniciais
INSERT INTO categorias (nome, tipo) VALUES
  ('Pneus',              'produto'),
  ('Borracha',           'produto'),
  ('Materiais Químicos', 'produto'),
  ('Ferramentas',        'produto'),
  ('Recauchutagem',      'servico'),
  ('Reparação',          'servico'),
  ('Montagem',           'servico'),
  ('Salários',           'despesa'),
  ('Aluguer',            'despesa'),
  ('Água/Luz',           'despesa'),
  ('Combustível',        'despesa'),
  ('Manutenção',         'despesa'),
  ('Outros',             'despesa')
ON CONFLICT DO NOTHING;

-- ─── Tabela: produtos ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS produtos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome            VARCHAR(200) NOT NULL,
  categoria_id    UUID REFERENCES categorias(id),
  unidade         VARCHAR(20) DEFAULT 'un',
  estoque_minimo  INTEGER DEFAULT 0,
  preco_unitario  DECIMAL(12,2) DEFAULT 0,
  activo          BOOLEAN DEFAULT true,
  criado_em       TIMESTAMP DEFAULT now()
);

-- ─── Tabela: clientes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome       VARCHAR(200) NOT NULL,
  telefone   VARCHAR(20),
  email      VARCHAR(100),
  endereco   TEXT,
  nif        VARCHAR(20),
  notas      TEXT,
  criado_em  TIMESTAMP DEFAULT now()
);

-- ─── Tabela: movimentos_estoque ───────────────────────────
CREATE TABLE IF NOT EXISTS movimentos_estoque (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano             INTEGER NOT NULL,
  mes             INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  produto_id      UUID REFERENCES produtos(id),
  tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade      INTEGER NOT NULL,
  preco_unitario  DECIMAL(12,2),
  valor_total     DECIMAL(12,2),
  fornecedor      VARCHAR(200),
  documento       VARCHAR(100),
  observacoes     TEXT,
  data_movimento  DATE NOT NULL,
  criado_em       TIMESTAMP DEFAULT now()
);

-- ─── Tabela: movimentos_caixa ─────────────────────────────
CREATE TABLE IF NOT EXISTS movimentos_caixa (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano             INTEGER NOT NULL,
  mes             INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria_id    UUID REFERENCES categorias(id),
  descricao       VARCHAR(300) NOT NULL,
  valor           DECIMAL(12,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  cliente_id      UUID REFERENCES clientes(id),
  documento       VARCHAR(100),
  observacoes     TEXT,
  data_movimento  DATE NOT NULL,
  criado_em       TIMESTAMP DEFAULT now()
);

-- ─── Tabela: facturas ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS facturas (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano              INTEGER NOT NULL,
  mes              INTEGER NOT NULL,
  numero_factura   VARCHAR(50) NOT NULL,
  cliente_id       UUID REFERENCES clientes(id),
  data_emissao     DATE NOT NULL,
  data_vencimento  DATE,
  subtotal         DECIMAL(12,2),
  iva              DECIMAL(12,2) DEFAULT 0,
  total            DECIMAL(12,2),
  estado           VARCHAR(20) DEFAULT 'pendente' CHECK (estado IN ('pendente','pago','cancelado')),
  forma_pagamento  VARCHAR(50),
  observacoes      TEXT,
  criado_em        TIMESTAMP DEFAULT now()
);

-- ─── Tabela: itens_factura ────────────────────────────────
CREATE TABLE IF NOT EXISTS itens_factura (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id      UUID REFERENCES facturas(id) ON DELETE CASCADE,
  descricao       VARCHAR(300) NOT NULL,
  quantidade      DECIMAL(10,2) NOT NULL,
  preco_unitario  DECIMAL(12,2) NOT NULL,
  total           DECIMAL(12,2) NOT NULL
);

-- ─── Tabela: passagens_caixa ──────────────────────────────
CREATE TABLE IF NOT EXISTS passagens_caixa (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano              INTEGER NOT NULL,
  mes              INTEGER NOT NULL,
  saldo_anterior   DECIMAL(12,2) DEFAULT 0,
  total_receitas   DECIMAL(12,2) DEFAULT 0,
  total_despesas   DECIMAL(12,2) DEFAULT 0,
  saldo_final      DECIMAL(12,2) DEFAULT 0,
  responsavel      VARCHAR(100),
  observacoes      TEXT,
  fechado          BOOLEAN DEFAULT false,
  data_fecho       TIMESTAMP,
  criado_em        TIMESTAMP DEFAULT now(),
  UNIQUE(ano, mes)
);

-- Criar passagens para 2026
INSERT INTO passagens_caixa (ano, mes, fechado)
SELECT 2026, generate_series(1,12), false
ON CONFLICT DO NOTHING;

-- ─── Tabela: inventarios ──────────────────────────────────
CREATE TABLE IF NOT EXISTS inventarios (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano                 INTEGER NOT NULL,
  mes                 INTEGER NOT NULL,
  produto_id          UUID REFERENCES produtos(id),
  quantidade_sistema  INTEGER DEFAULT 0,
  quantidade_fisica   INTEGER DEFAULT 0,
  diferenca           INTEGER DEFAULT 0,
  observacoes         TEXT,
  data_contagem       DATE NOT NULL,
  criado_em           TIMESTAMP DEFAULT now()
);

-- ============================================================
-- VIEWS
-- ============================================================

-- Estoque actual por produto
CREATE OR REPLACE VIEW v_estoque_actual AS
SELECT
  p.id,
  p.nome,
  p.unidade,
  p.estoque_minimo,
  p.preco_unitario,
  COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN m.quantidade ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN m.tipo = 'saida' THEN m.quantidade ELSE 0 END), 0)
  AS quantidade_actual
FROM produtos p
LEFT JOIN movimentos_estoque m ON p.id = m.produto_id
WHERE p.activo = true
GROUP BY p.id, p.nome, p.unidade, p.estoque_minimo, p.preco_unitario;

-- Resumo mensal de caixa
CREATE OR REPLACE VIEW v_resumo_caixa_mensal AS
SELECT
  ano,
  mes,
  SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) AS total_receitas,
  SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) AS total_despesas,
  SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END) AS saldo
FROM movimentos_caixa
GROUP BY ano, mes
ORDER BY ano, mes;

-- Resumo mensal de estoque
CREATE OR REPLACE VIEW v_resumo_estoque_mensal AS
SELECT
  ano,
  mes,
  produto_id,
  SUM(CASE WHEN tipo = 'entrada' THEN quantidade ELSE 0 END) AS entradas,
  SUM(CASE WHEN tipo = 'saida'   THEN quantidade ELSE 0 END) AS saidas
FROM movimentos_estoque
GROUP BY ano, mes, produto_id
ORDER BY ano, mes;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — activar após testes
-- ============================================================

-- Activar RLS em todas as tabelas
ALTER TABLE anos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias         ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentos_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentos_caixa   ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_factura      ENABLE ROW LEVEL SECURITY;
ALTER TABLE passagens_caixa    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventarios        ENABLE ROW LEVEL SECURITY;

-- Policies: apenas utilizadores autenticados podem aceder
CREATE POLICY "auth_only" ON anos               FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON categorias         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON produtos           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON clientes           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON movimentos_estoque FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON movimentos_caixa   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON facturas           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON itens_factura      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON passagens_caixa    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON inventarios        FOR ALL TO authenticated USING (true) WITH CHECK (true);
