import { useEffect, useState } from "react";

// Airdrop event: 30 days from now (could be configured)
const TARGET = (() => {
  if (typeof window === "undefined") return Date.now() + 30 * 86400000;
  const stored = localStorage.getItem("wavedrop_target");
  if (stored) return Number(stored);
  const t = Date.now() + 30 * 86400000;
  localStorage.setItem("wavedrop_target", String(t));
  return t;
})();

function diff(t: number) {
  const d = Math.max(0, t - Date.now());
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    mins: Math.floor((d / 60000) % 60),
    secs: Math.floor((d / 1000) % 60),
  };
}

export function Countdown() {
  const [t, setT] = useState(diff(TARGET));
  useEffect(() => {
    const id = setInterval(() => setT(diff(TARGET)), 1000);
    return () => clearInterval(id);
  }, []);

  const cell = (label: string, value: number) => (
    <div className="glass-card rounded-xl px-4 py-3 sm:px-6 sm:py-4 min-w-[68px] sm:min-w-[88px] text-center">
      <div className="text-2xl sm:text-4xl font-bold font-mono text-gradient tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {cell("Days", t.days)}
      {cell("Hours", t.hours)}
      {cell("Mins", t.mins)}
      {cell("Secs", t.secs)}
    </div>
  );
}
