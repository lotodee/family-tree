"use client";

interface RefreshIconProps {
  size?: number;
  color?: string;
  className?: string;
  isSpinning?: boolean;
}

export function RefreshIcon({
  size = 24,
  color = "#C4973B",
  className = "",
  isSpinning = false,
}: RefreshIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Refresh"
      className={className}
    >
      <style>{`
        .refresh-group {
          transform-box: fill-box;
          transform-origin: center;
          ${isSpinning ? "animation: refresh-spin 1s linear infinite;" : ""}
        }
        .refresh-path {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .refresh-arrow {
          fill: ${color};
        }
        @keyframes refresh-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .refresh-group { animation-duration: 2s; }
        }
      `}</style>
      <g className="refresh-group">
        <path
          className="refresh-path"
          d="M21 12a9 9 0 1 1-6.22-8.56"
        />
        <path
          className="refresh-arrow"
          d="M21 3v6h-6l2.5-2.5"
        />
      </g>
    </svg>
  );
}
