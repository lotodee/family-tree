import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/playground/prefetch
 *
 * Fetches ALL family data in parallel for client-side caching.
 * Returns: { nodes, answers, questions }
 */
export async function GET() {
  console.log("\x1b[36m[TEMP] 🔍 Prefetch API called\x1b[0m");

  try {
    // Fetch all data in parallel for speed
    const [nodesResult, answersResult, questionsResult] = await Promise.all([
      // All tree nodes ordered by generation and branch
      supabaseAdmin
        .from("family_tree_nodes")
        .select("*")
        .order("generation", { ascending: true })
        .order("branch", { ascending: true }),

      // All confirmed answers with respondent name and question details joined
      supabaseAdmin
        .from("answers")
        .select(`
          id,
          respondent_id,
          subject_id,
          question_id,
          answer_text,
          voice_url,
          raw_transcription,
          input_method,
          is_confirmed,
          respondent:respondent_id(full_name),
          question:question_id(text, category, type)
        `)
        .eq("is_confirmed", true),

      // All active questions
      supabaseAdmin
        .from("questions")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
    ]);

    // Check for errors
    if (nodesResult.error) {
      console.log("\x1b[31m[TEMP] ❌ Nodes fetch failed:", nodesResult.error.message, "\x1b[0m");
      throw nodesResult.error;
    }
    if (answersResult.error) {
      console.log("\x1b[31m[TEMP] ❌ Answers fetch failed:", answersResult.error.message, "\x1b[0m");
      throw answersResult.error;
    }
    if (questionsResult.error) {
      console.log("\x1b[31m[TEMP] ❌ Questions fetch failed:", questionsResult.error.message, "\x1b[0m");
      throw questionsResult.error;
    }

    // Flatten the answer joins into a simple structure (Maps don't serialize to JSON)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers = (answersResult.data || []).map((a: any) => ({
      id: a.id,
      respondent_id: a.respondent_id,
      respondent_name: a.respondent?.full_name || "Unknown",
      subject_id: a.subject_id,
      question_id: a.question_id,
      question_text: a.question?.text || "",
      question_category: a.question?.category || "general",
      question_type: a.question?.type || "self",
      answer_text: a.answer_text,
      voice_url: a.voice_url,
      raw_transcription: a.raw_transcription,
      input_method: a.input_method,
      is_confirmed: a.is_confirmed,
    }));

    console.log(
      "\x1b[32m[TEMP] ✅ Prefetch successful:",
      JSON.stringify({
        nodes: nodesResult.data?.length || 0,
        answers: answers.length,
        questions: questionsResult.data?.length || 0,
      }),
      "\x1b[0m"
    );

    return NextResponse.json({
      nodes: nodesResult.data,
      answers,
      questions: questionsResult.data,
    });
  } catch (error) {
    console.log("\x1b[31m[TEMP] ❌ Prefetch failed:", error, "\x1b[0m");
    return NextResponse.json(
      { error: "Failed to load family data" },
      { status: 500 }
    );
  }
}
