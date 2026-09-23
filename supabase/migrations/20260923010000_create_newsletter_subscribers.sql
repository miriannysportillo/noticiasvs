CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  source text NOT NULL DEFAULT 'site',
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email),
  CONSTRAINT newsletter_subscribers_status_check CHECK (status IN ('active', 'unsubscribed'))
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_subscribe_newsletter" ON public.newsletter_subscribers;
CREATE POLICY "public_subscribe_newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'active'
    AND length(email) BETWEEN 5 AND 254
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  );

DROP POLICY IF EXISTS "public_resubscribe_newsletter" ON public.newsletter_subscribers;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status
  ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at
  ON public.newsletter_subscribers(subscribed_at DESC);

REVOKE ALL ON TABLE public.newsletter_subscribers FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.subscribe_to_newsletter(subscriber_email text, subscriber_source text DEFAULT 'site')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email text := lower(trim(subscriber_email));
BEGIN
  IF length(normalized_email) NOT BETWEEN 5 AND 254
     OR normalized_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Correo electrónico inválido';
  END IF;

  INSERT INTO public.newsletter_subscribers (email, status, source, updated_at)
  VALUES (normalized_email, 'active', COALESCE(NULLIF(trim(subscriber_source), ''), 'site'), now())
  ON CONFLICT (email) DO UPDATE
    SET status = 'active',
        source = EXCLUDED.source,
        updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.subscribe_to_newsletter(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.subscribe_to_newsletter(text, text) TO anon, authenticated;
