import { useCallback, useEffect, useState } from "react";

export type FxIntensity = "low" | "medium" | "high";

const KEY = "orbexa-fx-intensity";

function getDefault(): FxIntensity {
  if (typeof window === "undefined") return "high";
  const stored = window.localStorage.getItem(KEY) as FxIntensity | null;
  if (stored === "low" || stored === "medium" || stored === "high") return stored;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return "low";
  const mobile = window.matchMedia?.("(max-width: 768px)").matches;
  return mobile ? "medium" : "high";
}

function apply(level: FxIntensity) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.remove("fx-low", "fx-medium", "fx-high");
  el.classList.add(`fx-${level}`);
}

export function useFxIntensity() {
  const [level, setLevelState] = useState<FxIntensity>("high");

  useEffect(() => {
    const initial = getDefault();
    setLevelState(initial);
    apply(initial);
  }, []);

  const setLevel = useCallback((next: FxIntensity) => {
    setLevelState(next);
    apply(next);
    try { window.localStorage.setItem(KEY, next); } catch {}
  }, []);

  return { level, setLevel };
}
