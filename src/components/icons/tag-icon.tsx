"use client";

interface TagIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function TagIcon({
  size = 24,
  color = "#C4973B",
  className = "",
}: TagIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Tag - Nickname"
      className={className}
    >
      <style>{`
        .tag-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: tag-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .tag-body {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: ${color};
          fill-opacity: 0.1;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: tag-draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .tag-hole {
          fill: ${color};
          opacity: 0;
          animation: hole-pop 0.3s ease-out 0.5s forwards;
        }
        .tag-swing {
          animation: tag-dangle 2s ease-in-out infinite;
        }
        @keyframes tag-pop {
          from { transform: scale(0.4) rotate(-30deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes tag-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes hole-pop {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes tag-dangle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tag-group, .tag-swing { animation: none; }
          .tag-body { animation: none; stroke-dashoffset: 0; }
          .tag-hole { animation: none; opacity: 1; }
        }
      `}</style>
      <g className="tag-group tag-swing">
        <path
          className="tag-body"
          pathLength="100"
          d="M20.59 13.41L13.42 20.58C13.23 20.77 12.97 20.88 12.71 20.88C12.45 20.88 12.19 20.77 12 20.58L2 10.59V2H10.59L20.59 12C20.97 12.39 20.97 13.02 20.59 13.41Z"
        />
        <circle className="tag-hole" cx="7" cy="7" r="2" />
      </g>
    </svg>
  );
}
