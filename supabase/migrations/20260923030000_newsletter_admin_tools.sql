CREATE OR REPLACE FUNCTION public.list_newsletter_subscribers()
RETURNS TABLE (
  id uuid,
  email text,
  status text,
  source text,
  subscribed_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_role text;
BEGIN
  SELECT COALESCE(
    NULLIF((auth.jwt() -> 'app_metadata' ->> 'role'), ''),
    NULLIF((auth.jwt() -> 'user_metadata' ->> 'role'), ''),
    'editor'
  ) INTO current_role;

  IF current_role <> 'admin' THEN
    RAISE EXCEPTION 'Solo el administrador puede consultar suscriptores';
  END IF;

  RETURN QUERY
  SELECT s.id, s.email, s.status, s.source, s.subscribed_at, s.updated_at
  FROM public.newsletter_subscribers s
  ORDER BY s.subscribed_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_newsletter_subscribers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_newsletter_subscribers() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_newsletter_subscriber_status(target_id uuid, target_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_role text;
BEGIN
  SELECT COALESCE(
    NULLIF((auth.jwt() -> 'app_metadata' ->> 'role'), ''),
    NULLIF((auth.jwt() -> 'user_metadata' ->> 'role'), ''),
    'editor'
  ) INTO current_role;

  IF current_role <> 'admin' THEN
    RAISE EXCEPTION 'Solo el administrador puede modificar suscriptores';
  END IF;

  IF target_status NOT IN ('active', 'unsubscribed') THEN
    RAISE EXCEPTION 'Estado inválido';
  END IF;

  UPDATE public.newsletter_subscribers
  SET status = target_status, updated_at = now()
  WHERE id = target_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_newsletter_subscriber_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_newsletter_subscriber_status(uuid, text) TO authenticated;
