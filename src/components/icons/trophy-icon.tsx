"use client";

interface TrophyIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function TrophyIcon({
  size = 24,
  color = "#C4973B",
  className = "",
}: TrophyIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Trophy"
      className={className}
    >
      <style>{`
        .trophy-group {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: trophy-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .trophy-cup {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: ${color};
          fill-opacity: 0.15;
        }
        .trophy-handle {
          stroke: ${color};
          stroke-width: 1.5;
          stroke-linecap: round;
        }
        .trophy-base {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
        }
        .trophy-shine {
          animation: trophy-gleam 2s ease-in-out infinite;
        }
        .trophy-star {
          fill: ${color};
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: star-burst 0.4s ease-out 0.5s forwards;
        }
        @keyframes trophy-pop {
          from { transform: scale(0.4) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes trophy-gleam {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        @keyframes star-burst {
          from { opacity: 0; transform: scale(0) rotate(-180deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .trophy-group, .trophy-shine { animation: none; }
          .trophy-star { animation: none; opacity: 1; }
        }
      `}</style>
      <g className="trophy-group trophy-shine">
        {/* Cup body */}
        <path className="trophy-cup" d="M8 2H16V8C16 12 14 14 12 14C10 14 8 12 8 8V2Z" />
        {/* Left handle */}
        <path className="trophy-handle" d="M8 4H6C4 4 3 6 3 8C3 10 4 11 6 11H8" />
        {/* Right handle */}
        <path className="trophy-handle" d="M16 4H18C20 4 21 6 21 8C21 10 20 11 18 11H16" />
        {/* Stem */}
        <line className="trophy-base" x1="12" y1="14" x2="12" y2="18" />
        {/* Base */}
        <path className="trophy-base" d="M8 18H16V20C16 21 15 22 14 22H10C9 22 8 21 8 20V18Z" />
        {/* Star */}
        <path
          className="trophy-star"
          d="M12 5L12.5 6.5L14 7L12.5 7.5L12 9L11.5 7.5L10 7L11.5 6.5L12 5Z"
        />
      </g>
    </svg>
  );
}
