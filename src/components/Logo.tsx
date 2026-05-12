// Animated Orbexa orbit logo — pure SVG, no JS animation cost.
type Props = { size?: number; className?: string };

export function Logo({ size = 36, className = "" }: Props) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full bg-gradient-conic opacity-60 blur-md animate-spin-slower" />
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="relative drop-shadow-[0_0_8px_var(--neon-cyan)]"
      >
        <defs>
          <linearGradient id="lg-stroke" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--neon-cyan)" />
            <stop offset="100%" stopColor="var(--neon-magenta)" />
          </linearGradient>
          <radialGradient id="lg-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--neon-magenta)" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Orbit rings */}
        <g className="animate-spin-slow" style={{ transformOrigin: "32px 32px" }}>
          <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="url(#lg-stroke)" strokeWidth="1.5" opacity="0.85" />
        </g>
        <g className="animate-spin-reverse" style={{ transformOrigin: "32px 32px" }}>
          <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="url(#lg-stroke)" strokeWidth="1.5" opacity="0.6" transform="rotate(60 32 32)" />
        </g>
        <g className="animate-spin-slower" style={{ transformOrigin: "32px 32px" }}>
          <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="url(#lg-stroke)" strokeWidth="1.5" opacity="0.5" transform="rotate(-60 32 32)" />
        </g>

        {/* Core */}
        <circle cx="32" cy="32" r="6" fill="url(#lg-core)" />
        <circle cx="32" cy="32" r="2.5" fill="white" className="animate-orbit-pulse" />

        {/* Orbiting electrons */}
        <g className="animate-spin-slow" style={{ transformOrigin: "32px 32px" }}>
          <circle cx="58" cy="32" r="2" fill="var(--neon-cyan)" />
        </g>
        <g className="animate-spin-reverse" style={{ transformOrigin: "32px 32px" }}>
          <circle cx="6" cy="32" r="1.6" fill="var(--neon-magenta)" />
        </g>
      </svg>
    </span>
  );
}
