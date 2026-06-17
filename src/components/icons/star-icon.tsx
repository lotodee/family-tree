"use client";

interface StarIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function StarIcon({
  size = 24,
  color = "#C4973B",
  className = "",
}: StarIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Star"
      className={className}
    >
      <style>{`
        .star-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: star-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .star-path {
          fill: ${color};
          stroke: ${color};
          stroke-width: 1;
          stroke-linejoin: round;
        }
        .star-glow {
          animation: star-twinkle 2s ease-in-out infinite;
        }
        @keyframes star-pop {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes star-twinkle {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px ${color}); }
          50% { filter: brightness(1.3) drop-shadow(0 0 6px ${color}); }
        }
        @media (prefers-reduced-motion: reduce) {
          .star-group, .star-glow { animation: none; }
        }
      `}</style>
      <g className="star-group star-glow">
        <path
          className="star-path"
          d="M12 2L14.09 8.26L20.8 9.27L15.9 14.14L17.18 20.86L12 18L6.82 20.86L8.1 14.14L3.2 9.27L9.91 8.26L12 2Z"
        />
      </g>
    </svg>
  );
}
