
-- Tighten participants: block direct UPDATE/DELETE from clients.
-- All mutations must go through SECURITY DEFINER RPCs
-- (award_task, claim_daily, submit_telegram_username, award_referral,
--  admin_adjust_points, admin_toggle_ban, admin_delete_participant).
DROP POLICY IF EXISTS "Public can update participants" ON public.participants;
DROP POLICY IF EXISTS "Admins delete participants" ON public.participants;

CREATE POLICY "No direct updates to participants"
  ON public.participants FOR UPDATE
  USING (false) WITH CHECK (false);

CREATE POLICY "No direct deletes on participants"
  ON public.participants FOR DELETE
  USING (false);

-- Tighten app_settings: block direct UPDATE.
-- Updates happen only via admin_update_settings RPC (verifies admin wallet).
DROP POLICY IF EXISTS "Admins update settings" ON public.app_settings;

CREATE POLICY "No direct updates to settings"
  ON public.app_settings FOR UPDATE
  USING (false) WITH CHECK (false);

-- Ensure RLS is enabled (idempotent safety)
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
