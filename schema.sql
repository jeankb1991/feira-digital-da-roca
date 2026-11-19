-- ============================================================
-- MARKETPLACE RURAL: AGRICULTURA FAMILIAR
-- CETI Malaquias Ribeiro Damasceno — São Lourenço do Piauí, PI
-- Schema completo para o Supabase (PostgreSQL + RLS + Storage + Triggers)
-- ============================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse seu painel no Supabase: https://supabase.com
-- 2. Vá em "SQL Editor" (ícone de terminal/banco no menu lateral)
-- 3. Clique em "+ New query", cole TODO este arquivo e clique em "Run" (▶)
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABELA: produtores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.produtores (
  id          UUID        PRIMARY KEY,
  nome        TEXT        NOT NULL,
  whatsapp    TEXT        NOT NULL,
  municipio   TEXT        DEFAULT 'São Lourenço do Piauí - PI',
  descricao   TEXT,
  avatar_url  TEXT,
  status      TEXT        DEFAULT 'ativo' CHECK (status IN ('pendente', 'ativo', 'bloqueado')),
  is_admin    BOOLEAN     DEFAULT FALSE,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. TABELA: categorias
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categorias (
  id    SERIAL  PRIMARY KEY,
  nome  TEXT    NOT NULL UNIQUE,
  icone TEXT,
  cor   TEXT
);

-- Inserir categorias padrão da agricultura familiar
INSERT INTO public.categorias (id, nome, icone, cor) VALUES
  (1, 'Hortaliças',  '🥬', '#52B788'),
  (2, 'Frutas',      '🍎', '#F4A261'),
  (3, 'Laticínios',  '🥛', '#4895EF'),
  (4, 'Artesanato',  '🧵', '#E76F51'),
  (5, 'Outros',      '🌾', '#2D6A4F')
ON CONFLICT (id) DO UPDATE 
SET nome = EXCLUDED.nome, icone = EXCLUDED.icone, cor = EXCLUDED.cor;

SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM public.categorias));

-- ============================================================
-- 3. TABELA: produtos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.produtos (
  id           SERIAL        PRIMARY KEY,
  produtor_id  UUID          NOT NULL REFERENCES public.produtores(id) ON DELETE CASCADE,
  categoria_id INTEGER       REFERENCES public.categorias(id) ON DELETE SET NULL,
  nome         TEXT          NOT NULL,
  descricao    TEXT,
  preco        DECIMAL(10,2) NOT NULL CHECK (preco > 0),
  unidade      TEXT          DEFAULT 'unidade',
  foto_url     TEXT,
  disponivel   BOOLEAN       DEFAULT TRUE,
  criado_em    TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================
-- 4. TRIGGER AUTOMÁTICO DE CADASTRO (Supabase Auth -> Produtores)
-- Cria o perfil automaticamente quando alguém se cadastra no Auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.produtores (id, nome, whatsapp, municipio, descricao, status, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    COALESCE(NEW.raw_user_meta_data->>'municipio', 'São Lourenço do Piauí - PI'),
    COALESCE(NEW.raw_user_meta_data->>'descricao', 'Produtor rural cadastrado na plataforma.'),
    'ativo',
    FALSE
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    nome = COALESCE(EXCLUDED.nome, public.produtores.nome),
    whatsapp = CASE WHEN EXCLUDED.whatsapp <> '' THEN EXCLUDED.whatsapp ELSE public.produtores.whatsapp END,
    municipio = COALESCE(EXCLUDED.municipio, public.produtores.municipio);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador no Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) - SEGURANÇA E PRIVACIDADE (LGPD)
-- ============================================================
ALTER TABLE public.produtores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias  ENABLE ROW LEVEL SECURITY;

-- ---- POLÍTICAS: PRODUTORES ----
DROP POLICY IF EXISTS "produtores_select" ON public.produtores;
CREATE POLICY "produtores_select" ON public.produtores
  FOR SELECT USING (
    status = 'ativo' 
    OR auth.uid() = id 
    OR EXISTS (SELECT 1 FROM public.produtores WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "produtores_insert" ON public.produtores;
CREATE POLICY "produtores_insert" ON public.produtores
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "produtores_update_own" ON public.produtores;
CREATE POLICY "produtores_update_own" ON public.produtores
  FOR UPDATE USING (
    auth.uid() = id 
    OR EXISTS (SELECT 1 FROM public.produtores WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ---- POLÍTICAS: PRODUTOS ----
DROP POLICY IF EXISTS "produtos_select" ON public.produtos;
CREATE POLICY "produtos_select" ON public.produtos
  FOR SELECT USING (
    auth.uid() = produtor_id
    OR EXISTS (
      SELECT 1 FROM public.produtores p
      WHERE p.id = produtor_id AND p.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "produtos_insert" ON public.produtos;
CREATE POLICY "produtos_insert" ON public.produtos
  FOR INSERT WITH CHECK (auth.uid() = produtor_id);

DROP POLICY IF EXISTS "produtos_update" ON public.produtos;
CREATE POLICY "produtos_update" ON public.produtos
  FOR UPDATE USING (auth.uid() = produtor_id);

DROP POLICY IF EXISTS "produtos_delete" ON public.produtos;
CREATE POLICY "produtos_delete" ON public.produtos
  FOR DELETE USING (
    auth.uid() = produtor_id
    OR EXISTS (SELECT 1 FROM public.produtores WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ---- POLÍTICAS: CATEGORIAS ----
DROP POLICY IF EXISTS "categorias_select" ON public.categorias;
CREATE POLICY "categorias_select" ON public.categorias
  FOR SELECT USING (TRUE);

-- ============================================================
-- 6. STORAGE — BUCKET PARA FOTOS DOS PRODUTOS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos', 'fotos', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DROP POLICY IF EXISTS "storage_fotos_select" ON storage.objects;
CREATE POLICY "storage_fotos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotos');

DROP POLICY IF EXISTS "storage_fotos_insert" ON storage.objects;
CREATE POLICY "storage_fotos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fotos' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "storage_fotos_update" ON storage.objects;
CREATE POLICY "storage_fotos_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'fotos' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "storage_fotos_delete" ON storage.objects;
CREATE POLICY "storage_fotos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'fotos' AND auth.uid() IS NOT NULL);

-- ============================================================
-- 7. DADOS INICIAIS DE EXEMPLO (SEED - São Lourenço do Piauí)
-- Produtores e produtos ilustrativos da comunidade para teste
-- ============================================================
DO $$
DECLARE
  prod_maria UUID := 'a0000000-0000-0000-0000-000000000001';
  prod_raimundo UUID := 'a0000000-0000-0000-0000-000000000002';
  prod_chico UUID := 'a0000000-0000-0000-0000-000000000003';
  prod_isabel UUID := 'a0000000-0000-0000-0000-000000000004';
BEGIN
  -- Inserir produtores de exemplo
  INSERT INTO public.produtores (id, nome, whatsapp, municipio, descricao, status, is_admin)
  VALUES 
    (prod_maria, 'Dona Maria da Horta', '89999112233', 'São Lourenço do Piauí - PI', 'Cultivo agroecológico familiar de hortaliças sem agrotóxicos na comunidade rural.', 'ativo', FALSE),
    (prod_raimundo, 'Seu Raimundo do Mel', '89999223344', 'São Lourenço do Piauí - PI', 'Apicultura familiar do semiárido piauiense. Mel 100% puro de abelha tiúba e mandaçaia.', 'ativo', FALSE),
    (prod_chico, 'Chico do Queijo & Leite', '89999334455', 'São Lourenço do Piauí - PI', 'Produção artesanal de queijo coalho e manteiga da terra fresca todos os dias.', 'ativo', FALSE),
    (prod_isabel, 'Dona Isabel do Artesanato', '89999445566', 'São Lourenço do Piauí - PI', 'Peças feitas à mão em palha de carnaúba, bordados e cerâmica tradicional da região.', 'ativo', FALSE)
  ON CONFLICT (id) DO NOTHING;

  -- Inserir produtos de exemplo
  INSERT INTO public.produtos (produtor_id, categoria_id, nome, descricao, preco, unidade, foto_url, disponivel)
  VALUES
    (prod_maria, 1, 'Alface Crespa Agroecológica', 'Colhida na hora, fresquinha, cultivada sem defensivos químicos.', 3.50, 'maço', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80', TRUE),
    (prod_maria, 1, 'Cheiro-Verde (Coentro e Cebolinha)', 'Maço generoso e fresco para temperos.', 2.50, 'maço', 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80', TRUE),
    (prod_maria, 2, 'Goiaba Vermelha Regional', 'Frutas selecionadas, doces e ideais para sucos e consumo natural.', 6.00, 'kg', 'https://images.unsplash.com/photo-1536511136777-2272895690b2?auto=format&fit=crop&w=600&q=80', TRUE),
    (prod_raimundo, 5, 'Mel Puro do Semiárido (500g)', 'Mel silvestre de floradas da caatinga (marmeleiro e jurema), puro e denso.', 25.00, 'garrafa 500ml', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', TRUE),
    (prod_chico, 3, 'Queijo Coalho Tradicional', 'Queijo artesanal feito com leite fresco da fazenda familiar.', 32.00, 'kg', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80', TRUE),
    (prod_chico, 3, 'Manteiga da Terra Artesanal', 'Pote de manteiga clarificada tradicional feita em tacho de ferro.', 18.00, 'pote 300g', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80', TRUE),
    (prod_isabel, 4, 'Cesto em Palha de Carnaúba', 'Trançado à mão, resistente e com acabamento decorativo típico do Piauí.', 45.00, 'unidade', 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=600&q=80', TRUE)
  ON CONFLICT DO NOTHING;
END $$;
