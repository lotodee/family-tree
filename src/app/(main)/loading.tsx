export default function Loading() {
  const text = "The Ademiluyis";

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="text-center">
        {/* Animated tree/branch icon */}
        <div className="relative mx-auto mb-6 h-16 w-16">
          {/* Tree trunk */}
          <div
            className="absolute bottom-0 left-1/2 h-0 w-1 -translate-x-1/2 rounded-full bg-[var(--color-burgundy)]"
            style={{
              animation: "growTrunk 0.6s ease-out forwards",
            }}
          />
          {/* Left branch */}
          <div
            className="absolute left-1/2 top-4 h-0.5 w-0 origin-right -translate-x-full rotate-[-30deg] rounded-full bg-[var(--color-burgundy)]"
            style={{
              animation: "growBranch 0.4s ease-out 0.4s forwards",
            }}
          />
          {/* Right branch */}
          <div
            className="absolute left-1/2 top-4 h-0.5 w-0 origin-left rotate-[30deg] rounded-full bg-[var(--color-burgundy)]"
            style={{
              animation: "growBranch 0.4s ease-out 0.5s forwards",
            }}
          />
          {/* Crown/leaves - gold circle */}
          <div
            className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-full bg-[var(--color-gold)]"
            style={{
              animation: "bloomCrown 0.5s ease-out 0.6s forwards",
              transform: "translateX(-50%) scale(0)",
            }}
          />
          {/* 100 in center */}
          <span
            className="absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center font-[family-name:var(--font-playfair)] text-xs font-bold text-[var(--color-burgundy)]"
            style={{
              animation: "fadeIn 0.3s ease-out 0.9s forwards",
              opacity: 0,
            }}
          >
            100
          </span>
        </div>

        {/* Animated family name */}
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

        {/* Subtle tagline */}
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
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes growTrunk {
          to { height: 2rem; }
        }
        @keyframes growBranch {
          to { width: 1rem; }
        }
        @keyframes bloomCrown {
          to { transform: translateX(-50%) scale(1); }
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
