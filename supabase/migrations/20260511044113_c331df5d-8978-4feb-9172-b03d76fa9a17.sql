
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users see their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins see all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bootstrap first admin (only works while no admins exist)
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  admin_count INT;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Must be authenticated'; END IF;
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count > 0 THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

-- App settings
CREATE TABLE public.app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  event_end_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  telegram_url TEXT NOT NULL DEFAULT 'https://t.me/wavedrop',
  twitter_url TEXT NOT NULL DEFAULT 'https://x.com/wavedrop',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone reads settings" ON public.app_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.app_settings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_settings_updated
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Admin can delete/manage participants
CREATE POLICY "Admins delete participants" ON public.participants
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Atomic helpers: award task points (idempotent; only awards if not already done)
CREATE OR REPLACE FUNCTION public.award_task(
  _wallet TEXT,
  _task TEXT
) RETURNS public.participants
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  result public.participants;
BEGIN
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

CREATE OR REPLACE FUNCTION public.submit_telegram_username(
  _wallet TEXT,
  _username TEXT
) RETURNS public.participants
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  result public.participants;
  clean TEXT := lower(regexp_replace(_username, '^@', ''));
BEGIN
  IF clean !~ '^[a-z0-9_]{3,32}$' THEN
    RAISE EXCEPTION 'Invalid telegram username';
  END IF;
  UPDATE public.participants
    SET telegram_username = clean,
        points = points + CASE WHEN task_telegram_submitted THEN 0 ELSE 10 END,
        task_telegram_submitted = true
    WHERE wallet_address = _wallet
    RETURNING * INTO result;
  RETURN result;
END;
$$;

-- Award referrer atomically (called server-side on registration)
CREATE OR REPLACE FUNCTION public.award_referral(_ref_code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.participants
    SET points = points + 20, referral_count = referral_count + 1
    WHERE referral_code = _ref_code;
  RETURN FOUND;
END;
$$;

-- Validate referral code exists
CREATE OR REPLACE FUNCTION public.referral_exists(_code TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.participants WHERE referral_code = _code);
$$;
