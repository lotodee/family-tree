"use client";

interface NigeriaFlagIconProps {
  size?: number;
  className?: string;
}

export function NigeriaFlagIcon({
  size = 32,
  className = "",
}: NigeriaFlagIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Nigerian flavor"
      className={className}
    >
      <style>{`
        .flag-group {
          transform-box: fill-box;
          transform-origin: left center;
          animation: flag-wave 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .flag-stripe {
          opacity: 0;
          animation: stripe-reveal 0.3s ease-out forwards;
        }
        .flag-green-left { animation-delay: 0.2s; }
        .flag-white { animation-delay: 0.35s; }
        .flag-green-right { animation-delay: 0.5s; }
        .flag-pole {
          stroke: #C4973B;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: pole-draw 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .flag-flutter {
          transform-box: fill-box;
          transform-origin: left center;
          animation: flutter 1.5s ease-in-out infinite;
        }
        @keyframes flag-wave {
          from { transform: scale(0.4) rotate(-10deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes stripe-reveal {
          from { opacity: 0; transform: scaleX(0); }
          to { opacity: 1; transform: scaleX(1); }
        }
        @keyframes pole-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes flutter {
          0%, 100% { transform: skewY(0deg); }
          25% { transform: skewY(1deg); }
          75% { transform: skewY(-1deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .flag-group, .flag-flutter { animation: none; }
          .flag-stripe { animation: none; opacity: 1; }
          .flag-pole { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <g className="flag-group">
        <line className="flag-pole" pathLength="100" x1="4" y1="3" x2="4" y2="21" />
        <g className="flag-flutter">
          {/* Green stripe left */}
          <rect
            className="flag-stripe flag-green-left"
            x="5"
            y="4"
            width="5"
            height="12"
            rx="0.5"
            fill="#008751"
          />
          {/* White stripe center */}
          <rect
            className="flag-stripe flag-white"
            x="10"
            y="4"
            width="5"
            height="12"
            rx="0"
            fill="#FFFFFF"
          />
          {/* Green stripe right */}
          <rect
            className="flag-stripe flag-green-right"
            x="15"
            y="4"
            width="5"
            height="12"
            rx="0.5"
            fill="#008751"
          />
        </g>
      </g>
    </svg>
  );
}
