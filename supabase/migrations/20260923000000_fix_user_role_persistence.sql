CREATE OR REPLACE FUNCTION public.set_user_role(target_email text, target_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_role text;
  target_user_id uuid;
  metadata jsonb;
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
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  metadata := COALESCE(
    (SELECT raw_user_meta_data FROM auth.users WHERE id = target_user_id),
    '{}'::jsonb
  );

  UPDATE auth.users
  SET raw_user_meta_data = metadata || jsonb_build_object('role', target_role),
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', target_role)
  WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_role(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_role(text, text) TO authenticated;
