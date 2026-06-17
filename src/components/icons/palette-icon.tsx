"use client";

interface PaletteIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function PaletteIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: PaletteIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Studying personality"
      className={className}
    >
      <style>{`
        .palette-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: palette-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .palette-base {
          stroke: ${color};
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: palette-draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .palette-dot {
          fill: ${color};
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: dot-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .palette-dot-1 { animation-delay: 0.5s; }
        .palette-dot-2 { animation-delay: 0.6s; opacity: 0.8; }
        .palette-dot-3 { animation-delay: 0.7s; opacity: 0.6; }
        .palette-dot-4 { animation-delay: 0.8s; opacity: 0.4; }
        @keyframes palette-pop {
          from { transform: scale(0.4) rotate(-20deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes palette-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes dot-pop {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .palette-group { animation: none; }
          .palette-base { animation: none; stroke-dashoffset: 0; }
          .palette-dot { animation: none; opacity: 1; }
        }
      `}</style>
      <g className="palette-group">
        <path
          className="palette-base"
          pathLength="100"
          d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.17.05.31-.12.26-.29-.32-1.1-.13-2.02.47-2.68.24-.26.55-.46.91-.56C11.52 17.62 13 16.06 13 14c0-1.66-1.34-3-3-3s-3 1.34-3 3c0 .31.05.6.13.87-.17.11-.34.23-.49.38-.8.75-1.14 1.87-1.14 3.05 0 .18 0 .35.02.52C3.34 17.18 2 14.77 2 12 2 6.48 6.48 2 12 2z"
        />
        <circle className="palette-dot palette-dot-1" cx="17" cy="7" r="2" />
        <circle className="palette-dot palette-dot-2" cx="19" cy="12" r="1.5" />
        <circle className="palette-dot palette-dot-3" cx="17" cy="17" r="1.5" />
        <circle className="palette-dot palette-dot-4" cx="7" cy="7" r="1.5" />
      </g>
    </svg>
  );
}
