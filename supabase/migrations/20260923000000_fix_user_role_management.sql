CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  full_name text,
  author_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    u.id,
    u.email,
    COALESCE(
      NULLIF(u.raw_app_meta_data->>'role', ''),
      NULLIF(u.raw_user_meta_data->>'role', ''),
      'editor'
    )::text AS role,
    COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), '')::text AS full_name,
    COALESCE(NULLIF(u.raw_user_meta_data->>'author_name', ''), '')::text AS author_name
  FROM auth.users u
  ORDER BY u.email;
$$;

REVOKE ALL ON FUNCTION public.list_admin_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_user_role(target_email text, target_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_role text;
  target_user_id uuid;
  user_metadata jsonb;
  app_metadata jsonb;
BEGIN
  SELECT COALESCE(
    NULLIF((auth.jwt() -> 'app_metadata' ->> 'role'), ''),
    NULLIF((auth.jwt() -> 'user_metadata' ->> 'role'), ''),
    'editor'
  ) INTO current_role;

  IF current_role <> 'admin' THEN
    RAISE EXCEPTION 'Solo el administrador puede cambiar roles';
  END IF;

  IF target_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Rol inválido';
  END IF;

  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(target_email));

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes cambiar tu propio rol';
  END IF;

  SELECT COALESCE(raw_user_meta_data, '{}'::jsonb), COALESCE(raw_app_meta_data, '{}'::jsonb)
  INTO user_metadata, app_metadata
  FROM auth.users
  WHERE id = target_user_id;

  UPDATE auth.users
  SET
    raw_user_meta_data = user_metadata || jsonb_build_object('role', target_role),
    raw_app_meta_data = app_metadata || jsonb_build_object('role', target_role)
  WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_role(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_role(text, text) TO authenticated;
