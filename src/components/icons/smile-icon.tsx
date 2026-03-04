"use client";

interface SmileIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SmileIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: SmileIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Adding humor"
      className={className}
    >
      <style>{`
        .smile-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: smile-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .smile-face {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: smile-draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .smile-eyes {
          fill: ${color};
          transform-box: fill-box;
          transform-origin: center;
          animation: smile-blink 2.5s ease-in-out infinite;
        }
        .smile-mouth {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: smile-draw 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
        }
        @keyframes smile-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes smile-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes smile-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .smile-group, .smile-eyes { animation: none; }
          .smile-face, .smile-mouth { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <g className="smile-group">
        <circle className="smile-face" pathLength="100" cx="12" cy="12" r="10" />
        <circle className="smile-eyes" cx="9" cy="10" r="1.5" />
        <circle className="smile-eyes" cx="15" cy="10" r="1.5" />
        <path className="smile-mouth" pathLength="100" d="M8 14s1.5 3 4 3 4-3 4-3" />
      </g>
    </svg>
  );
}
