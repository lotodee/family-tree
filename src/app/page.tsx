import Link from "next/link";
import { Users, Video, PartyPopper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { InvitePaste } from "@/components/ui/invite-paste";

const features = [
  {
    icon: Users,
    title: "Build Your Tree",
    description: "Create a beautiful family tree and invite everyone to join.",
  },
  {
    icon: Video,
    title: "Collect Messages",
    description: "Gather heartfelt video messages and letters from loved ones.",
  },
  {
    icon: PartyPopper,
    title: "Celebrate Together",
    description: "Bring it all together for an unforgettable celebration day.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[var(--color-burgundy)]"
        >
          Celebrate Together
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-[var(--color-burgundy)] hover:underline"
            >
              Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-burgundy)]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[var(--color-gold)] px-4 py-2 font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gold-light)]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 pt-12 pb-12 text-center">
        <h1 className="animate-fade-in-up font-[family-name:var(--font-playfair)] text-4xl font-bold text-[var(--color-burgundy)] md:text-5xl lg:text-6xl">
          Celebrate Together
        </h1>

        <p className="animate-fade-in-up animation-delay-100 mt-4 max-w-md font-[family-name:var(--font-dm-sans)] text-lg text-[var(--color-text-secondary)] md:text-xl">
          Create celebrations, build your family tree, and collect precious
          memories from everyone you love.
        </p>

        {/* CTA Button */}
        <div className="animate-fade-in-up animation-delay-200 mt-8">
          <Link
            href="/create"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-[var(--color-gold)] px-8 py-4 font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-[var(--color-text-primary)] shadow-lg transition-all hover:bg-[var(--color-gold-light)] hover:shadow-xl active:scale-[0.98]"
          >
            Create a Celebration
          </Link>
        </div>

        {/* Or Divider */}
        <div className="animate-fade-in-up animation-delay-300 flex items-center gap-4 w-full max-w-xs mx-auto my-8">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-gold-light)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-gold-light)" }} />
        </div>

        {/* Invite Paste */}
        <div className="animate-fade-in-up animation-delay-400 w-full">
          <InvitePaste />
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in-up rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-ivory)] p-6 text-center shadow-sm"
              style={{
                animationDelay: `${300 + index * 100}ms`,
              }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-gold-light)]">
                <feature.icon className="h-7 w-7 text-[var(--color-burgundy)]" />
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--color-text-primary)]">
                {feature.title}
              </h3>
              <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-8 text-center">
        <p className="font-[family-name:var(--font-dm-sans)] text-xs text-[var(--color-text-secondary)]">
          Bring your family together
        </p>
      </footer>
    </div>
  );
}
