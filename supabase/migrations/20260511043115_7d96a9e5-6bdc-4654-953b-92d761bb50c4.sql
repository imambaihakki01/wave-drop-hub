
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  telegram_username TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  referral_count INTEGER NOT NULL DEFAULT 0,
  task_telegram_joined BOOLEAN NOT NULL DEFAULT false,
  task_twitter_followed BOOLEAN NOT NULL DEFAULT false,
  task_telegram_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_participants_wallet ON public.participants(lower(wallet_address));
CREATE INDEX idx_participants_referral_code ON public.participants(referral_code);
CREATE INDEX idx_participants_points ON public.participants(points DESC);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view participants"
  ON public.participants FOR SELECT
  USING (true);

CREATE POLICY "Public can insert participants"
  ON public.participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update participants"
  ON public.participants FOR UPDATE
  USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_participants_updated
  BEFORE UPDATE ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
