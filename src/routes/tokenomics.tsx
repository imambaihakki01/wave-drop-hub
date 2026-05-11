import { createFileRoute } from "@tanstack/react-router";
import { Coins, Lock, Users, Rocket, Building2, Gift } from "lucide-react";

export const Route = createFileRoute("/tokenomics")({
  head: () => ({
    meta: [
      { title: "Tokenomics — WaveDrop" },
      { name: "description", content: "Explore the WAVE token supply allocation, vesting schedule, and utility within the WaveDrop ecosystem." },
      { property: "og:title", content: "WAVE Tokenomics — WaveDrop" },
      { property: "og:description", content: "Total supply, allocation breakdown, and utility of the WAVE token." },
    ],
  }),
  component: Tokenomics,
});

const allocs = [
  { label: "Community Airdrop", pct: 40, color: "oklch(0.65 0.28 295)", icon: Gift, desc: "Distributed to qualifying wallets" },
  { label: "Liquidity & Listing", pct: 20, color: "oklch(0.7 0.22 235)", icon: Rocket, desc: "DEX & CEX market making" },
  { label: "Team & Advisors", pct: 15, color: "oklch(0.7 0.28 340)", icon: Users, desc: "24-month vesting, 6-mo cliff" },
  { label: "Treasury", pct: 15, color: "oklch(0.78 0.18 180)", icon: Building2, desc: "DAO-governed reserves" },
  { label: "Staking Rewards", pct: 10, color: "oklch(0.85 0.18 90)", icon: Lock, desc: "4-year emission" },
];

function Tokenomics() {
  // Build conic-gradient for donut
  let acc = 0;
  const stops = allocs
    .map((a) => {
      const start = acc;
      acc += a.pct;
      return `${a.color} ${start}% ${acc}%`;
    })
    .join(", ");

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 space-y-12">
      <header className="text-center animate-fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full glass-card text-xs uppercase tracking-widest text-secondary">Token</div>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold text-gradient">Tokenomics</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          $WAVE is the native token powering the WaveDrop ecosystem. Designed for community ownership.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Total Supply", v: "1,000,000,000" },
          { l: "Initial Circulating", v: "60%" },
          { l: "Network", v: "Multichain" },
          { l: "Token Symbol", v: "$WAVE" },
        ].map((s, i) => (
          <div key={s.l} className="glass-card rounded-2xl p-5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
            <div className="text-xl md:text-2xl font-bold text-gradient mt-1 font-mono">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Donut chart */}
        <div className="flex justify-center animate-fade-in">
          <div className="relative w-72 h-72">
            <div
              className="w-full h-full rounded-full shadow-neon-purple"
              style={{ background: `conic-gradient(${stops})` }}
            />
            <div className="absolute inset-8 rounded-full bg-card flex flex-col items-center justify-center text-center">
              <Coins className="w-8 h-8 text-primary mb-2" />
              <div className="text-3xl font-bold text-gradient font-mono">1B</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Supply</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {allocs.map((a, i) => (
            <div
              key={a.label}
              className="glass-card rounded-xl p-4 flex items-center gap-3 hover:-translate-x-1 transition animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: a.color, boxShadow: `0 0 20px ${a.color}` }}
              >
                <a.icon className="w-5 h-5 text-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">{a.label}</span>
                  <span className="font-mono text-sm text-gradient">{a.pct}%</span>
                </div>
                <div className="text-xs text-muted-foreground">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Utility */}
      <div className="glass-card rounded-2xl p-8 animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Token Utility</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Governance", d: "Vote on protocol upgrades and treasury allocation." },
            { t: "Staking", d: "Lock $WAVE to earn yield and boost referral multipliers." },
            { t: "Access", d: "Unlock premium WaveDrop seasons and exclusive partner drops." },
          ].map((u) => (
            <div key={u.t} className="rounded-xl border border-border p-4 bg-card/40">
              <div className="font-semibold">{u.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{u.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
