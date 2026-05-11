// Animated SVG wave + floating orbs background. Pure CSS, no JS animation cost.
export function WaveBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary/15 blur-[120px] animate-float" />
      <div
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-secondary/15 blur-[120px] animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 -left-40 w-[700px] h-[700px] rounded-full bg-[oklch(0.7_0.28_340/0.10)] blur-[120px] animate-float"
        style={{ animationDelay: "4s" }}
      />
      <div className="absolute inset-0 grid-bg opacity-[0.25]" />
      <svg
        className="absolute bottom-0 left-0 w-full h-[40vh] opacity-40"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wg1" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.65 0.28 295)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="oklch(0.7 0.22 235)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="wg2" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.7 0.22 235)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.7 0.28 340)" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path fill="url(#wg1)">
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="
              M0,160 C320,260 640,80 960,160 C1200,220 1320,180 1440,160 L1440,320 L0,320 Z;
              M0,180 C320,80 640,260 960,180 C1200,120 1320,200 1440,180 L1440,320 L0,320 Z;
              M0,160 C320,260 640,80 960,160 C1200,220 1320,180 1440,160 L1440,320 L0,320 Z"
          />
        </path>
        <path fill="url(#wg2)" opacity="0.6">
          <animate
            attributeName="d"
            dur="14s"
            repeatCount="indefinite"
            values="
              M0,200 C360,120 720,280 1080,200 C1260,160 1380,220 1440,200 L1440,320 L0,320 Z;
              M0,220 C360,300 720,140 1080,220 C1260,260 1380,180 1440,220 L1440,320 L0,320 Z;
              M0,200 C360,120 720,280 1080,200 C1260,160 1380,220 1440,200 L1440,320 L0,320 Z"
          />
        </path>
      </svg>
    </div>
  );
}
