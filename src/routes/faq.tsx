import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Michat Network" },
      { name: "description", content: "Frequently asked questions about Michat Network airdrop, eligibility, points, referrals and rewards." },
      { property: "og:title", content: "FAQ — Michat Network" },
      { property: "og:description", content: "Everything you need to know about the Michat Network airdrop." },
    ],
  }),
  component: FAQ,
});

const faqs = [
  { q: "What is Michat Network?", a: "Michat Network is a community-driven crypto airdrop platform. By engaging with our ecosystem and inviting friends, you earn points that translate into priority token allocation when the snapshot is taken." },
  { q: "How do I qualify?", a: "Connect your MetaMask wallet, complete the three tasks (Telegram, X, submit handle), and refer at least one friend. The more points, the better your allocation." },
  { q: "Is there any cost or gas fee?", a: "No. Michat Network is 100% free during the campaign phase. You only need a wallet — no on-chain transactions required to participate." },
  { q: "How are referrals validated?", a: "Each wallet has a unique referral code. We award referral points only when the new wallet is successfully registered and never previously linked." },
  { q: "When does the snapshot happen?", a: "Check the live countdown on the home page. The snapshot timestamp is set by our team and visible in real time." },
  { q: "Can I use multiple wallets?", a: "Sybil attacks are detected and banned. Stick to one wallet — fairness keeps the wave strong." },
  { q: "How will rewards be distributed?", a: "Once the snapshot is taken, eligible wallets will receive Michat Network tokens directly to their connected address. Watch our X account for the exact distribution date." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-10">
      <header className="text-center animate-fade-in">
        <div className="inline-block px-4 py-1.5 rounded-full glass-card text-xs uppercase tracking-widest text-secondary">Help</div>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold text-gradient">FAQ</h1>
        <p className="mt-3 text-muted-foreground">Everything you need to know about Michat Network.</p>
      </header>

      <div className="space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="glass-card rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-accent/30 transition"
              >
                <span className="font-semibold text-sm md:text-base">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
