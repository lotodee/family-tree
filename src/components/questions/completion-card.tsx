"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { PartyPopper, Users, RotateCcw } from "lucide-react";

interface CompletionCardProps {
  onTalkAboutOthers: () => void;
  onReviewAnswers: () => void;
}

export function CompletionCard({
  onTalkAboutOthers,
  onReviewAnswers,
}: CompletionCardProps) {
  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#C4973B", "#6B1D2A", "#E8D5A3"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#C4973B", "#6B1D2A", "#E8D5A3"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--color-gold)] bg-gradient-to-b from-[var(--color-ivory)] to-[var(--color-gold-light)]/20 p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold)]">
        <PartyPopper className="h-8 w-8 text-white" />
      </div>

      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[var(--color-burgundy)]">
        You did it!
      </h2>

      <p className="mt-3 max-w-sm text-[var(--color-text-secondary)]">
        You&apos;ve answered all 10 questions about yourself. Your stories will
        come alive at Grandpa&apos;s celebration on March 14th.
      </p>

      <div className="mt-6 flex w-full flex-col gap-3">
        <button
          onClick={onTalkAboutOthers}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-burgundy)] px-6 py-3 font-medium text-white transition-all hover:bg-[var(--color-burgundy)]/90"
        >
          <Users className="h-5 w-5" />
          Talk About Family Members
        </button>

        <button
          onClick={onReviewAnswers}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-gold)] px-6 py-3 font-medium text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)]/10"
        >
          <RotateCcw className="h-5 w-5" />
          Review My Answers
        </button>
      </div>
    </div>
  );
}
