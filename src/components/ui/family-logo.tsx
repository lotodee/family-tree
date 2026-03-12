interface FamilyLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md";
}

export function FamilyLogo({ showTagline = true, size = "md" }: FamilyLogoProps) {
  const isSmall = size === "sm";

  return (
    <div className={isSmall ? "" : "text-center"}>
      {/* Animated tree/heart logo */}
      <div
        className={`flex items-center justify-center ${isSmall ? "" : "mx-auto mb-4"}`}
      >
        <div
          className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-burgundy)] to-[var(--color-burgundy-light)] ${
            isSmall ? "h-8 w-8" : "h-14 w-14"
          }`}
          style={{
            animation: "popIn 0.4s ease-out forwards",
            transform: "scale(0)",
          }}
        >
          {/* Simple tree icon made with divs */}
          <div className="relative">
            {/* Tree branches */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 ${
                isSmall ? "-top-1 h-2 w-3" : "-top-1.5 h-3 w-5"
              }`}
            >
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-[var(--color-gold)] ${
                  isSmall ? "w-1.5" : "w-2.5"
                }`}
                style={{
                  transform: "rotate(-35deg)",
                  transformOrigin: "right center",
                  animation: "growBranch 0.3s ease-out 0.3s forwards",
                  width: 0,
                }}
              />
              <div
                className={`absolute bottom-0 right-0 h-0.5 bg-[var(--color-gold)] ${
                  isSmall ? "w-1.5" : "w-2.5"
                }`}
                style={{
                  transform: "rotate(35deg)",
                  transformOrigin: "left center",
                  animation: "growBranch 0.3s ease-out 0.4s forwards",
                  width: 0,
                }}
              />
            </div>
            {/* Tree trunk */}
            <div
              className={`rounded-sm bg-[var(--color-gold)] ${
                isSmall ? "h-3 w-0.5" : "h-5 w-1"
              }`}
              style={{
                animation: "growTrunk 0.4s ease-out 0.2s forwards",
                height: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Platform name - only show for medium size */}
      {!isSmall && (
        <h1
          className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[var(--color-burgundy)]"
          style={{
            animation: "fadeIn 0.5s ease-out 0.6s forwards",
            opacity: 0,
          }}
        >
          Celebrate Together
        </h1>
      )}

      {/* Subtle tagline - only show when showTagline is true and not small */}
      {showTagline && !isSmall && (
        <>
          <p
            className="mt-2 text-sm text-[var(--color-text-secondary)]"
            style={{
              animation: "fadeIn 0.5s ease-out 0.8s forwards",
              opacity: 0,
            }}
          >
            Bringing families closer
          </p>

          {/* Pulsing dots */}
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]"
                style={{
                  animation: `pulse 1s ease-in-out ${1 + i * 0.15}s infinite`,
                  opacity: 0.4,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes popIn {
          to { transform: scale(1); }
        }
        @keyframes growBranch {
          to { width: 100%; }
        }
        @keyframes growTrunk {
          to { height: ${isSmall ? "0.75rem" : "1.25rem"}; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
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
