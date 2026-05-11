import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { captureReferral } from "@/hooks/use-wallet";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-card rounded-2xl p-10">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">This page drifted off into the void.</p>
        <Link to="/" className="btn-neon inline-block mt-6">Back home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-card rounded-2xl p-10">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="btn-neon mt-6"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WaveDrop — The Future of Community Airdrop" },
      { name: "description", content: "Join WaveDrop: a modern crypto airdrop platform with referrals, leaderboard and on-chain rewards." },
      { property: "og:title", content: "WaveDrop — The Future of Community Airdrop" },
      { property: "og:description", content: "Join WaveDrop: a modern crypto airdrop platform with referrals, leaderboard and on-chain rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "WaveDrop — The Future of Community Airdrop" },
      { name: "twitter:description", content: "Join WaveDrop: a modern crypto airdrop platform with referrals, leaderboard and on-chain rewards." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/97b70133-120f-4d88-9736-561f49e36d44" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/97b70133-120f-4d88-9736-561f49e36d44" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { captureReferral(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} WaveDrop. Surf the chain.
        </footer>
      </div>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.03 280)",
            border: "1px solid oklch(0.65 0.28 295 / 40%)",
            color: "oklch(0.98 0.01 280)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
