import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPEG, PNG, or WebP image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate file path: avatars/{userId}/{timestamp}.{ext}
    const ext =
      file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    // Delete old avatar if exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (existingProfile?.avatar_url) {
      await supabaseAdmin.storage
        .from("avatars")
        .remove([existingProfile.avatar_url]);
    }

    // Upload new avatar
    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image. Please try again." },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update profile with avatar URL
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Image uploaded but failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatarUrl: filePath,
      publicUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
