-- ============================================================
-- FEIRA DIGITAL DA ROÇA — Schema Supabase
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.produtores (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome        TEXT        NOT NULL,
  whatsapp    TEXT        NOT NULL,
  municipio   TEXT,
  descricao   TEXT,
  avatar_url  TEXT,
  status      TEXT        DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'bloqueado')),
  is_admin    BOOLEAN     DEFAULT FALSE,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categorias (
  id    SERIAL  PRIMARY KEY,
  nome  TEXT    NOT NULL UNIQUE,
  icone TEXT,
  cor   TEXT
);

INSERT INTO public.categorias (nome, icone, cor) VALUES
  ('Hortaliças',  '🥬', '#52B788'),
  ('Frutas',      '🍎', '#F4A261'),
  ('Laticínios',  '🥛', '#ADB5BD'),
  ('Artesanato',  '🧵', '#E76F51'),
  ('Outros',      '🌾', '#2D6A4F')
ON CONFLICT (nome) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.produtos (
  id           SERIAL      PRIMARY KEY,
  produtor_id  UUID        NOT NULL REFERENCES public.produtores(id) ON DELETE CASCADE,
  categoria_id INTEGER     REFERENCES public.categorias(id),
  nome         TEXT        NOT NULL,
  descricao    TEXT,
  preco        DECIMAL(10,2) NOT NULL CHECK (preco > 0),
  unidade      TEXT        DEFAULT 'unidade',
  foto_url     TEXT,
  disponivel   BOOLEAN     DEFAULT TRUE,
  criado_em    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.produtores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "produtores_select" ON public.produtores FOR SELECT USING (status = 'ativo' OR auth.uid() = id);
CREATE POLICY "produtores_insert" ON public.produtores FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "produtores_update_own" ON public.produtores FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "produtos_select" ON public.produtos FOR SELECT USING (
  auth.uid() = produtor_id OR EXISTS (SELECT 1 FROM public.produtores p WHERE p.id = produtor_id AND p.status = 'ativo')
);
CREATE POLICY "produtos_insert" ON public.produtos FOR INSERT WITH CHECK (auth.uid() = produtor_id);
CREATE POLICY "produtos_update" ON public.produtos FOR UPDATE USING (auth.uid() = produtor_id);
CREATE POLICY "produtos_delete" ON public.produtos FOR DELETE USING (auth.uid() = produtor_id);

CREATE POLICY "categorias_select" ON public.categorias FOR SELECT USING (TRUE);
