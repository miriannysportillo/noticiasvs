DROP POLICY IF EXISTS "public_read_published_articles" ON public.articles;
DROP POLICY IF EXISTS "editors_read_all_articles" ON public.articles;
DROP POLICY IF EXISTS "editors_insert_articles" ON public.articles;
DROP POLICY IF EXISTS "editors_update_articles" ON public.articles;
DROP POLICY IF EXISTS "editors_delete_articles" ON public.articles;
DROP POLICY IF EXISTS "anon_select_articles" ON public.articles;
DROP POLICY IF EXISTS "anon_insert_articles" ON public.articles;
DROP POLICY IF EXISTS "anon_update_articles" ON public.articles;
DROP POLICY IF EXISTS "anon_delete_articles" ON public.articles;

CREATE POLICY "public_read_published_articles"
  ON public.articles
  FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "authenticated_read_editorial_articles"
  ON public.articles
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
    OR author = COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'full_name', '')
    )
  );

CREATE POLICY "authenticated_insert_own_articles"
  ON public.articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
    OR author = COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'full_name', '')
    )
  );

CREATE POLICY "authenticated_update_own_articles"
  ON public.articles
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
    OR author = COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'full_name', '')
    )
  )
  WITH CHECK (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
    OR author = COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'full_name', '')
    )
  );

CREATE POLICY "admins_delete_articles"
  ON public.articles
  FOR DELETE
  TO authenticated
  USING (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
  );

DROP POLICY IF EXISTS "public_read_authors" ON public.authors;
DROP POLICY IF EXISTS "editors_insert_authors" ON public.authors;
DROP POLICY IF EXISTS "editors_update_authors" ON public.authors;
DROP POLICY IF EXISTS "editors_delete_authors" ON public.authors;

CREATE POLICY "public_read_authors"
  ON public.authors
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authenticated_insert_own_author"
  ON public.authors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
    OR name = COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'full_name', '')
    )
  );

CREATE POLICY "authenticated_update_own_author"
  ON public.authors
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
    OR name = COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'full_name', '')
    )
  )
  WITH CHECK (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
    OR name = COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'author_name', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'full_name', '')
    )
  );

CREATE POLICY "admins_delete_authors"
  ON public.authors
  FOR DELETE
  TO authenticated
  USING (
    COALESCE(
      NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
      NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
      'editor'
    ) = 'admin'
  );
