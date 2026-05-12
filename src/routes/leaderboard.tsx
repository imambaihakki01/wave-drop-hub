import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shortAddr } from "@/lib/wallet";
import { useWallet } from "@/hooks/use-wallet";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Orbexa Network" }] }),
  component: Leaderboard,
});

type Row = {
  id: string;
  wallet_address: string;
  points: number;
  referral_count: number;
};

function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useWallet();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("participants")
        .select("id, wallet_address, points, referral_count")
        .order("referral_count", { ascending: false })
        .order("points", { ascending: false })
        .limit(100);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (i === 1) return <Medal className="w-5 h-5 text-slate-300" />;
    if (i === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground font-mono text-sm">#{i + 1}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <header className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold text-gradient">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Top referrers riding the Orbexa Network wave.</p>
      </header>

      {/* Podium */}
      {!loading && rows.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end animate-fade-in">
          {[1, 0, 2].map((idx, pos) => {
            const r = rows[idx];
            const heights = ["h-32", "h-44", "h-28"];
            return (
              <div key={r.id} className="flex flex-col items-center">
                <div className="text-xs text-muted-foreground mb-2">#{idx + 1}</div>
                <div className={`w-full ${heights[pos]} glass-card rounded-t-2xl flex flex-col items-center justify-center p-3 ${idx === 0 ? "shadow-neon-purple animate-pulse-glow" : ""}`}>
                  <div className="font-mono text-xs md:text-sm break-all text-center">{shortAddr(r.wallet_address)}</div>
                  <div className="text-2xl md:text-3xl font-bold text-gradient mt-1">{r.referral_count}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">refs · {r.points} pts</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
        <div className="grid grid-cols-12 px-5 py-3 text-xs uppercase tracking-widest text-muted-foreground border-b border-border bg-card/40">
          <div className="col-span-1">Rank</div>
          <div className="col-span-7">Wallet</div>
          <div className="col-span-2 text-right">Refs</div>
          <div className="col-span-2 text-right">Points</div>
        </div>
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Loading riders…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Be the first to join!</div>
        ) : (
          <div>
            {rows.map((r, i) => {
              const me = address && r.wallet_address.toLowerCase() === address.toLowerCase();
              return (
                <div
                  key={r.id}
                  className={`grid grid-cols-12 px-5 py-3 items-center border-b border-border/50 last:border-0 transition hover:bg-accent/30 ${me ? "bg-primary/10" : ""}`}
                >
                  <div className="col-span-1 flex items-center">{rankIcon(i)}</div>
                  <div className="col-span-7 font-mono text-xs md:text-sm truncate">
                    {shortAddr(r.wallet_address)} {me && <span className="ml-2 text-[10px] text-primary uppercase">You</span>}
                  </div>
                  <div className="col-span-2 text-right font-bold text-secondary">{r.referral_count}</div>
                  <div className="col-span-2 text-right font-mono">{r.points.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
