"use client";

interface LinkChainIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function LinkChainIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: LinkChainIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Connecting memories"
      className={className}
    >
      <style>{`
        .chain-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: chain-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .chain-link {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: chain-draw 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .chain-link-2 { animation-delay: 0.4s; }
        @keyframes chain-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes chain-draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .chain-group { animation: none; }
          .chain-link { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <g className="chain-group">
        <path
          className="chain-link"
          pathLength="100"
          d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        />
        <path
          className="chain-link chain-link-2"
          pathLength="100"
          d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        />
      </g>
    </svg>
  );
}
