
-- Admin wallet helper
CREATE OR REPLACE FUNCTION public.is_admin_wallet(_wallet text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT lower(coalesce(_wallet, '')) = lower('0xfA7447e7Ef44c1f36e6bD424eDbf0324df92cD1a');
$$;

-- Adjust points by admin wallet
CREATE OR REPLACE FUNCTION public.admin_adjust_points(_caller text, _participant_id uuid, _delta integer)
RETURNS public.participants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.participants;
BEGIN
  IF NOT public.is_admin_wallet(_caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.participants
    SET points = GREATEST(0, points + _delta)
    WHERE id = _participant_id
    RETURNING * INTO result;
  RETURN result;
END;
$$;

-- Toggle ban by admin wallet
CREATE OR REPLACE FUNCTION public.admin_toggle_ban(_caller text, _participant_id uuid)
RETURNS public.participants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.participants;
BEGIN
  IF NOT public.is_admin_wallet(_caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.participants
    SET is_banned = NOT is_banned
    WHERE id = _participant_id
    RETURNING * INTO result;
  RETURN result;
END;
$$;

-- Update settings via RPC (caller must be admin wallet)
CREATE OR REPLACE FUNCTION public.admin_update_settings(
  _caller text,
  _event_end_at timestamptz,
  _telegram_url text,
  _twitter_url text
)
RETURNS public.app_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.app_settings;
BEGIN
  IF NOT public.is_admin_wallet(_caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.app_settings
    SET event_end_at = _event_end_at,
        telegram_url = _telegram_url,
        twitter_url = _twitter_url,
        updated_at = now()
    WHERE id = 1
    RETURNING * INTO result;
  RETURN result;
END;
$$;

-- Delete participant via RPC (caller must be admin wallet)
CREATE OR REPLACE FUNCTION public.admin_delete_participant(_caller text, _participant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_wallet(_caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  DELETE FROM public.participants WHERE id = _participant_id;
  RETURN FOUND;
END;
$$;
