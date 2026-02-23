
CREATE OR REPLACE FUNCTION public.increment_star_dust(uid UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles SET star_dust = star_dust + amount WHERE id = uid;
END;
$$;
