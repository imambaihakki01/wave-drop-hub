import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, ListChecks, Users, Trophy, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Orbexa Network" },
      { name: "description", content: "Four simple steps to ride the Orbexa Network airdrop orbit: connect, complete, refer, and claim." },
      { property: "og:title", content: "How It Works — Orbexa Network" },
      { property: "og:description", content: "Four simple steps to ride the Orbexa Network airdrop orbit." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { icon: Wallet, title: "Connect Wallet", desc: "Sign in with MetaMask. Your address becomes your unique Orbexa Network ID — no email needed." },
  { icon: ListChecks, title: "Complete Tasks", desc: "Join Telegram, follow on X, submit your handle. Each task = +10 points." },
  { icon: Users, title: "Refer Friends", desc: "Share your unique referral link. Each successful join gives you +20 points." },
  { icon: Trophy, title: "Claim Rewards", desc: "When the snapshot hits, top wallets receive priority allocation of the Orbexa Network token." },
];

function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-12">
      <header className="text-center animate-fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full glass-card text-xs uppercase tracking-widest text-secondary">Guide</div>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold text-gradient">How It Works</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Four steps from zero to airdrop. No gas, no risk — just engagement.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="glass-card rounded-2xl p-6 relative overflow-hidden hover:-translate-y-1 transition-all animate-fade-in"
            style={{ animationDelay: `${0.08 * i}s` }}
          >
            <div className="absolute -right-6 -top-6 text-[120px] font-bold text-primary/10 leading-none select-none">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-primary shadow-neon-purple flex items-center justify-center mb-4">
              <s.icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-8 text-center animate-pulse-glow">
        <h3 className="text-2xl font-bold text-gradient">Ready to enter the orbit?</h3>
        <p className="text-sm text-muted-foreground mt-2">Connect your wallet to start earning points right now.</p>
        <Link to="/dashboard" className="btn-neon mt-5 inline-flex items-center gap-2">
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
