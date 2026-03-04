"use client";

interface ScaleIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function ScaleIcon({
  size = 24,
  color = "#C4973B",
  className = "",
}: ScaleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Compare"
      className={className}
    >
      <style>{`
        .scale-group {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: scale-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .scale-base {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .scale-beam {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          transform-box: fill-box;
          transform-origin: center;
          animation: scale-balance 2s ease-in-out infinite;
        }
        .scale-pan {
          stroke: ${color};
          stroke-width: 1.5;
          fill: ${color};
          fill-opacity: 0.2;
          transform-box: fill-box;
          transform-origin: top center;
        }
        .scale-pan-left {
          animation: pan-left 2s ease-in-out infinite;
        }
        .scale-pan-right {
          animation: pan-right 2s ease-in-out infinite;
        }
        @keyframes scale-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes scale-balance {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        @keyframes pan-left {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(2px); }
          75% { transform: translateY(-2px); }
        }
        @keyframes pan-right {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-2px); }
          75% { transform: translateY(2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .scale-group, .scale-beam, .scale-pan-left, .scale-pan-right { animation: none; }
        }
      `}</style>
      <g className="scale-group">
        {/* Base pillar */}
        <line className="scale-base" x1="12" y1="21" x2="12" y2="6" />
        <line className="scale-base" x1="8" y1="21" x2="16" y2="21" />
        {/* Balance beam */}
        <line className="scale-beam" x1="4" y1="6" x2="20" y2="6" />
        {/* Left pan */}
        <g className="scale-pan-left">
          <line className="scale-pan" x1="4" y1="6" x2="4" y2="10" />
          <path className="scale-pan" d="M1 10H7L6 14H2L1 10Z" />
        </g>
        {/* Right pan */}
        <g className="scale-pan-right">
          <line className="scale-pan" x1="20" y1="6" x2="20" y2="10" />
          <path className="scale-pan" d="M17 10H23L22 14H18L17 10Z" />
        </g>
      </g>
    </svg>
  );
}
