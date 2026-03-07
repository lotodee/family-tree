interface WandIconProps {
  size?: number;
  className?: string;
}

export function WandIcon({
  size = 24,
  className = "",
}: WandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="AI Wand"
      className={className}
    >
      {/* Wand body */}
      <path
        d="M3 21L10 14M21 3L14 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 14L14 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Sparkles */}
      <circle cx="18" cy="6" r="1.5" fill="currentColor" className="animate-pulse" />
      <circle cx="15" cy="4" r="1" fill="currentColor" className="animate-pulse [animation-delay:0.3s]" />
      <circle cx="20" cy="9" r="1" fill="currentColor" className="animate-pulse [animation-delay:0.6s]" />
    </svg>
  );
}
