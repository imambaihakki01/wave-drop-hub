import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, LogOut, Menu, X } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { shortAddr } from "@/lib/wallet";
import { Logo } from "./Logo";
import { FxIntensityControl } from "./FxIntensityControl";

const nav = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How it Works" },
  { to: "/tokenomics", label: "Tokenomics" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/faq", label: "FAQ" },
] as const;

export function Header() {
  const { address, connect, disconnect, loading } = useWallet();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <Logo size={36} className="group-hover:scale-110 transition-transform" />
          <div className="leading-tight">
            <div className="font-bold text-lg text-gradient">Orbexa Network</div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">
              The Future of Community Airdrop
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => {
            const active = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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

        <div className="flex items-center gap-2">
          {address ? (
            <>
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
            </>
          ) : (
            <button onClick={connect} disabled={loading} className="btn-neon flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">{loading ? "Connecting…" : "Connect Wallet"}</span>
            </button>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg btn-outline-neon"
            aria-label="Menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1">
            {nav.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground/60 hover:text-foreground"
            >
              Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
