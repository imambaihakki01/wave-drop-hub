// Animated neon orbit + particles background. Pure CSS/SVG, GPU-friendly.
export function WaveBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Soft color blobs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[oklch(0.85_0.2_200/0.18)] blur-[120px] animate-float" />
      <div
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-[oklch(0.72_0.32_330/0.18)] blur-[120px] animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 -left-40 w-[700px] h-[700px] rounded-full bg-[oklch(0.92_0.25_130/0.10)] blur-[120px] animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Neon grid */}
      <div className="absolute inset-0 grid-bg opacity-[0.35]" />

      {/* Concentric orbit rings centered top */}
      <svg
        className="absolute -top-[30vh] left-1/2 -translate-x-1/2 w-[140vmin] h-[140vmin] opacity-50"
        viewBox="0 0 800 800"
      >
        <defs>
          <linearGradient id="ring-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.2 200)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="oklch(0.72 0.32 330)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {[180, 250, 320, 390].map((r, i) => (
          <g key={r} style={{ transformOrigin: "400px 400px" }} className={i % 2 ? "animate-spin-reverse" : "animate-spin-slower"}>
            <ellipse cx="400" cy="400" rx={r} ry={r * 0.32} fill="none" stroke="url(#ring-grad)" strokeWidth="1" strokeDasharray="2 6" />
            <circle cx={400 + r} cy="400" r="3" fill="oklch(0.85 0.2 200)">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => {
          const left = (i * 53) % 100;
          const top = (i * 37) % 100;
          const delay = (i % 6) * 0.7;
          const size = 2 + (i % 4);
          const color = i % 3 === 0 ? "oklch(0.85 0.2 200)" : i % 3 === 1 ? "oklch(0.72 0.32 330)" : "oklch(0.92 0.25 130)";
          return (
            <span
              key={i}
              className="absolute rounded-full animate-drift"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                background: color,
                boxShadow: `0 0 ${size * 4}px ${color}`,
                animationDelay: `${delay}s`,
                opacity: 0.7,
              }}
            />
          );
        })}
      </div>

      {/* Bottom horizon glow */}
      <div className="absolute bottom-0 inset-x-0 h-[30vh] bg-gradient-to-t from-[oklch(0.85_0.2_200/0.12)] via-transparent to-transparent" />
    </div>
  );
}
