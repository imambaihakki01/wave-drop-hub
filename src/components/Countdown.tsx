import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";

function diff(t: number) {
  const d = Math.max(0, t - Date.now());
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    mins: Math.floor((d / 60000) % 60),
    secs: Math.floor((d / 1000) % 60),
    ended: d === 0,
  };
}

export function Countdown() {
  const { settings } = useSettings();
  const target = new Date(settings.event_end_at).getTime();
  const [t, setT] = useState(diff(target));

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.ended) {
    return (
      <div className="glass-card rounded-xl px-6 py-4 inline-block">
        <div className="text-2xl font-bold text-gradient">Event ended</div>
        <div className="text-xs text-muted-foreground mt-1">Snapshot has been taken</div>
      </div>
    );
  }

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
