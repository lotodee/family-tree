"use client";

interface ThoughtBubbleIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function ThoughtBubbleIcon({
  size = 32,
  color = "#C4973B",
  className = "",
}: ThoughtBubbleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Imagining scene"
      className={className}
    >
      <style>{`
        .thought-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: thought-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .thought-bubble {
          stroke: ${color};
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: thought-draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .thought-dot {
          fill: ${color};
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: thought-dot-float 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .thought-dot-1 { animation-delay: 0.6s; }
        .thought-dot-2 { animation-delay: 0.75s; }
        .thought-cloud {
          transform-box: fill-box;
          transform-origin: center;
          animation: thought-breathe 2s ease-in-out infinite;
        }
        @keyframes thought-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes thought-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes thought-dot-float {
          from { transform: scale(0) translateY(5px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes thought-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @media (prefers-reduced-motion: reduce) {
          .thought-group, .thought-cloud { animation: none; }
          .thought-bubble { animation: none; stroke-dashoffset: 0; }
          .thought-dot { animation: none; opacity: 1; }
        }
      `}</style>
      <g className="thought-group">
        <g className="thought-cloud">
          <path
            className="thought-bubble"
            pathLength="100"
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
          />
        </g>
        <circle className="thought-dot thought-dot-1" cx="8" cy="19" r="1" />
        <circle className="thought-dot thought-dot-2" cx="5" cy="21" r="0.7" />
      </g>
    </svg>
  );
}
