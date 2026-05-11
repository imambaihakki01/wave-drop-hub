import { Link, useLocation } from "@tanstack/react-router";
import { Wallet, LogOut, Waves } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { shortAddr } from "@/lib/wallet";

const nav = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/admin", label: "Admin" },
] as const;

export function Header() {
  const { address, connect, disconnect, loading } = useWallet();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-neon-purple group-hover:scale-110 transition-transform">
            <Waves className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-lg text-gradient">WaveDrop</div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">
              Future of Community Airdrop
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => {
            const active = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "text-foreground bg-accent shadow-glow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {address ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg glass-card font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              {shortAddr(address)}
            </div>
            <button
              onClick={disconnect}
              className="p-2 rounded-lg btn-outline-neon"
              aria-label="Disconnect"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={connect} disabled={loading} className="btn-neon flex items-center gap-2 text-sm">
            <Wallet className="w-4 h-4" />
            {loading ? "Connecting…" : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center justify-center gap-1 px-4 pb-3 overflow-x-auto">
        {nav.map((n) => {
          const active = location.pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                active ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
