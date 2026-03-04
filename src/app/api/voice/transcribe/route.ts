import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getDeepgramClient } from "@/lib/deepgram/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { voicePath } = body;

    if (!voicePath) {
      return NextResponse.json(
        { error: "Voice path required" },
        { status: 400 }
      );
    }

    // Download audio from storage
    const { data: audioData, error: downloadError } = await supabaseAdmin.storage
      .from("voice-recordings")
      .download(voicePath);

    if (downloadError || !audioData) {
      console.error("Audio download error:", downloadError);
      return NextResponse.json(
        { error: "Failed to download audio" },
        { status: 500 }
      );
    }

    // Convert Blob to Buffer
    const arrayBuffer = await audioData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine MIME type from file extension
    const mimeType = voicePath.endsWith(".mp4")
      ? "audio/mp4"
      : "audio/webm";

    // Send to Deepgram for transcription
    const deepgram = getDeepgramClient();
    const { result, error: transcriptionError } =
      await deepgram.listen.prerecorded.transcribeFile(buffer, {
        model: "nova-2",
        smart_format: true,
        punctuate: true,
        mimetype: mimeType,
      });

    if (transcriptionError) {
      console.error("Transcription error:", transcriptionError);
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 500 }
      );
    }

    // Extract transcript
    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "No speech detected. Please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcription: transcript });
  } catch (error) {
    console.error("Transcribe API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
