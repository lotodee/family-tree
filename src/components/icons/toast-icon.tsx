"use client";

interface ToastIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function ToastIcon({
  size = 24,
  color = "#C4973B",
  className = "",
}: ToastIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Cheers - Toast"
      className={className}
    >
      <style>{`
        .toast-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: toast-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .glass-left {
          stroke: ${color};
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: ${color};
          fill-opacity: 0.15;
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: glass-clink-left 1.5s ease-in-out infinite;
        }
        .glass-right {
          stroke: ${color};
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: ${color};
          fill-opacity: 0.15;
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: glass-clink-right 1.5s ease-in-out infinite;
        }
        .bubbles {
          fill: ${color};
          opacity: 0;
          animation: bubble-rise 2s ease-out infinite;
        }
        .bubble-1 { animation-delay: 0s; }
        .bubble-2 { animation-delay: 0.5s; }
        .bubble-3 { animation-delay: 1s; }
        @keyframes toast-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes glass-clink-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes glass-clink-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes bubble-rise {
          0% { opacity: 0; transform: translateY(0); }
          20% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-15px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .toast-group, .glass-left, .glass-right, .bubbles { animation: none; }
        }
      `}</style>
      <g className="toast-group">
        {/* Left champagne glass */}
        <g className="glass-left">
          <path d="M4 3H10V8C10 11 8 12 7 12C6 12 4 11 4 8V3Z" />
          <line x1="7" y1="12" x2="7" y2="18" />
          <line x1="4" y1="18" x2="10" y2="18" />
        </g>
        {/* Right champagne glass */}
        <g className="glass-right">
          <path d="M14 3H20V8C20 11 18 12 17 12C16 12 14 11 14 8V3Z" />
          <line x1="17" y1="12" x2="17" y2="18" />
          <line x1="14" y1="18" x2="20" y2="18" />
        </g>
        {/* Bubbles */}
        <circle className="bubbles bubble-1" cx="6" cy="6" r="0.5" />
        <circle className="bubbles bubble-2" cx="8" cy="5" r="0.5" />
        <circle className="bubbles bubble-3" cx="16" cy="6" r="0.5" />
      </g>
    </svg>
  );
}
