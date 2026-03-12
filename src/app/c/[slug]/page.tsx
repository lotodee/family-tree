import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CelebrationHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: celebration } = await supabase
    .from("celebrations")
    .select("name, event_date, description")
    .eq("slug", slug)
    .single();

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <Link
        href="/dashboard"
        className="text-sm mb-4 inline-block"
        style={{ color: "var(--color-text-secondary)" }}
      >
        ← Dashboard
      </Link>

      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
      >
        {celebration?.name || "Celebration"}
      </h1>

      {celebration?.event_date && (
        <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
          {new Date(celebration.event_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      {celebration?.description && (
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          {celebration.description}
        </p>
      )}

      <div className="flex flex-col gap-3 mt-8">
        <Link
          href={`/c/${slug}/record`}
          className="px-6 py-4 rounded-xl text-center font-medium"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-text-primary)",
          }}
        >
          Record a Video Message
        </Link>

        <Link
          href={`/c/${slug}/write`}
          className="px-6 py-4 rounded-xl text-center font-medium"
          style={{
            border: "1.5px solid var(--color-gold)",
            color: "var(--color-gold)",
          }}
        >
          Write a Letter
        </Link>

        <Link
          href={`/c/${slug}/manage`}
          className="px-6 py-4 rounded-xl text-center font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Manage Celebration →
        </Link>
      </div>
    </div>
  );
}
