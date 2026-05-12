import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Settings = {
  event_end_at: string;
  telegram_url: string;
  twitter_url: string;
};

const DEFAULT: Settings = {
  event_end_at: new Date(Date.now() + 30 * 86400000).toISOString(),
  telegram_url: "https://t.me/michat",
  twitter_url: "https://x.com/michat",
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("event_end_at, telegram_url, twitter_url")
      .eq("id", 1)
      .maybeSingle();
    if (data) setSettings(data as Settings);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { settings, loading, refresh: load };
}
