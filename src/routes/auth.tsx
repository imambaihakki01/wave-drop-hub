import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Mail, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Login — WaveDrop" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/admin" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        toast.success("Signed in");
      }
      navigate({ to: "/admin" });
    } catch (e: any) {
      toast.error(e?.message ?? "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <form onSubmit={submit} className="glass-card rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary mx-auto flex items-center justify-center shadow-neon-purple">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mt-3">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to manage WaveDrop" : "Create your admin account"}
          </p>
        </div>

        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</label>
        <div className="relative mb-4">
          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-input border border-border focus:outline-none focus:border-primary focus:shadow-neon-purple"
          />
        </div>

        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Password</label>
        <div className="relative mb-5">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            required
            minLength={6}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-input border border-border focus:outline-none focus:border-primary focus:shadow-neon-purple"
          />
        </div>

        <button type="submit" disabled={busy} className="btn-neon w-full">
          {busy ? "…" : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-xs text-muted-foreground mt-4 hover:text-foreground transition"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <Link to="/" className="block text-center text-xs text-muted-foreground mt-3 hover:text-foreground">
          ← Back home
        </Link>
      </form>

      <p className="text-[10px] text-muted-foreground text-center mt-4 max-w-xs mx-auto">
        First account to claim admin via the panel becomes the WaveDrop administrator.
      </p>
    </div>
  );
}
