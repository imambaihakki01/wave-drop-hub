import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Lock, Users, Coins, Award, LogOut, Trash2, Save, Calendar, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shortAddr } from "@/lib/wallet";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — WaveDrop" }] }),
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
  created_at: string;
};

function Admin() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { settings, refresh: refreshSettings } = useSettings();

  const [rows, setRows] = useState<P[]>([]);
  const [q, setQ] = useState("");
  const [loadingRows, setLoadingRows] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [tgUrl, setTgUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasAdmins, setHasAdmins] = useState<boolean | null>(null);

  // Redirect to /auth if not signed in
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  // Check if any admin exists (for bootstrap)
  useEffect(() => {
    if (!user || isAdmin) return;
    supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .then(({ count }) => setHasAdmins((count ?? 0) > 0));
  }, [user, isAdmin]);

  // Load data when admin
  useEffect(() => {
    if (!isAdmin) return;
    setLoadingRows(true);
    supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as P[]) ?? []);
        setLoadingRows(false);
      });
  }, [isAdmin]);

  useEffect(() => {
    setEventDate(toDateInput(settings.event_end_at));
    setTgUrl(settings.telegram_url);
    setXUrl(settings.twitter_url);
  }, [settings]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.wallet_address.toLowerCase().includes(s) ||
        r.referral_code.toLowerCase().includes(s) ||
        (r.telegram_username ?? "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  const totalPoints = rows.reduce((a, r) => a + r.points, 0);
  const totalRefs = rows.reduce((a, r) => a + r.referral_count, 0);

  const claimAdmin = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) return toast.error(error.message);
    if (data) {
      toast.success("You are now the WaveDrop admin");
      window.location.reload();
    } else {
      toast.error("An admin already exists. Contact them for access.");
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const iso = new Date(eventDate).toISOString();
      const { error } = await supabase
        .from("app_settings")
        .update({ event_end_at: iso, telegram_url: tgUrl, twitter_url: xUrl })
        .eq("id", 1);
      if (error) throw error;
      toast.success("Settings saved");
      await refreshSettings();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deleteParticipant = async (p: P) => {
    if (!confirm(`Delete ${shortAddr(p.wallet_address)}? This cannot be undone.`)) return;
    const { error } = await supabase.from("participants").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== p.id));
    toast.success("Participant removed");
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

  // ---- Render states ----

  if (authLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted-foreground">Checking access…</div>;
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="glass-card rounded-2xl p-8 text-center">
          <Lock className="w-10 h-10 mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold text-gradient">Not authorized</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your account ({user.email}) doesn't have admin role.
          </p>

          {hasAdmins === false && (
            <div className="mt-5 p-4 rounded-xl border border-secondary/40 bg-secondary/5">
              <Crown className="w-6 h-6 mx-auto text-secondary mb-2" />
              <p className="text-sm">
                No admin exists yet. Claim it to become the first WaveDrop administrator.
              </p>
              <button onClick={claimAdmin} className="btn-neon mt-3 w-full">
                Claim Admin Access
              </button>
            </div>
          )}

          <button onClick={signOut} className="btn-outline-neon mt-4 w-full">
            <LogOut className="w-4 h-4 inline mr-2" /> Sign out
          </button>
          <Link to="/" className="block text-xs text-muted-foreground mt-3">← Back home</Link>
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
            Signed in as <span className="font-mono text-foreground">{user.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-neon inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={signOut} className="btn-outline-neon inline-flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      {/* Stats */}
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

      {/* Settings */}
      <form onSubmit={saveSettings} className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Event & Links Configuration</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Event end date">
            <input
              type="datetime-local"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input"
            />
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

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search wallet, code, telegram…"
        className="input w-full"
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
                <th className="px-4 py-3"></th>
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
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteParticipant(r)}
                          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          background: var(--input);
          border: 1px solid var(--border);
          color: var(--foreground);
          color-scheme: dark;
        }
        .input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: var(--shadow-neon-purple);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}

function toDateInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
