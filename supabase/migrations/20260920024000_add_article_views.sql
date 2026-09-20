ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS views bigint NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_articles_views ON articles(views DESC);

CREATE OR REPLACE FUNCTION increment_article_views(article_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE articles
  SET views = views + 1
  WHERE id = article_id
    AND status = 'published';
$$;

REVOKE ALL ON FUNCTION increment_article_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_article_views(uuid) TO anon, authenticated;