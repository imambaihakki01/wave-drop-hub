
-- Revoke public execution of caller-based admin RPCs.
-- These checked `_caller` as a plain text parameter, which a malicious
-- client could spoof. All admin actions now go through server functions
-- that verify a signed message from the admin wallet, then use the
-- service role to mutate data.
REVOKE EXECUTE ON FUNCTION public.admin_adjust_points(text, uuid, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_toggle_ban(text, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_delete_participant(text, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_update_settings(text, timestamptz, text, text) FROM anon, authenticated, public;

-- Also revoke the older role-based admin RPCs that relied on the removed
-- auth/role flow.
REVOKE EXECUTE ON FUNCTION public.admin_adjust_points(uuid, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_toggle_ban(uuid) FROM anon, authenticated, public;
