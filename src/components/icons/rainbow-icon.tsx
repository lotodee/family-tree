"use client";

interface RainbowIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function RainbowIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: RainbowIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Mixing colors"
      className={className}
    >
      <style>{`
        .rainbow-group {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: rainbow-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .rainbow-arc {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: rainbow-draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .rainbow-arc-1 { animation-delay: 0.2s; }
        .rainbow-arc-2 { animation-delay: 0.35s; opacity: 0.75; }
        .rainbow-arc-3 { animation-delay: 0.5s; opacity: 0.5; }
        .rainbow-shimmer {
          animation: rainbow-shimmer 2s ease-in-out infinite;
        }
        @keyframes rainbow-pop {
          from { transform: scale(0.4) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes rainbow-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes rainbow-shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rainbow-group, .rainbow-shimmer { animation: none; }
          .rainbow-arc { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <g className="rainbow-group rainbow-shimmer">
        <path
          className="rainbow-arc rainbow-arc-1"
          pathLength="100"
          d="M2 18C2 12.48 6.48 8 12 8s10 4.48 10 10"
        />
        <path
          className="rainbow-arc rainbow-arc-2"
          pathLength="100"
          d="M5 18C5 14.13 8.13 11 12 11s7 3.13 7 7"
        />
        <path
          className="rainbow-arc rainbow-arc-3"
          pathLength="100"
          d="M8 18C8 15.79 9.79 14 12 14s4 1.79 4 4"
        />
      </g>
    </svg>
  );
}
