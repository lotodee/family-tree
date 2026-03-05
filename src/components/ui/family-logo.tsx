interface FamilyLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md";
}

export function FamilyLogo({ showTagline = true, size = "md" }: FamilyLogoProps) {
  const text = "The Ademiluyis";
  const isSmall = size === "sm";

  return (
    <div className={isSmall ? "" : "text-center"}>
      {/* Animated logo with roof on top of "1" + 00 */}
      <div className={`relative flex items-end justify-center gap-0.5 ${isSmall ? "mb-0" : "mx-auto mb-6"}`}>
        {/* The "1" with roof on top */}
        <div className="relative flex flex-col items-center">
          {/* Roof / Hypotenuse on top of the 1 */}
          <div className={`relative mb-0.5 ${isSmall ? "h-2 w-4" : "h-4 w-8"}`}>
            {/* Left roof slant */}
            <div
              className={`absolute left-1/2 h-0.5 w-0 origin-right -translate-x-full rotate-[-35deg] rounded-full bg-[var(--color-burgundy)] ${isSmall ? "top-1" : "top-2"}`}
              style={{
                animation: isSmall ? "growBranchSm 0.4s ease-out forwards" : "growBranch 0.4s ease-out forwards",
              }}
            />
            {/* Right roof slant */}
            <div
              className={`absolute left-1/2 h-0.5 w-0 origin-left rotate-[35deg] rounded-full bg-[var(--color-burgundy)] ${isSmall ? "top-1" : "top-2"}`}
              style={{
                animation: isSmall ? "growBranchSm 0.4s ease-out 0.1s forwards" : "growBranch 0.4s ease-out 0.1s forwards",
              }}
            />
          </div>
          {/* The "1" - vertical stick */}
          <div
            className={`h-0 rounded-full bg-[var(--color-burgundy)] ${isSmall ? "w-1" : "w-1.5"}`}
            style={{
              animation: isSmall ? "growStickSm 0.5s ease-out 0.2s forwards" : "growStick 0.5s ease-out 0.2s forwards",
            }}
          />
        </div>
        {/* First "0" - gold circle */}
        <div
          className={`rounded-full border-[var(--color-gold)] bg-transparent ${isSmall ? "h-4 w-4 border-2" : "h-8 w-8 border-[3px]"}`}
          style={{
            animation: "popCircle 0.4s ease-out 0.4s forwards",
            transform: "scale(0)",
          }}
        />
        {/* Second "0" - gold circle */}
        <div
          className={`rounded-full border-[var(--color-gold)] bg-transparent ${isSmall ? "h-4 w-4 border-2" : "h-8 w-8 border-[3px]"}`}
          style={{
            animation: "popCircle 0.4s ease-out 0.6s forwards",
            transform: "scale(0)",
          }}
        />
      </div>

      {/* Animated family name - hide for small size */}
      {!isSmall && (
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[var(--color-burgundy)]">
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              animation: `letterReveal 0.1s ease-out ${0.8 + i * 0.05}s forwards`,
              opacity: 0,
              transform: "translateY(10px)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      )}

      {/* Subtle tagline - only show when showTagline is true and not small */}
      {showTagline && !isSmall && (
        <>
          <p
            className="mt-2 text-sm text-[var(--color-text-secondary)]"
            style={{
              animation: "fadeIn 0.5s ease-out 1.5s forwards",
              opacity: 0,
            }}
          >
            Gathering the family...
          </p>

          {/* Pulsing dots */}
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]"
                style={{
                  animation: `pulse 1s ease-in-out ${1.5 + i * 0.15}s infinite`,
                  opacity: 0.4,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes growBranch {
          to { width: 1.5rem; }
        }
        @keyframes growBranchSm {
          to { width: 0.75rem; }
        }
        @keyframes growStick {
          to { height: 2rem; }
        }
        @keyframes growStickSm {
          to { height: 1rem; }
        }
        @keyframes popCircle {
          to { transform: scale(1); }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes letterReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}
