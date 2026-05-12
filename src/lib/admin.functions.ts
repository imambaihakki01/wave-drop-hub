import { createServerFn } from "@tanstack/react-start";
import { verifyMessage } from "ethers";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_WALLET = "0xfa7447e7ef44c1f36e6bd424edbf0324df92cd1a";
const MSG_PREFIX = "Michat Admin Auth";

type AuthInput = { message: string; signature: string };

function verifyAdmin({ message, signature }: AuthInput) {
  if (!message?.startsWith(MSG_PREFIX)) throw new Error("Invalid admin message");
  // Parse "Valid until: <ISO>"
  const m = message.match(/Valid until:\s*(\S+)/);
  if (!m) throw new Error("Invalid admin message format");
  const validUntil = Date.parse(m[1]);
  if (!Number.isFinite(validUntil) || validUntil < Date.now()) {
    throw new Error("Admin session expired — please re-sign.");
  }
  let recovered: string;
  try {
    recovered = verifyMessage(message, signature).toLowerCase();
  } catch {
    throw new Error("Invalid signature");
  }
  if (recovered !== ADMIN_WALLET) throw new Error("Forbidden: not admin wallet");
  return recovered;
}

export const adminAdjustPoints = createServerFn({ method: "POST" })
  .inputValidator((d: AuthInput & { participantId: string; delta: number }) => d)
  .handler(async ({ data }) => {
    verifyAdmin(data);
    const { data: row, error } = await supabaseAdmin
      .from("participants")
      .select("points")
      .eq("id", data.participantId)
      .single();
    if (error) throw new Error(error.message);
    const next = Math.max(0, (row?.points ?? 0) + data.delta);
    const { data: updated, error: uerr } = await supabaseAdmin
      .from("participants")
      .update({ points: next })
      .eq("id", data.participantId)
      .select()
      .single();
    if (uerr) throw new Error(uerr.message);
    return updated;
  });

export const adminToggleBan = createServerFn({ method: "POST" })
  .inputValidator((d: AuthInput & { participantId: string }) => d)
  .handler(async ({ data }) => {
    verifyAdmin(data);
    const { data: row, error } = await supabaseAdmin
      .from("participants")
      .select("is_banned")
      .eq("id", data.participantId)
      .single();
    if (error) throw new Error(error.message);
    const { data: updated, error: uerr } = await supabaseAdmin
      .from("participants")
      .update({ is_banned: !row.is_banned })
      .eq("id", data.participantId)
      .select()
      .single();
    if (uerr) throw new Error(uerr.message);
    return updated;
  });

export const adminDeleteParticipant = createServerFn({ method: "POST" })
  .inputValidator((d: AuthInput & { participantId: string }) => d)
  .handler(async ({ data }) => {
    verifyAdmin(data);
    const { error } = await supabaseAdmin
      .from("participants")
      .delete()
      .eq("id", data.participantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .inputValidator(
    (d: AuthInput & {
      eventEndAt: string;
      telegramUrl: string;
      twitterUrl: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    verifyAdmin(data);
    const { data: updated, error } = await supabaseAdmin
      .from("app_settings")
      .update({
        event_end_at: data.eventEndAt,
        telegram_url: data.telegramUrl,
        twitter_url: data.twitterUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });
