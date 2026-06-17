"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)] underline underline-offset-2 transition-colors hover:text-[var(--color-burgundy)]"
    >
      Log out
    </button>
  );
}
