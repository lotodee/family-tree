import { NextRequest } from "next/server";
import { generateContentStream } from "@/lib/gemini/client";
import { SYSTEM_INSTRUCTION } from "@/lib/gemini/prompts";
import {
  buildContextForSubject,
  buildContextForMultipleSubjects,
  buildFamilySummaryContext,
} from "@/lib/gemini/context";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { prompt, subjectIds } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Build context
    let context: string;

    if (subjectIds && subjectIds.length > 0) {
      if (subjectIds.length === 1) {
        const result = await buildContextForSubject(subjectIds[0]);
        context = result.contextText;
      } else {
        context = await buildContextForMultipleSubjects(subjectIds);
      }
    } else {
      // No specific subjects — use family summary
      context = await buildFamilySummaryContext();
    }

    // 2. Build the full prompt
    const fullPrompt = `FAMILY DATA:\n${context}\n\n---\n\nHOST'S REQUEST:\n${prompt}`;

    // 3. Start streaming generation
    const result = await generateContentStream(fullPrompt, SYSTEM_INSTRUCTION);

    // 4. Create a ReadableStream for SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = "";

          for await (const chunk of result) {
            const text = chunk.text || "";
            if (text) {
              fullText += text;
              // Send each chunk as an SSE event
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text, done: false })}\n\n`
                )
              );
            }
          }

          // Send completion signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: "", done: true })}\n\n`
            )
          );

          // 5. Save the session to the database (non-blocking)
          supabaseAdmin
            .from("llm_sessions")
            .insert({
              prompt,
              response_text: fullText,
              subjects: subjectIds || [],
            })
            .then(({ error }) => {
              if (error) console.error("Failed to save LLM session:", error);
            });

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Generation failed. Please try again.", done: true })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("LLM generate error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
