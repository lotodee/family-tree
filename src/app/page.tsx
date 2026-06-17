import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <main className="flex max-w-xl flex-col items-center gap-8 text-center">
        {/* Hero Heading */}
        <h1 className="animate-fade-in-up font-[family-name:var(--font-playfair)] text-4xl font-bold text-[var(--color-burgundy)] md:text-5xl lg:text-6xl">
          Grandpa Michael is 100!
        </h1>

        {/* Subheading */}
        <p className="animate-fade-in-up animate-delay-100 font-[family-name:var(--font-dm-sans)] text-lg text-[var(--color-text-secondary)] md:text-xl">
          Join us in celebrating a century of love, wisdom, and family
        </p>

        {/* Date Badge */}
        <div className="animate-fade-in-up animate-delay-200 flex items-center gap-4">
          <span className="h-px w-8 bg-[var(--color-gold)]" />
          <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--color-gold)] md:text-2xl">
            March 14, 2026
          </span>
          <span className="h-px w-8 bg-[var(--color-gold)]" />
        </div>

        {/* Description */}
        <p className="animate-fade-in-up animate-delay-300 max-w-md font-[family-name:var(--font-dm-sans)] text-base leading-relaxed text-[var(--color-text-primary)]">
          Share your favourite memories, answer fun questions, and help us
          create something unforgettable for Grandpa&apos;s big day. Your
          stories will come alive at the celebration.
        </p>

        {/* CTA Button */}
        <Link
          href="/register"
          className="animate-fade-in-up animate-delay-400 inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--color-gold)] px-10 py-4 font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-[var(--color-text-primary)] shadow-lg transition-all hover:bg-[var(--color-gold-light)] hover:shadow-xl active:scale-[0.98]"
        >
          Join the Family Tree
        </Link>

        {/* Login Link */}
        <p className="animate-fade-in-up animate-delay-500 font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)]">
          Already joined?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--color-burgundy)] underline underline-offset-2 transition-colors hover:text-[var(--color-burgundy-light)]"
          >
            Log in here
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="animate-fade-in-up animate-delay-500 mt-16">
        <p className="font-[family-name:var(--font-dm-sans)] text-xs text-[var(--color-text-secondary)]">
          Made with love for the family
        </p>
      </footer>
    </div>
  );
}
