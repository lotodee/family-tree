import { createClient } from "@/lib/supabase/client";

/**
 * Creates a signed URL for a video in Supabase Storage.
 * The URL expires after 1 hour.
 * Must be called client-side (uses the browser Supabase client).
 */
export async function getSignedVideoUrl(filePath: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("videos")
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }
  return data.signedUrl;
}

/**
 * Formats seconds as "M:SS"
 * 65 → "1:05", 600 → "10:00", 0 → "0:00"
 */
export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
