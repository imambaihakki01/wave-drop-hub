
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMPTZ;

-- Daily check-in: +5 points if 20h+ since last check-in
CREATE OR REPLACE FUNCTION public.claim_daily(_wallet TEXT)
RETURNS public.participants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.participants;
  current_last TIMESTAMPTZ;
  banned BOOLEAN;
BEGIN
  SELECT last_check_in, is_banned INTO current_last, banned
    FROM public.participants WHERE wallet_address = _wallet;
  IF banned THEN RAISE EXCEPTION 'Wallet is suspended'; END IF;
  IF current_last IS NOT NULL AND current_last > now() - interval '20 hours' THEN
    RAISE EXCEPTION 'Already claimed. Try again later.';
  END IF;
  UPDATE public.participants
    SET last_check_in = now(), points = points + 5
    WHERE wallet_address = _wallet
    RETURNING * INTO result;
  RETURN result;
END;
$$;

-- Admin: adjust points
CREATE OR REPLACE FUNCTION public.admin_adjust_points(_participant_id UUID, _delta INT)
RETURNS public.participants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.participants;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.participants
    SET points = GREATEST(0, points + _delta)
    WHERE id = _participant_id
    RETURNING * INTO result;
  RETURN result;
END;
$$;

-- Admin: toggle ban
CREATE OR REPLACE FUNCTION public.admin_toggle_ban(_participant_id UUID)
RETURNS public.participants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.participants;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.participants
    SET is_banned = NOT is_banned
    WHERE id = _participant_id
    RETURNING * INTO result;
  RETURN result;
END;
$$;

-- Block awards for banned wallets at the source
CREATE OR REPLACE FUNCTION public.award_task(_wallet text, _task text)
 RETURNS participants
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  result public.participants;
  banned BOOLEAN;
BEGIN
  SELECT is_banned INTO banned FROM public.participants WHERE wallet_address = _wallet;
  IF banned THEN RAISE EXCEPTION 'Wallet is suspended'; END IF;
  IF _task NOT IN ('telegram_joined', 'twitter_followed') THEN
    RAISE EXCEPTION 'Invalid task: %', _task;
  END IF;
  IF _task = 'telegram_joined' THEN
    UPDATE public.participants
      SET task_telegram_joined = true,
          points = points + CASE WHEN task_telegram_joined THEN 0 ELSE 10 END
      WHERE wallet_address = _wallet
      RETURNING * INTO result;
  ELSE
    UPDATE public.participants
      SET task_twitter_followed = true,
          points = points + CASE WHEN task_twitter_followed THEN 0 ELSE 10 END
      WHERE wallet_address = _wallet
      RETURNING * INTO result;
  END IF;
  RETURN result;
END;
$$;
