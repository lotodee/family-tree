"use client";

interface MasksIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function MasksIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: MasksIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Crafting response"
      className={className}
    >
      <style>{`
        .masks-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: masks-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .mask-happy {
          stroke: ${color};
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: masks-draw 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .mask-drama {
          stroke: ${color};
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: masks-draw 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
          opacity: 0.7;
        }
        @keyframes masks-pop {
          from { transform: scale(0.4) rotate(-10deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes masks-draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .masks-group { animation: none; }
          .mask-happy, .mask-drama { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <g className="masks-group">
        {/* Happy mask */}
        <path
          className="mask-happy"
          pathLength="100"
          d="M4 8C4 5.5 6 3 9 3C12 3 14 5.5 14 8C14 10.5 12 13 9 13C6 13 4 10.5 4 8Z"
        />
        <circle className="mask-happy" pathLength="100" cx="7" cy="7" r="1" fill={color} />
        <circle className="mask-happy" pathLength="100" cx="11" cy="7" r="1" fill={color} />
        <path className="mask-happy" pathLength="100" d="M6.5 10C7 11 8 11.5 9 11.5C10 11.5 11 11 11.5 10" />
        {/* Drama mask */}
        <path
          className="mask-drama"
          pathLength="100"
          d="M10 16C10 13.5 12 11 15 11C18 11 20 13.5 20 16C20 18.5 18 21 15 21C12 21 10 18.5 10 16Z"
        />
        <circle className="mask-drama" pathLength="100" cx="13" cy="15" r="1" fill={color} />
        <circle className="mask-drama" pathLength="100" cx="17" cy="15" r="1" fill={color} />
        <path className="mask-drama" pathLength="100" d="M12.5 19C13 18 14 17.5 15 17.5C16 17.5 17 18 17.5 19" />
      </g>
    </svg>
  );
}
