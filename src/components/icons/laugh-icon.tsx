"use client";

interface LaughIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function LaughIcon({
  size = 24,
  color = "#C4973B",
  className = "",
}: LaughIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Laughing"
      className={className}
    >
      <style>{`
        .laugh-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: laugh-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .laugh-face {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .laugh-eyes {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
        }
        .laugh-mouth {
          fill: ${color};
          opacity: 0.8;
        }
        .laugh-bounce {
          animation: laugh-shake 0.5s ease-in-out infinite;
        }
        @keyframes laugh-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes laugh-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .laugh-group, .laugh-bounce { animation: none; }
        }
      `}</style>
      <g className="laugh-group laugh-bounce">
        <circle className="laugh-face" cx="12" cy="12" r="10" />
        {/* Laughing closed eyes */}
        <path className="laugh-eyes" d="M7 9L9 11L11 9" />
        <path className="laugh-eyes" d="M13 9L15 11L17 9" />
        {/* Wide open laughing mouth */}
        <path className="laugh-mouth" d="M8 14C8 14 9.5 18 12 18C14.5 18 16 14 16 14H8Z" />
      </g>
    </svg>
  );
}
