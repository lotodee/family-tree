"use client";

interface BookOpenIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function BookOpenIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: BookOpenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Reading family stories"
      className={className}
    >
      <style>{`
        .book-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: book-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .book-path {
          stroke: ${color};
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: book-draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .book-path-2 { animation-delay: 0.35s; }
        .book-path-3 { animation-delay: 0.5s; }
        @keyframes book-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes book-draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .book-group { animation: none; }
          .book-path { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <g className="book-group">
        <path
          className="book-path"
          pathLength="100"
          d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
        />
        <path
          className="book-path book-path-2"
          pathLength="100"
          d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        />
        <path
          className="book-path book-path-3"
          pathLength="100"
          d="M6 8h2M6 12h2M16 8h2M16 12h2"
        />
      </g>
    </svg>
  );
}
