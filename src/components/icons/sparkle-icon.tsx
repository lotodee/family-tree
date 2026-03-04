"use client";

interface SparkleIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SparkleIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: SparkleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Finding perfect words"
      className={className}
    >
      <style>{`
        .sparkle-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: sparkle-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .sparkle-main {
          fill: ${color};
          transform-box: fill-box;
          transform-origin: center;
          animation: sparkle-pulse 1.5s ease-in-out infinite;
        }
        .sparkle-small {
          fill: ${color};
          opacity: 0.6;
          transform-box: fill-box;
          transform-origin: center;
          animation: sparkle-twinkle 1.2s ease-in-out infinite;
        }
        .sparkle-small-2 { animation-delay: 0.4s; }
        @keyframes sparkle-pop {
          from { transform: scale(0.4) rotate(-45deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes sparkle-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes sparkle-twinkle {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sparkle-group, .sparkle-main, .sparkle-small { animation: none; }
        }
      `}</style>
      <g className="sparkle-group">
        <path
          className="sparkle-main"
          d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        />
        <path
          className="sparkle-small"
          d="M19 2L19.5 4L21.5 4.5L19.5 5L19 7L18.5 5L16.5 4.5L18.5 4L19 2Z"
        />
        <path
          className="sparkle-small sparkle-small-2"
          d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z"
        />
      </g>
    </svg>
  );
}
