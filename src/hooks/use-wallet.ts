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
};

const REF_KEY = "wavedrop_ref";

export function captureReferral() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) localStorage.setItem(REF_KEY, ref.toUpperCase());
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
        const refCode = genReferralCode();
        const referredBy =
          typeof window !== "undefined" ? localStorage.getItem(REF_KEY) : null;

        const { data: inserted, error } = await supabase
          .from("participants")
          .insert({
            wallet_address: addr,
            referral_code: refCode,
            referred_by: referredBy,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            // race: re-fetch
            p = await fetchParticipant(addr);
          } else throw error;
        } else {
          p = inserted as Participant;
          // award referrer
          if (referredBy) {
            const { data: ref } = await supabase
              .from("participants")
              .select("id, points, referral_count")
              .eq("referral_code", referredBy)
              .maybeSingle();
            if (ref) {
              await supabase
                .from("participants")
                .update({
                  points: (ref.points ?? 0) + 20,
                  referral_count: (ref.referral_count ?? 0) + 1,
                })
                .eq("id", ref.id);
            }
            localStorage.removeItem(REF_KEY);
          }
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
