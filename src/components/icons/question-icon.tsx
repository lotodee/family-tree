"use client";

interface QuestionIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function QuestionIcon({
  size = 24,
  color = "#C4973B",
  className = "",
}: QuestionIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="What if"
      className={className}
    >
      <style>{`
        .question-group {
          transform-box: fill-box;
          transform-origin: center;
          animation: question-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .question-circle {
          stroke: ${color};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .question-mark {
          stroke: ${color};
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: question-draw 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
        }
        .question-dot {
          fill: ${color};
          opacity: 0;
          animation: dot-appear 0.3s ease-out 0.6s forwards;
        }
        .question-float {
          animation: question-float 2s ease-in-out infinite;
        }
        @keyframes question-pop {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes question-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes dot-appear {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes question-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .question-group, .question-float { animation: none; }
          .question-mark { animation: none; stroke-dashoffset: 0; }
          .question-dot { animation: none; opacity: 1; }
        }
      `}</style>
      <g className="question-group question-float">
        <circle className="question-circle" cx="12" cy="12" r="10" />
        <path
          className="question-mark"
          pathLength="100"
          d="M9 9C9 7.5 10.5 6 12 6C13.5 6 15 7.5 15 9C15 10.5 13.5 11 12 12V14"
        />
        <circle className="question-dot" cx="12" cy="17" r="1.5" />
      </g>
    </svg>
  );
}
