import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Download, Lock, Users, Coins, Award, Trash2, Save, Calendar,
  Ban, ShieldCheck, Plus, Minus, Wallet, KeyRound,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shortAddr } from "@/lib/wallet";
import { useWallet } from "@/hooks/use-wallet";
import { useSettings } from "@/hooks/use-settings";
import { useAdminSession } from "@/hooks/use-admin-session";
import {
  adminAdjustPoints, adminToggleBan, adminDeleteParticipant, adminUpdateSettings,
} from "@/lib/admin.functions";

export const ADMIN_WALLET = "0xfa7447e7ef44c1f36e6bd424edbf0324df92cd1a";
export const isAdminWallet = (a?: string | null) =>
  !!a && a.toLowerCase() === ADMIN_WALLET;

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Orbexa Network" }] }),
  component: Admin,
});

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
  is_banned: boolean;
  created_at: string;
};

function Admin() {
  const { address, connect, loading: walletLoading, hydrated } = useWallet();
  const isAdmin = isAdminWallet(address);
  const { settings, refresh: refreshSettings } = useSettings();
  const adminAuth = useAdminSession();
  const callAdjust = useServerFn(adminAdjustPoints);
  const callToggleBan = useServerFn(adminToggleBan);
  const callDelete = useServerFn(adminDeleteParticipant);
  const callUpdateSettings = useServerFn(adminUpdateSettings);

  const [rows, setRows] = useState<P[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "banned" | "active" | "complete">("all");
  const [loadingRows, setLoadingRows] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [tgUrl, setTgUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRows = async () => {
    setLoadingRows(true);
    const { data } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as P[]) ?? []);
    setLoadingRows(false);
  };

  useEffect(() => { if (isAdmin) loadRows(); }, [isAdmin]);

  useEffect(() => {
    setEventDate(toDateInput(settings.event_end_at));
    setTgUrl(settings.telegram_url);
    setXUrl(settings.twitter_url);
  }, [settings]);

  const filtered = useMemo(() => {
    let r = rows;
    if (filter === "banned") r = r.filter((x) => x.is_banned);
    if (filter === "active") r = r.filter((x) => !x.is_banned);
    if (filter === "complete") r = r.filter((x) =>
      x.task_telegram_joined && x.task_twitter_followed && x.task_telegram_submitted
    );
    if (!q) return r;
    const s = q.toLowerCase();
    return r.filter(
      (x) =>
        x.wallet_address.toLowerCase().includes(s) ||
        x.referral_code.toLowerCase().includes(s) ||
        (x.telegram_username ?? "").toLowerCase().includes(s)
    );
  }, [rows, q, filter]);

  const totalPoints = rows.reduce((a, r) => a + r.points, 0);
  const totalRefs = rows.reduce((a, r) => a + r.referral_count, 0);
  const banned = rows.filter((r) => r.is_banned).length;

  const chart = useMemo(() => {
    const days = 14;
    const buckets: { day: string; count: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      buckets.push({ day: `${d.getMonth() + 1}/${d.getDate()}`, count: 0 });
    }
    rows.forEach((r) => {
      const created = new Date(r.created_at);
      const idx = days - 1 - Math.floor((Date.now() - created.getTime()) / 86400000);
      if (idx >= 0 && idx < days) buckets[idx].count++;
    });
    return buckets;
  }, [rows]);

  const maxBar = Math.max(1, ...chart.map((b) => b.count));

  const withAuth = async () => {
    const s = await adminAuth.ensure();
    if (!s) throw new Error("Admin signature required");
    return { message: s.message, signature: s.signature };
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setSaving(true);
    try {
      const auth = await withAuth();
      const iso = new Date(eventDate).toISOString();
      await callUpdateSettings({
        data: { ...auth, eventEndAt: iso, telegramUrl: tgUrl, twitterUrl: xUrl },
      });
      toast.success("Settings saved");
      await refreshSettings();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deleteParticipant = async (p: P) => {
    if (!address) return;
    if (!confirm(`Delete ${shortAddr(p.wallet_address)}? This cannot be undone.`)) return;
    try {
      const auth = await withAuth();
      await callDelete({ data: { ...auth, participantId: p.id } });
      setRows((r) => r.filter((x) => x.id !== p.id));
      toast.success("Participant removed");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const toggleBan = async (p: P) => {
    if (!address) return;
    try {
      const auth = await withAuth();
      const updated = await callToggleBan({ data: { ...auth, participantId: p.id } });
      setRows((r) => r.map((x) => (x.id === p.id ? (updated as P) : x)));
      toast.success(p.is_banned ? "Wallet unbanned" : "Wallet banned");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const adjustPoints = async (p: P, delta: number) => {
    if (!address) return;
    try {
      const auth = await withAuth();
      const updated = await callAdjust({
        data: { ...auth, participantId: p.id, delta },
      });
      setRows((r) => r.map((x) => (x.id === p.id ? (updated as P) : x)));
      toast.success(`${delta > 0 ? "+" : ""}${delta} points`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const exportCSV = () => {
    const headers = [
      "wallet_address", "telegram_username", "referral_code", "referred_by",
      "points", "referral_count", "telegram_joined", "twitter_followed", "telegram_submitted",
      "is_banned", "created_at",
    ];
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        [
          r.wallet_address, r.telegram_username ?? "", r.referral_code, r.referred_by ?? "",
          r.points, r.referral_count, r.task_telegram_joined, r.task_twitter_followed,
          r.task_telegram_submitted, r.is_banned, r.created_at,
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orbexa-participants-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} wallets`);
  };

  if (!hydrated) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">Checking access…</div>;
  }

  if (!address) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="glass-card rounded-2xl p-8 text-center">
          <Wallet className="w-10 h-10 mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold text-gradient">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Connect the admin wallet to manage Orbexa Network.
          </p>
          <button onClick={connect} disabled={walletLoading} className="btn-neon mt-5 w-full">
            {walletLoading ? "Connecting…" : "Connect Wallet"}
          </button>
          <Link to="/" className="block text-xs text-muted-foreground mt-3">← Back home</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="glass-card rounded-2xl p-8 text-center">
          <Lock className="w-10 h-10 mx-auto text-destructive mb-3" />
          <h1 className="text-2xl font-bold text-gradient">Not authorized</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Wallet <span className="font-mono">{shortAddr(address)}</span> is not the admin wallet.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Only the official admin wallet can access this panel.
          </p>
          <Link to="/" className="block text-xs text-muted-foreground mt-4">← Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-gradient">Admin Panel</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Admin wallet <span className="font-mono text-foreground">{shortAddr(address)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {adminAuth.isValid ? (
            <button
              onClick={adminAuth.clear}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-secondary/40 text-secondary text-xs hover:bg-secondary/10"
            >
              <ShieldCheck className="w-4 h-4" /> Session active · Revoke
            </button>
          ) : (
            <button
              onClick={adminAuth.sign}
              disabled={adminAuth.signing}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/40 text-primary text-xs hover:bg-primary/10"
            >
              <KeyRound className="w-4 h-4" />
              {adminAuth.signing ? "Awaiting signature…" : "Sign admin session"}
            </button>
          )}
          <button onClick={exportCSV} className="btn-neon inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { i: Users, l: "Participants", v: rows.length },
          { i: Coins, l: "Total Points", v: totalPoints.toLocaleString() },
          { i: Award, l: "Total Referrals", v: totalRefs },
          { i: Ban, l: "Banned", v: banned },
        ].map((s) => (
          <div key={s.l} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <s.i className="w-4 h-4" /> {s.l}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gradient mt-2 font-mono">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Signups · Last 14 days</h2>
          <span className="text-xs text-muted-foreground font-mono">
            Total: {chart.reduce((a, b) => a + b.count, 0)}
          </span>
        </div>
        <div className="flex items-end gap-1.5 h-40">
          {chart.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group">
              <div
                className="w-full rounded-t-md bg-gradient-primary shadow-neon-purple transition-all relative hover:opacity-80"
                style={{ height: `${(b.count / maxBar) * 100}%`, minHeight: b.count > 0 ? 4 : 2 }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition bg-card px-1.5 py-0.5 rounded border border-border">
                  {b.count}
                </div>
              </div>
              <div className="text-[9px] text-muted-foreground font-mono">{b.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <form onSubmit={saveSettings} className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Event & Links Configuration</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Event end date">
            <input type="datetime-local" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="input" />
          </Field>
          <Field label="Telegram URL">
            <input value={tgUrl} onChange={(e) => setTgUrl(e.target.value)} className="input" />
          </Field>
          <Field label="Twitter / X URL">
            <input value={xUrl} onChange={(e) => setXUrl(e.target.value)} className="input" />
          </Field>
        </div>
        <button type="submit" disabled={saving} className="btn-neon inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Settings"}
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search wallet, code, telegram…"
          className="input flex-1 min-w-[200px]"
        />
        <div className="flex gap-1 rounded-lg p-1 bg-input border border-border">
          {(["all", "active", "complete", "banned"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition ${
                filter === k ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingRows ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No participants.</td></tr>
              ) : (
                filtered.map((r) => {
                  const tasks = [r.task_telegram_joined, r.task_twitter_followed, r.task_telegram_submitted].filter(Boolean).length;
                  return (
                    <tr key={r.id} className={`border-t border-border/50 hover:bg-accent/30 ${r.is_banned ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          {r.is_banned && <Ban className="w-3 h-3 text-destructive shrink-0" />}
                          {shortAddr(r.wallet_address)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{r.telegram_username ? `@${r.telegram_username}` : "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-secondary">{r.referral_code}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => adjustPoints(r, -10)} className="p-1 rounded hover:bg-destructive/20 text-destructive" aria-label="-10">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono w-12 text-right">{r.points}</span>
                          <button onClick={() => adjustPoints(r, 10)} className="p-1 rounded hover:bg-secondary/20 text-secondary" aria-label="+10">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-secondary">{r.referral_count}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-mono ${tasks === 3 ? "text-secondary" : "text-muted-foreground"}`}>{tasks}/3</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => toggleBan(r)}
                            className={`p-2 rounded-lg transition ${r.is_banned ? "text-secondary hover:bg-secondary/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
                            aria-label={r.is_banned ? "Unban" : "Ban"}
                            title={r.is_banned ? "Unban wallet" : "Ban wallet"}
                          >
                            {r.is_banned ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteParticipant(r)}
                            className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .input {
          padding: 0.65rem 0.875rem;
          border-radius: 0.625rem;
          background: hsl(var(--input) / 1);
          border: 1px solid hsl(var(--border));
          width: 100%;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }
        .input:focus { outline: none; border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function toDateInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
