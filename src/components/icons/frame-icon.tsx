"use client";

interface FrameIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function FrameIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: FrameIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Painting masterpiece"
      className={className}
    >
      <style>{`
        .frame-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: frame-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .frame-outer {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: frame-draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .frame-inner {
          stroke: ${color};
          stroke-width: 1;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0.6;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: frame-draw 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
        }
        .frame-landscape {
          fill: ${color};
          opacity: 0;
          animation: landscape-reveal 0.4s ease-out 0.6s forwards;
        }
        .frame-sun {
          fill: ${color};
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: sun-rise 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s forwards;
        }
        @keyframes frame-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes frame-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes landscape-reveal {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 0.4; transform: translateY(0); }
        }
        @keyframes sun-rise {
          from { opacity: 0; transform: scale(0) translateY(5px); }
          to { opacity: 0.6; transform: scale(1) translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .frame-group { animation: none; }
          .frame-outer, .frame-inner { animation: none; stroke-dashoffset: 0; }
          .frame-landscape { animation: none; opacity: 0.4; }
          .frame-sun { animation: none; opacity: 0.6; }
        }
      `}</style>
      <g className="frame-group">
        <rect className="frame-outer" pathLength="100" x="3" y="3" width="18" height="18" rx="2" />
        <rect className="frame-inner" pathLength="100" x="6" y="6" width="12" height="12" rx="1" />
        <path className="frame-landscape" d="M6 15L9 12L12 14L15 10L18 13V17H6V15Z" />
        <circle className="frame-sun" cx="15" cy="9" r="2" />
      </g>
    </svg>
  );
}
