ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE articles
  DROP CONSTRAINT IF EXISTS articles_status_check;

ALTER TABLE articles
  ADD CONSTRAINT articles_status_check CHECK (status IN ('draft', 'published'));

UPDATE articles
SET status = 'published'
WHERE status IS NULL;

DROP POLICY IF EXISTS "anon_select_articles" ON articles;
DROP POLICY IF EXISTS "anon_insert_articles" ON articles;
DROP POLICY IF EXISTS "anon_update_articles" ON articles;
DROP POLICY IF EXISTS "anon_delete_articles" ON articles;
DROP POLICY IF EXISTS "public_read_published_articles" ON articles;
DROP POLICY IF EXISTS "editors_read_all_articles" ON articles;
DROP POLICY IF EXISTS "editors_insert_articles" ON articles;
DROP POLICY IF EXISTS "editors_update_articles" ON articles;
DROP POLICY IF EXISTS "editors_delete_articles" ON articles;

CREATE POLICY "public_read_published_articles" ON articles FOR SELECT
  TO anon USING (status = 'published');

CREATE POLICY "editors_read_all_articles" ON articles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "editors_insert_articles" ON articles FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "editors_update_articles" ON articles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "editors_delete_articles" ON articles FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_updated_at ON articles(updated_at DESC);
