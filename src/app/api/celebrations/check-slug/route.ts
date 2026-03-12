import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug || slug.length < 3) {
      return NextResponse.json(
        { error: "Slug must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const { data: existingCelebration } = await supabaseAdmin
      .from("celebrations")
      .select("id")
      .eq("slug", slug)
      .single();

    return NextResponse.json({
      available: !existingCelebration,
      slug,
    });
  } catch (error) {
    console.error("Check slug error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
