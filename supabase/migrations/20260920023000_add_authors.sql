CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'Columnista',
  bio text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  social_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_authors" ON authors;
CREATE POLICY "public_read_authors" ON authors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "editors_insert_authors" ON authors;
CREATE POLICY "editors_insert_authors" ON authors FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "editors_update_authors" ON authors;
CREATE POLICY "editors_update_authors" ON authors FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "editors_delete_authors" ON authors;
CREATE POLICY "editors_delete_authors" ON authors FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);

INSERT INTO authors (name, role, bio, avatar, social_links) VALUES
  ('María González', 'Corresponsal de Medio Ambiente', 'Periodista especializada en sostenibilidad, territorio y transición climática.', 'MG', '[{"label":"X","platform":"x","url":"https://x.com/"}]'::jsonb),
  ('Roberto Méndez', 'Analista político', 'Especialista en política pública y debates institucionales.', 'RM', '[{"label":"X","platform":"x","url":"https://x.com/"}]'::jsonb),
  ('Ana Torres', 'Editora de tecnología', 'Cobertura de innovación, IA y transformación digital.', 'AT', '[{"label":"X","platform":"x","url":"https://x.com/"}]'::jsonb),
  ('Diego Fernández', 'Columnista deportivo', 'Cobertura de fútbol, rendimiento y cultura deportiva.', 'DF', '[{"label":"X","platform":"x","url":"https://x.com/"}]'::jsonb),
  ('Javier Ríos', 'Economista y editor', 'Periodista económico con foco en mercados y bienestar social.', 'JR', '[{"label":"LinkedIn","platform":"linkedin","url":"https://www.linkedin.com/"}]'::jsonb),
  ('Lucía Vega', 'Columnista de cultura', 'Escritora y crítica cultural.', 'LV', '[{"label":"Instagram","platform":"instagram","url":"https://www.instagram.com/"}]'::jsonb)
ON CONFLICT (name) DO NOTHING;