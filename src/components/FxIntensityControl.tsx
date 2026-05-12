import { Sparkles, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useFxIntensity, type FxIntensity } from "@/hooks/use-fx-intensity";

const OPTIONS: { value: FxIntensity; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "Calm — best for mobile" },
  { value: "medium", label: "Medium", hint: "Balanced" },
  { value: "high", label: "High", hint: "Full neon" },
];

export function FxIntensityControl({ compact = false }: { compact?: boolean }) {
  const { level, setLevel } = useFxIntensity();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg btn-outline-neon flex items-center gap-1.5"
        aria-label="Animation intensity"
        title={`Neon intensity: ${level}`}
      >
        <Sparkles className="w-4 h-4" />
        {!compact && (
          <span className="text-xs font-mono uppercase">{level}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl p-1.5 z-50 animate-fade-in">
          <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            Neon Intensity
          </div>
          {OPTIONS.map((opt) => {
            const active = level === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { setLevel(opt.value); setOpen(false); }}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 text-sm transition ${
                  active ? "bg-accent text-foreground" : "hover:bg-accent/50 text-muted-foreground"
                }`}
              >
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground">{opt.hint}</div>
                </div>
                {active && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
