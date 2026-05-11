import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Lock, Users, Coins, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shortAddr } from "@/lib/wallet";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — WaveDrop" }] }),
  component: Admin,
});

const ADMIN_PASS = "wavedrop2024"; // simple demo gate; for production use proper auth

type P = {
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
  created_at: string;
};

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [rows, setRows] = useState<P[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("wd_admin") === "1") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as P[]) ?? []);
        setLoading(false);
      });
  }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem("wd_admin", "1");
      setAuthed(true);
      toast.success("Welcome, admin");
    } else toast.error("Wrong password");
  };

  const exportCSV = () => {
    const headers = [
      "wallet_address", "telegram_username", "referral_code", "referred_by",
      "points", "referral_count", "telegram_joined", "twitter_followed", "telegram_submitted", "created_at",
    ];
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        [
          r.wallet_address, r.telegram_username ?? "", r.referral_code, r.referred_by ?? "",
          r.points, r.referral_count, r.task_telegram_joined, r.task_twitter_followed,
          r.task_telegram_submitted, r.created_at,
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wavedrop-participants-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} wallets`);
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <form onSubmit={login} className="glass-card rounded-2xl p-8 text-center">
          <Lock className="w-10 h-10 mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter password to continue.</p>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Password"
            className="mt-5 w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:border-primary focus:shadow-neon-purple"
          />
          <button type="submit" className="btn-neon w-full mt-3">Enter</button>
          <p className="text-[10px] text-muted-foreground mt-3 font-mono">Demo: wavedrop2024</p>
        </form>
      </div>
    );
  }

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      r.wallet_address.toLowerCase().includes(s) ||
      r.referral_code.toLowerCase().includes(s) ||
      (r.telegram_username ?? "").toLowerCase().includes(s)
    );
  });

  const totalPoints = rows.reduce((a, r) => a + r.points, 0);
  const totalRefs = rows.reduce((a, r) => a + r.referral_count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-gradient">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage WaveDrop participants.</p>
        </div>
        <button onClick={exportCSV} className="btn-neon inline-flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {[
          { i: Users, l: "Participants", v: rows.length },
          { i: Coins, l: "Total Points", v: totalPoints.toLocaleString() },
          { i: Award, l: "Total Referrals", v: totalRefs },
        ].map((s) => (
          <div key={s.l} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <s.i className="w-4 h-4" /> {s.l}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gradient mt-2 font-mono">{s.v}</div>
          </div>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search wallet, code, telegram…"
        className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:border-primary focus:shadow-neon-purple"
      />

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/40 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Wallet</th>
                <th className="px-4 py-3 text-left">Telegram</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Refs</th>
                <th className="px-4 py-3 text-center">Tasks</th>
                <th className="px-4 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No participants.</td></tr>
              ) : (
                filtered.map((r) => {
                  const tasks = [r.task_telegram_joined, r.task_twitter_followed, r.task_telegram_submitted].filter(Boolean).length;
                  return (
                    <tr key={r.id} className="border-t border-border/50 hover:bg-accent/30">
                      <td className="px-4 py-3 font-mono text-xs">{shortAddr(r.wallet_address)}</td>
                      <td className="px-4 py-3 text-xs">{r.telegram_username ? `@${r.telegram_username}` : "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-secondary">{r.referral_code}</td>
                      <td className="px-4 py-3 text-right font-mono">{r.points}</td>
                      <td className="px-4 py-3 text-right font-mono text-secondary">{r.referral_count}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-mono ${tasks === 3 ? "text-secondary" : "text-muted-foreground"}`}>{tasks}/3</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
