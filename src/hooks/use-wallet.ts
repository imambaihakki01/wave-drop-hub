import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { connectMetaMask, genReferralCode, walletStorage } from "@/lib/wallet";

export type Participant = {
  id: string;
  wallet_address: string;
  telegram_username: string | null;
  referral_code: string;
  referred_by: string | null;
  points: number;
  referral_count: number;
  task_telegram_joined: boolean;
  task_twitter_followed: boolean;
  task_telegram_submitted: boolean;
  is_banned: boolean;
  last_check_in: string | null;
};

const REF_KEY = "wavedrop_ref";

export async function captureReferral() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return;
  const code = ref.toUpperCase().trim();
  // Validate the code exists before saving
  const { data: exists } = await supabase.rpc("referral_exists", { _code: code });
  if (exists) {
    localStorage.setItem(REF_KEY, code);
  } else {
    console.warn("Invalid referral code ignored:", code);
  }
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const fetchParticipant = useCallback(async (addr: string) => {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("wallet_address", addr)
      .maybeSingle();
    setParticipant(data as Participant | null);
    return data as Participant | null;
  }, []);

  useEffect(() => {
    const saved = walletStorage.get();
    if (saved) {
      setAddress(saved);
      fetchParticipant(saved);
    }
    setHydrated(true);
  }, [fetchParticipant]);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      const addr = await connectMetaMask();
      walletStorage.set(addr);
      setAddress(addr);

      let p = await fetchParticipant(addr);
      if (!p) {
        // Generate unique referral code (retry on collision)
        let refCode = genReferralCode();
        const referredBy =
          typeof window !== "undefined" ? localStorage.getItem(REF_KEY) : null;

        let attempts = 0;
        while (attempts < 5) {
          const { data: inserted, error } = await supabase
            .from("participants")
            .insert({
              wallet_address: addr,
              referral_code: refCode,
              referred_by: referredBy && referredBy !== refCode ? referredBy : null,
            })
            .select()
            .single();

          if (!error) { p = inserted as Participant; break; }
          if (error.code === "23505") {
            // Could be wallet duplicate (race) or referral_code collision
            const existing = await fetchParticipant(addr);
            if (existing) { p = existing; break; }
            refCode = genReferralCode();
            attempts++;
            continue;
          }
          throw error;
        }
        if (!p) throw new Error("Could not register wallet, please retry");

        // Award referrer atomically (DB-side guard)
        if (referredBy) {
          await supabase.rpc("award_referral", { _ref_code: referredBy });
          localStorage.removeItem(REF_KEY);
        }
        setParticipant(p);
        toast.success("Wallet connected — welcome to WaveDrop!");
      } else {
        toast.success("Welcome back!");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }, [fetchParticipant]);

  const disconnect = useCallback(() => {
    walletStorage.clear();
    setAddress(null);
    setParticipant(null);
    toast("Wallet disconnected");
  }, []);

  const refresh = useCallback(async () => {
    if (address) await fetchParticipant(address);
  }, [address, fetchParticipant]);

  return { address, participant, loading, hydrated, connect, disconnect, refresh };
}
