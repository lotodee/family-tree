"use client";

interface CrownIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function CrownIcon({
  size = 24,
  color = "#C4973B",
  className = "",
}: CrownIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Crown - Legacy"
      className={className}
    >
      <style>{`
        .crown-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: crown-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .crown-body {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: ${color};
          fill-opacity: 0.2;
        }
        .crown-jewel {
          fill: ${color};
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
        }
        .crown-jewel-1 { animation: jewel-pop 0.3s ease-out 0.4s forwards; }
        .crown-jewel-2 { animation: jewel-pop 0.3s ease-out 0.5s forwards; }
        .crown-jewel-3 { animation: jewel-pop 0.3s ease-out 0.6s forwards; }
        .crown-shimmer {
          animation: crown-glow 2s ease-in-out infinite;
        }
        @keyframes crown-pop {
          from { transform: scale(0.4) translateY(-10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes jewel-pop {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes crown-glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px ${color}); }
          50% { filter: brightness(1.2) drop-shadow(0 0 8px ${color}); }
        }
        @media (prefers-reduced-motion: reduce) {
          .crown-group, .crown-shimmer { animation: none; }
          .crown-jewel { animation: none; opacity: 1; }
        }
      `}</style>
      <g className="crown-group crown-shimmer">
        {/* Crown body */}
        <path
          className="crown-body"
          d="M2 17L4 7L8 11L12 4L16 11L20 7L22 17H2Z"
        />
        {/* Crown base */}
        <path
          className="crown-body"
          d="M2 17H22V19C22 20 21 21 20 21H4C3 21 2 20 2 19V17Z"
        />
        {/* Jewels */}
        <circle className="crown-jewel crown-jewel-1" cx="6" cy="17" r="1.5" />
        <circle className="crown-jewel crown-jewel-2" cx="12" cy="17" r="1.5" />
        <circle className="crown-jewel crown-jewel-3" cx="18" cy="17" r="1.5" />
      </g>
    </svg>
  );
}
