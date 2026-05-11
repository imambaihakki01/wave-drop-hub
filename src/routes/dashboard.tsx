import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Copy, Check, Wallet, Coins, Users, ListChecks, ExternalLink,
  Send, Twitter, Calendar, Sparkles, AlertOctagon,
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { shortAddr } from "@/lib/wallet";
import { ShareButtons } from "@/components/ShareButtons";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — WaveDrop" },
      { name: "description", content: "Your WaveDrop control center: tasks, daily check-in, referrals and points." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { address, participant, connect, loading, refresh, hydrated } = useWallet();
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);
  const [tg, setTg] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  if (!hydrated) {
    return <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!address || !participant) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-24 text-center">
        <div className="glass-card rounded-2xl p-10">
          <Wallet className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-gradient">Connect to continue</h1>
          <p className="text-muted-foreground mt-2">Sign in with MetaMask to access your WaveDrop dashboard.</p>
          <button onClick={connect} disabled={loading} className="btn-neon mt-6">
            {loading ? "Connecting…" : "Connect MetaMask"}
          </button>
        </div>
      </div>
    );
  }

  const refLink = typeof window !== "undefined" ? `${window.location.origin}/?ref=${participant.referral_code}` : "";
  const shareText = `🌊 I'm riding the WaveDrop airdrop wave! Join via my link and we both earn points.`;

  const tasksDone =
    [participant.task_telegram_joined, participant.task_twitter_followed, participant.task_telegram_submitted].filter(Boolean).length;
  const progress = Math.round((tasksDone / 3) * 100);

  // Tier system
  const tier =
    participant.points >= 200 ? { name: "Tsunami", color: "oklch(0.7 0.28 340)" }
    : participant.points >= 100 ? { name: "Wave", color: "oklch(0.65 0.28 295)" }
    : participant.points >= 50 ? { name: "Surfer", color: "oklch(0.7 0.22 235)" }
    : { name: "Drifter", color: "oklch(0.7 0.04 280)" };

  // Daily check-in availability
  const lastCheckIn = participant.last_check_in ? new Date(participant.last_check_in).getTime() : 0;
  const nextCheckInMs = lastCheckIn + 20 * 3600_000;
  const canCheckIn = Date.now() >= nextCheckInMs;
  const hoursLeft = Math.max(0, Math.ceil((nextCheckInMs - Date.now()) / 3600_000));

  const copy = async () => {
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const completeTask = async (
    task: "telegram_joined" | "twitter_followed",
    field: "task_telegram_joined" | "task_twitter_followed",
    label: string
  ) => {
    if (participant[field]) return;
    setBusy(field);
    try {
      const { error } = await supabase.rpc("award_task", { _wallet: participant.wallet_address, _task: task });
      if (error) throw error;
      toast.success(`${label} — +10 points!`);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  };

  const submitTelegram = async () => {
    const v = tg.trim().replace(/^@/, "");
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(v)) return toast.error("Username must be 3-32 chars (letters, digits, underscore)");
    setBusy("tg");
    try {
      const { error } = await supabase.rpc("submit_telegram_username", { _wallet: participant.wallet_address, _username: v });
      if (error) throw error;
      toast.success(participant.task_telegram_submitted ? "Telegram username updated" : "Telegram submitted — +10 points!");
      setTg("");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  };

  const claimDaily = async () => {
    setBusy("daily");
    try {
      const { error } = await supabase.rpc("claim_daily", { _wallet: participant.wallet_address });
      if (error) throw error;
      toast.success("Daily claim — +5 points! 🌊");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  };

  const stats = [
    { icon: Wallet, label: "Wallet", value: shortAddr(address), mono: true },
    { icon: Coins, label: "Total Points", value: participant.points.toLocaleString() },
    { icon: Users, label: "Referrals", value: participant.referral_count.toString() },
    { icon: ListChecks, label: "Tasks Done", value: `${tasksDone}/3` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
      {participant.is_banned && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3 animate-fade-in">
          <AlertOctagon className="w-5 h-5 text-destructive" />
          <div className="text-sm">This wallet has been suspended. Contact the WaveDrop team for support.</div>
        </div>
      )}

      <header className="animate-fade-in flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-gradient">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Your WaveDrop journey at a glance.</p>
        </div>
        <div
          className="px-4 py-2 rounded-full glass-card text-xs uppercase tracking-widest font-bold flex items-center gap-2"
          style={{ boxShadow: `0 0 20px ${tier.color}55` }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: tier.color }} />
          Tier: <span style={{ color: tier.color }}>{tier.name}</span>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 animate-fade-in hover:-translate-y-0.5 transition" style={{ animationDelay: `${0.05 * i}s` }}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
              <s.icon className="w-4 h-4" />{s.label}
            </div>
            <div className={`mt-2 text-2xl md:text-3xl font-bold ${s.mono ? "font-mono text-gradient" : "text-foreground"}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress + Daily check-in */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 glass-card rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Task Progress</h3>
            <span className="text-sm font-mono text-gradient">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-input overflow-hidden">
            <div
              className="h-full bg-gradient-primary shadow-neon-purple transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {tasksDone === 3 ? "✅ All tasks complete — keep referring to climb the leaderboard!" : `Complete ${3 - tasksDone} more task${3 - tasksDone > 1 ? "s" : ""} to maximise your allocation.`}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in flex flex-col">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <h3 className="font-bold">Daily Check-In</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">+5 points every 24 hours.</p>
          <button
            onClick={claimDaily}
            disabled={!canCheckIn || busy !== null || participant.is_banned}
            className="btn-neon mt-auto pt-3 w-full text-sm"
          >
            {busy === "daily" ? "Claiming…" : canCheckIn ? "Claim +5" : `Next claim in ${hoursLeft}h`}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Earn Points</h2>
            <span className="text-xs text-muted-foreground">10 pts / task · 20 pts / referral</span>
          </div>

          <div className="space-y-3">
            <TaskRow
              icon={<Send className="w-5 h-5" />}
              title="Join our Telegram"
              desc="Hop into the WaveDrop community channel."
              done={participant.task_telegram_joined}
              busy={busy === "task_telegram_joined"}
              action={
                <>
                  <a href={settings.telegram_url} target="_blank" rel="noreferrer" className="btn-outline-neon text-xs inline-flex items-center gap-1">
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => completeTask("telegram_joined", "task_telegram_joined", "Joined Telegram")}
                    disabled={participant.task_telegram_joined || busy !== null || participant.is_banned}
                    className="btn-neon text-xs"
                  >
                    {participant.task_telegram_joined ? "Done" : "Verify +10"}
                  </button>
                </>
              }
            />
            <TaskRow
              icon={<Twitter className="w-5 h-5" />}
              title="Follow on X (Twitter)"
              desc="Follow @wavedrop for live announcements."
              done={participant.task_twitter_followed}
              busy={busy === "task_twitter_followed"}
              action={
                <>
                  <a href={settings.twitter_url} target="_blank" rel="noreferrer" className="btn-outline-neon text-xs inline-flex items-center gap-1">
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => completeTask("twitter_followed", "task_twitter_followed", "Followed on X")}
                    disabled={participant.task_twitter_followed || busy !== null || participant.is_banned}
                    className="btn-neon text-xs"
                  >
                    {participant.task_twitter_followed ? "Done" : "Verify +10"}
                  </button>
                </>
              }
            />

            <div className="rounded-xl border border-border p-4 bg-card/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary shadow-neon-purple flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    Submit your Telegram username
                    {participant.task_telegram_submitted && (
                      <span className="text-xs text-secondary inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> @{participant.telegram_username}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Required for reward distribution.</p>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={tg}
                      onChange={(e) => setTg(e.target.value)}
                      placeholder={participant.telegram_username ? `@${participant.telegram_username}` : "@your_handle"}
                      className="flex-1 px-3 py-2 rounded-lg bg-input text-sm border border-border focus:outline-none focus:border-primary focus:shadow-neon-purple transition"
                    />
                    <button onClick={submitTelegram} disabled={busy !== null || participant.is_banned} className="btn-neon text-xs">
                      {busy === "tg" ? "Saving…" : participant.task_telegram_submitted ? "Update" : "Submit +10"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in flex flex-col">
          <h2 className="text-xl font-bold">Your Referral Link</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Share to earn <span className="text-secondary font-semibold">+20 points</span> per friend.
          </p>

          <div className="mt-4 rounded-xl bg-input border border-border p-3 font-mono text-xs break-all">
            {refLink}
          </div>
          <button onClick={copy} className="btn-neon mt-3 w-full inline-flex items-center justify-center gap-2">
            {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Link</>}
          </button>

          <div className="mt-4">
            <ShareButtons url={refLink} text={shareText} />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Referral code</div>
            <div className="text-2xl font-mono text-gradient mt-1">{participant.referral_code}</div>
          </div>

          <Link to="/leaderboard" className="btn-outline-neon mt-auto pt-3 text-center text-sm inline-block">
            See Leaderboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

function TaskRow({
  icon, title, desc, done, busy, action,
}: {
  icon: React.ReactNode; title: string; desc: string; done: boolean; busy: boolean; action: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 transition ${done ? "border-secondary/40 bg-secondary/5" : "border-border bg-card/40 hover:border-primary/40"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-secondary/20 text-secondary" : "bg-gradient-primary text-primary-foreground shadow-neon-purple"}`}>
        {done ? <Check className="w-5 h-5" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{title}</div>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">{busy ? <span className="text-xs text-muted-foreground">…</span> : action}</div>
    </div>
  );
}
