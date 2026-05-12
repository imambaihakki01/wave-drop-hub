import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { toast } from "sonner";

const KEY = "orbexa_admin_sig";
const TTL_MIN = 30;

export type AdminSession = { message: string; signature: string; validUntil: number };

function read(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AdminSession;
    if (s.validUntil < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    setSession(read());
  }, []);

  const sign = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("MetaMask not detected");
      return null;
    }
    setSigning(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const validUntil = Date.now() + TTL_MIN * 60_000;
      const message = [
        "Orbexa Admin Auth",
        `Nonce: ${crypto.randomUUID()}`,
        `Valid until: ${new Date(validUntil).toISOString()}`,
      ].join("\n");
      const signature = await signer.signMessage(message);
      const s: AdminSession = { message, signature, validUntil };
      sessionStorage.setItem(KEY, JSON.stringify(s));
      setSession(s);
      toast.success(`Admin session active (${TTL_MIN} min)`);
      return s;
    } catch (e: any) {
      toast.error(e?.message ?? "Signature rejected");
      return null;
    } finally {
      setSigning(false);
    }
  }, []);

  const clear = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setSession(null);
  }, []);

  const ensure = useCallback(async (): Promise<AdminSession | null> => {
    const cur = read();
    if (cur) return cur;
    return sign();
  }, [sign]);

  return { session, signing, sign, clear, ensure, isValid: !!session };
}
