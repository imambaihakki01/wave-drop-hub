import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gift, Users, Trophy, Sparkles, Wallet, BookOpen, Coins, HelpCircle } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { useWallet } from "@/hooks/use-wallet";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { address, connect, loading } = useWallet();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Season 01 — Now Live</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          </div>

          <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-in">
            <span className="text-gradient">WaveDrop</span>
          </h1>
          <p className="mt-3 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            The future of community airdrops. Connect, complete, refer — ride the wave to on-chain rewards.
          </p>

          <div className="mt-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Countdown />
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-3">
              Until WaveDrop snapshot
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {address ? (
              <Link to="/dashboard" className="btn-neon inline-flex items-center gap-2">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button onClick={connect} disabled={loading} className="btn-neon inline-flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {loading ? "Connecting…" : "Connect MetaMask"}
              </button>
            )}
            <Link to="/leaderboard" className="btn-outline-neon inline-flex items-center gap-2">
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Gift,
              title: "Complete Tasks",
              desc: "Earn 10 points per task. Join the community, follow updates, submit your handle.",
              color: "primary",
            },
            {
              icon: Users,
              title: "Refer Friends",
              desc: "Get 20 points for every friend that joins via your unique referral link.",
              color: "secondary",
            },
            {
              icon: Trophy,
              title: "Climb the Board",
              desc: "Top referrers receive priority allocation when WaveDrop goes live on-chain.",
              color: "primary",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 ${f.color === "secondary" ? "shadow-neon-blue" : "shadow-neon-purple"}`}>
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-10 glass-card rounded-2xl p-6 md:p-10 grid grid-cols-3 gap-4 text-center animate-pulse-glow">
          {[
            { v: "10K+", l: "Wave riders" },
            { v: "$250K", l: "Total reward pool" },
            { v: "30 Days", l: "Until snapshot" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-2xl md:text-4xl font-bold text-gradient font-mono">{s.v}</div>
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Explore links */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { to: "/how-it-works", icon: BookOpen, title: "How It Works", desc: "4 steps to earn." },
            { to: "/tokenomics", icon: Coins, title: "Tokenomics", desc: "$WAVE supply & utility." },
            { to: "/faq", icon: HelpCircle, title: "FAQ", desc: "Common questions." },
          ].map((c, i) => (
            <Link
              key={c.to}
              to={c.to}
              className="glass-card rounded-2xl p-5 group hover:-translate-y-1 transition-all animate-fade-in"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon-purple">
                  <c.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
              </div>
              <div className="mt-3 font-bold">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
