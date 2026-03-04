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

    const body = await request.json();
    const {
      subjectId,
      questionId,
      answerText,
      inputMethod,
      voiceUrl,
      rawTranscription,
    } = body;

    if (!subjectId || !questionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert answer (handles both create and update for same question/subject)
    const { data: answer, error } = await supabaseAdmin
      .from("answers")
      .upsert(
        {
          respondent_id: user.id,
          subject_id: subjectId,
          question_id: questionId,
          answer_text: answerText || null,
          input_method: inputMethod || "text",
          voice_url: voiceUrl || null,
          raw_transcription: rawTranscription || null,
          status: "confirmed",
          is_confirmed: true,
        },
        {
          onConflict: "respondent_id,subject_id,question_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Answer save error:", error);
      return NextResponse.json(
        { error: "Failed to save answer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Answers API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answerId, answerText, voiceUrl, rawTranscription } = body;

    if (!answerId) {
      return NextResponse.json(
        { error: "Answer ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("answers")
      .select("respondent_id")
      .eq("id", answerId)
      .single();

    if (!existing || existing.respondent_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (answerText !== undefined) updateData.answer_text = answerText;
    if (voiceUrl !== undefined) updateData.voice_url = voiceUrl;
    if (rawTranscription !== undefined)
      updateData.raw_transcription = rawTranscription;

    const { data: answer, error } = await supabaseAdmin
      .from("answers")
      .update(updateData)
      .eq("id", answerId)
      .select()
      .single();

    if (error) {
      console.error("Answer update error:", error);
      return NextResponse.json(
        { error: "Failed to update answer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Answers PUT error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const answerId = searchParams.get("answerId");

    if (!answerId) {
      return NextResponse.json(
        { error: "Answer ID required" },
        { status: 400 }
      );
    }

    // Fetch answer to verify ownership and get voice_url
    const { data: existing } = await supabaseAdmin
      .from("answers")
      .select("respondent_id, voice_url")
      .eq("id", answerId)
      .single();

    if (!existing || existing.respondent_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Delete voice file from storage if exists
    if (existing.voice_url) {
      const path = existing.voice_url.split("/voice-recordings/")[1];
      if (path) {
        await supabaseAdmin.storage.from("voice-recordings").remove([path]);
      }
    }

    // Delete answer
    const { error } = await supabaseAdmin
      .from("answers")
      .delete()
      .eq("id", answerId);

    if (error) {
      console.error("Answer delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete answer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Answers DELETE error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
